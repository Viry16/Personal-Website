"use client"

import { useState, useRef, useEffect } from "react"
import { Terminal as TerminalIcon } from "lucide-react"

type Command = {
  input: string
  output: React.ReactNode
}

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
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.trim().toLowerCase()
    let output: React.ReactNode = ""

    switch (cmd) {
      case "help":
        output = "Available commands: whoami, skills, cat skills.txt, pwd, echo [msg], clear"
        break
      case "whoami":
        output = "excel_viryan - AI/ML Engineer & IoT Builder"
        break
      case "skills":
      case "cat skills.txt":
        output =
          "Artificial Intelligence, Web & Software Development, Hardware & IoT, Multimedia & Design"
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
      <div className="p-4 h-56 md:h-64 overflow-y-auto bg-zinc-950 text-zinc-100">
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
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
