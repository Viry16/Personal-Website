"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Terminal as TerminalIcon } from "lucide-react"

type Command = {
  input: string
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

export function Terminal() {
  const [history, setHistory] = useState<Command[]>([
    {
      input: "whoami",
      output: "excel_viryan - AI/ML Engineer & IoT Builder"
    },
    {
      input: "cat skills.txt",
      output: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <div>- Python, TypeScript</div>
          <div>- Next.js, React, Laravel</div>
          <div>- YOLOv8, Computer Vision, NLP</div>
          <div>- ESP32, Arduino, MQTT</div>
        </div>
      )
    }
  ])
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Auto-scroll ONLY the terminal body to the bottom when history changes
  // (a command was submitted / new output rendered). It scrolls the container
  // directly — never the page — and because it depends on `history`, not
  // `input`, it does not fire on keystrokes, so the view stays put while typing.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

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
        output = "excel_viryan - AI/ML Engineer & IoT Builder"
        break
      case "skills":
      case "cat skills.txt":
        output =
          "Artificial Intelligence, Web & Software Development, Hardware & IoT, Multimedia & Design"
        break
      // Easter egg trail: `ls` reveals secret.sh, `cat` hints, `./secret.sh` runs it
      case "ls":
        output = "skills.txt  secret.sh"
        break
      case "cat secret.sh":
        output = "#!/bin/bash\n# nothing to see here...\n# (hint: try running me: ./secret.sh)"
        break
      case "./secret.sh":
      case "sh secret.sh":
      case "bash secret.sh":
        output = "Access granted. Opening hidden profile..."
        setTimeout(() => router.push("/profile-demo"), 1200)
        break
      case "pwd":
        output = "/users/excelviryan/portfolio/about"
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

  return (
    <div className="border border-(--color-border) bg-(--color-surface) rounded-lg overflow-hidden font-mono text-sm shadow-xl">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-(--color-border) bg-(--color-bg)">
        <TerminalIcon className="h-4 w-4 text-(--color-text-secondary)" />
        <span className="text-xs text-(--color-text-secondary)">excelviryan@server: ~</span>
      </div>
      
      {/* The terminal body stays dark in both themes, so its text colors are fixed */}
      <div ref={scrollRef} className="p-4 h-56 md:h-64 overflow-y-auto bg-zinc-950 text-zinc-100">
        {history.map((entry, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-center gap-2 text-green-500">
              <span>$</span>
              <span>{entry.input}</span>
            </div>
            <div className="text-zinc-400 mt-1 ml-4 whitespace-pre-wrap">
              {entry.output}
            </div>
          </div>
        ))}

        <form onSubmit={handleCommand} className="flex items-center gap-2 text-green-500">
          <span>$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-zinc-100"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  )
}
