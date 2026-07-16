"use client"

import { useState, useRef, useEffect } from "react"
import { Terminal as TerminalIcon, ChevronUp, ChevronDown } from "lucide-react"
import {
  submitScore,
  getLeaderboard,
  type ScoreEntry,
} from "@/app/actions/leaderboard"


type Command = {
  // null = system output with no echoed prompt line (staged script output)
  input: string | null
  output: React.ReactNode
}

// Documented commands shown by `help` (the secret.sh easter egg stays hidden)
const COMMANDS: { cmd: string; desc: string }[] = [
  { cmd: "help", desc: "Show this help menu" },
  { cmd: "whoami", desc: "Print developer identity" },
  { cmd: "skills", desc: "List technical skill areas" },
  { cmd: "ls", desc: "List files in the current directory" },
  { cmd: "cat <file>", desc: "Print a file's contents" },
  { cmd: "echo <message>", desc: "Print text back to the screen" },

  { cmd: "pwd", desc: "Print the working directory" },
  { cmd: "clear", desc: "Clear the terminal screen" },
]

const MAX_ATTEMPTS = 8

/** 4 unique digits, e.g. "4027". */
function generateCode(): string {
  const d = [..."0123456789"]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[d[i], d[j]] = [d[j], d[i]]
  }
  return d.slice(0, 4).join("")
}

/** Mastermind scoring: bulls = right digit right place, cows = right digit wrong place. */
function scoreGuess(code: string, guess: string): { bulls: number; cows: number } {
  let bulls = 0
  const codeRest: string[] = []
  const guessRest: string[] = []
  for (let i = 0; i < 4; i++) {
    if (guess[i] === code[i]) bulls++
    else {
      codeRest.push(code[i])
      guessRest.push(guess[i])
    }
  }
  let cows = 0
  for (const g of guessRest) {
    const idx = codeRest.indexOf(g)
    if (idx !== -1) {
      cows++
      codeRest.splice(idx, 1)
    }
  }
  return { bulls, cows }
}

function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}

function ScoreTable({ top, highlightId }: { top: ScoreEntry[]; highlightId?: number }) {
  if (top.length === 0) return <div className="text-zinc-500">no scores yet — you could be first</div>
  return (
    <div className="mt-1">
      <div className="text-zinc-500">== HALL OF FAME ==</div>
      {top.map((s, i) => (
        <div
          key={s.id}
          className={s.id === highlightId ? "text-green-400" : "text-zinc-400"}
        >
          {`${String(i + 1).padStart(2, " ")}. ${s.name.padEnd(20, " ")} ${s.attempts}/${MAX_ATTEMPTS} tries  ${formatTime(s.timeMs)}`}
          {s.id === highlightId ? "  ← you" : ""}
        </div>
      ))}
    </div>
  )
}

type GameState = { code: string; attemptsLeft: number; startedAt: number }
type PendingScore = { attempts: number; timeMs: number }

interface TerminalProps {
  username?: string
  role?: string
  skills?: string[]
  name?: string
}

export function Terminal({
  username = "excel_viryan",
  role = "AI/ML Engineer & IoT Builder",
  skills = ["Python, TypeScript", "Next.js, React, Laravel", "YOLOv8, Computer Vision, NLP", "ESP32, Arduino, MQTT"],
  name = "excelviryan",
}: TerminalProps) {
  const [history, setHistory] = useState<Command[]>([
    {
      input: "whoami",
      output: `${username} - ${role}`
    },
    {
      input: "cat skills.txt",
      output: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {skills.map((s, i) => (
            <div key={i}>- {s}</div>
          ))}
        </div>
      )
    }
  ])
  const [input, setInput] = useState("")
  const [game, setGame] = useState<GameState | null>(null)
  const [pendingScore, setPendingScore] = useState<PendingScore | null>(null)

  // Shell command history for ↑/↓ recall (bash-style). `histIndex` points into
  // it; `cmdHistory.length` means "current line" (nothing recalled).
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIndex, setHistIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Staged-output timers (secret.sh intro) — cleared on unmount
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Auto-scroll ONLY the terminal body to the bottom when history changes
  // (a command was submitted / new output rendered). It scrolls the container
  // directly — never the page — and because it depends on `history`, not
  // `input`, it does not fire on keystrokes, so the view stays put while typing.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const append = (entry: Command) => setHistory((prev) => [...prev, entry])
  const stage = (delay: number, entry: Command) => {
    timersRef.current.push(setTimeout(() => append(entry), delay))
  }

  /** `./secret.sh` — staged "hack" intro, then the game arms itself. */
  const startGame = () => {
    stage(350, { input: null, output: <span className="text-zinc-500">Bypassing firewall ............ OK</span> })
    stage(700, { input: null, output: <span className="text-zinc-500">Decrypting vault index ........ OK</span> })
    stage(1100, {
      input: null,
      output: (
        <div className="mt-1">
          <div className="text-red-400 font-bold">VAULT LOCKED — 4-digit access code required</div>
          <div className="mt-1 text-zinc-400">
            The code has 4 unique digits (0–9). Guess it. After each try:
          </div>
          <div className="ml-2 text-zinc-400">
            <div><span className="text-green-400">✓</span> right digit, right place</div>
            <div><span className="text-yellow-400">~</span> right digit, wrong place</div>
          </div>
          <div className="mt-1 text-zinc-400">
            {MAX_ATTEMPTS} attempts. Type a 4-digit code, or{" "}
            <span className="text-zinc-300">exit</span> to give up.
          </div>
        </div>
      ),
    })
    timersRef.current.push(
      setTimeout(
        () => setGame({ code: generateCode(), attemptsLeft: MAX_ATTEMPTS, startedAt: Date.now() }),
        1100,
      ),
    )
  }

  const handleGuess = (raw: string, g: GameState) => {
    const guess = raw.trim()
    if (["exit", "quit", "abort"].includes(guess.toLowerCase())) {
      setGame(null)
      append({ input: raw, output: <span className="text-zinc-500">Aborted. The vault remains locked.</span> })
      return
    }
    if (!/^\d{4}$/.test(guess)) {
      append({ input: raw, output: `Focus. 4 digits (e.g. 0427) — or "exit".` })
      return
    }
    const { bulls, cows } = scoreGuess(g.code, guess)
    const used = MAX_ATTEMPTS - g.attemptsLeft + 1

    if (bulls === 4) {
      const timeMs = Date.now() - g.startedAt
      setGame(null)
      setPendingScore({ attempts: used, timeMs })
      append({
        input: raw,
        output: (
          <div className="mt-1">
            <pre className="text-green-400">{`╔══════════════════════════╗\n║      ACCESS GRANTED      ║\n╚══════════════════════════╝`}</pre>
            <div className="mt-1 text-zinc-400">
              Cracked in <span className="text-green-400">{used}/{MAX_ATTEMPTS}</span> attempts,{" "}
              <span className="text-green-400">{formatTime(timeMs)}</span>.
            </div>
            <div className="mt-1 text-zinc-400">
              Enter a name for the leaderboard (max 20 chars) — or press enter to stay anonymous.
            </div>
          </div>
        ),
      })
      return
    }

    if (g.attemptsLeft <= 1) {
      setGame(null)
      append({
        input: raw,
        output: (
          <div className="mt-1">
            <div className="text-red-400 font-bold">ACCESS DENIED — vault sealed.</div>
            <div className="text-zinc-400">
              The code was <span className="text-zinc-200">{g.code}</span>. Run{" "}
              <span className="text-zinc-300">./secret.sh</span> to try again.
            </div>
          </div>
        ),
      })
      return
    }

    setGame({ ...g, attemptsLeft: g.attemptsLeft - 1 })
    append({
      input: raw,
      output: (
        <span>
          [{used}/{MAX_ATTEMPTS}]{" "}
          <span className="text-green-400">✓ {bulls} in place</span>
          {" · "}
          <span className="text-yellow-400">~ {cows} misplaced</span>
        </span>
      ),
    })
  }

  const handleName = (raw: string, score: PendingScore) => {
    const name = raw.trim()
    setPendingScore(null)
    if (!name) {
      append({ input: "", output: <span className="text-zinc-500">Score discarded. The vault forgets you.</span> })
      return
    }
    append({ input: raw, output: <span className="text-zinc-500">Syncing with mainframe...</span> })
    submitScore({ name, attempts: score.attempts, timeMs: score.timeMs }).then(
      (res) => {
        if (!res.ok) {
          append({ input: null, output: <span className="text-red-400">upload failed: {res.error}</span> })
          return
        }
        append({
          input: null,
          output: (
            <div>
              <div className="text-green-400">
                Registered. Global rank: #{res.rank}
              </div>
              <ScoreTable top={res.top} highlightId={res.id} />
              <div className="mt-1 text-zinc-500">
                (type <span className="text-zinc-300">leaderboard</span> anytime to see the board)
              </div>
            </div>
          ),
        })
      },
      () => append({ input: null, output: <span className="text-red-400">upload failed: network error</span> }),
    )
  }

  const showLeaderboard = () => {
    append({ input: "leaderboard", output: <span className="text-zinc-500">Fetching scores...</span> })
    getLeaderboard().then(
      (top) => append({ input: null, output: <ScoreTable top={top} /> }),
      () => append({ input: null, output: <span className="text-red-400">leaderboard unreachable</span> }),
    )
  }



  // ↑/↓ command-history recall (keys or the on-screen buttons).
  const recallHistory = (dir: -1 | 1) => {
    if (cmdHistory.length === 0) return
    const ni = Math.max(0, Math.min(cmdHistory.length, histIndex + dir))
    setHistIndex(ni)
    setInput(ni === cmdHistory.length ? "" : cmdHistory[ni])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      recallHistory(-1)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      recallHistory(1)
    }
  }

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()

    // Name entry accepts an empty submit (= stay anonymous)
    if (pendingScore) {
      handleName(input, pendingScore)
      setInput("")
      return
    }
    if (!input.trim()) return

    if (game) {
      handleGuess(input, game)
      setInput("")
      return
    }

    // Record the raw command for ↑/↓ recall (skip immediate duplicates).
    const raw = input.trim()
    setCmdHistory((prev) => {
      const next = prev[prev.length - 1] === raw ? prev : [...prev, raw]
      setHistIndex(next.length)
      return next
    })

    const cmd = input.trim().toLowerCase()
    let output: React.ReactNode = ""

    switch (cmd) {
      case "help":
        output = (
          <div className="mt-1 space-y-2">
            <div className="text-zinc-500">Available commands:</div>
            <div className="space-y-0.5">
              {COMMANDS.map((c) => (
                <div key={c.cmd} className="flex gap-3">
                  <span className="w-32 shrink-0 text-green-400">{c.cmd}</span>
                  <span className="text-zinc-400">{c.desc}</span>
                </div>
              ))}
            </div>
            <div className="pt-1 text-zinc-500">Examples:</div>
            <div className="ml-1 space-y-0.5 text-zinc-400">
              <div>
                <span className="text-green-500">$</span> cat skills.txt
              </div>
              <div>
                <span className="text-green-500">$</span> echo hello world
              </div>
            </div>
          </div>
        )
        break
      case "whoami":
        output = `${username} - ${role}`
        break
      case "skills":
      case "cat skills.txt":
        output = skills.join(", ")
        break
      // Easter egg trail: `ls` reveals secret.sh, `cat` hints, `./secret.sh` runs it
      case "ls":
        output = "skills.txt  secret.sh"
        break
      case "cat secret.sh":
        output =
          "#!/bin/bash\n# WARNING: unauthorized access tool.\n# Cracks a 4-digit vault code. Fastest crackers get remembered.\n# usage: ./secret.sh"
        break
      case "./secret.sh":
      case "sh secret.sh":
      case "bash secret.sh":
        setHistory((prev) => [
          ...prev,
          { input, output: <span className="text-zinc-500">Executing secret.sh ...</span> },
        ])
        setInput("")
        startGame()
        return

      // Hidden until you've beaten the game once (it advertises itself there),
      // but it works whenever someone guesses it.
      case "leaderboard":
        showLeaderboard()
        setInput("")
        return
      case "pwd":
        output = `/users/${name.toLowerCase().replace(/\s+/g, "")}/portfolio/about`
        break
      case "clear":
        setHistory([])
        setInput("")
        return
      default:
        if (cmd.startsWith("echo ")) {
          output = cmd.substring(5)
        } else {
          output = `command not found: ${cmd}`
        }
    }

    setHistory([...history, { input, output }])
    setInput("")
  }

  // Prompt reflects the input mode: shell / code guess / name entry
  const prompt = pendingScore ? "name:" : game ? ">" : "$"

  return (
    <div className="border border-(--color-border) bg-(--color-surface) rounded-lg overflow-hidden font-mono text-sm shadow-xl">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-(--color-border) bg-(--color-bg)">
        <TerminalIcon className="h-4 w-4 text-(--color-text-secondary)" />
        <span className="text-xs text-(--color-text-secondary)">
          excelviryan@server: ~
          {game && ` — CRACKING [${game.attemptsLeft} attempts left]`}
        </span>
      </div>

      {/* The terminal body stays dark in both themes, so its text colors are fixed */}
      <div ref={scrollRef} className="p-4 h-56 md:h-64 overflow-y-auto bg-zinc-950 text-zinc-100">
            {history.map((entry, i) => (
              <div key={i} className="mb-4">
                {entry.input !== null && (
                  <div className="flex items-center gap-2 text-green-500">
                    <span>$</span>
                    <span>{entry.input}</span>
                  </div>
                )}
                <div className="text-zinc-400 mt-1 ml-4 whitespace-pre-wrap">
                  {entry.output}
                </div>
              </div>
            ))}

            <form onSubmit={handleCommand} className="flex items-center gap-2 text-green-500">
              <span>{prompt}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-zinc-100"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
              {/* Helper buttons to walk command history (touch-friendly ↑/↓). */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Previous command"
                  onClick={() => recallHistory(-1)}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30"
                  disabled={cmdHistory.length === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next command"
                  onClick={() => recallHistory(1)}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30"
                  disabled={cmdHistory.length === 0}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </form>
      </div>
    </div>
  )
}
