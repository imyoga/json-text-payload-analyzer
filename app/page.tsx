"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Code, Minus } from "lucide-react"

export default function PayloadAnalyzer() {
  const [payload, setPayload] = useState("")
  const [stats, setStats] = useState({
    characters: 0,
    bytes: 0,
    kilobytes: 0,
    lines: 0,
    words: 0,
    isValidJSON: false,
    jsonDepth: 0,
    jsonKeys: 0,
    type: "text",
  })

  useEffect(() => {
    analyzePayload(payload)
  }, [payload])

  const analyzePayload = (text: string) => {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(text).length
    const lines = text ? text.split("\n").length : 0
    const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0

    let isValidJSON = false
    let jsonDepth = 0
    let jsonKeys = 0
    let type = "text"

    if (text.trim()) {
      try {
        const parsed = JSON.parse(text)
        isValidJSON = true
        type = "json"
        jsonDepth = getJSONDepth(parsed)
        jsonKeys = countJSONKeys(parsed)
      } catch {
        isValidJSON = false
      }
    }

    setStats({
      characters: text.length,
      bytes,
      kilobytes: bytes / 1024,
      lines,
      words,
      isValidJSON,
      jsonDepth,
      jsonKeys,
      type,
    })
  }

  const getJSONDepth = (obj: any, depth = 1): number => {
    if (typeof obj !== "object" || obj === null) return depth
    const depths = Object.values(obj).map((val) => getJSONDepth(val, depth + 1))
    return Math.max(depth, ...depths)
  }

  const countJSONKeys = (obj: any): number => {
    if (typeof obj !== "object" || obj === null) return 0
    let count = Object.keys(obj).length
    Object.values(obj).forEach((val) => {
      count += countJSONKeys(val)
    })
    return count
  }

  const handleClear = () => {
    setPayload("")
  }

  const handleBeautify = () => {
    if (!payload.trim()) return
    
    try {
      const parsed = JSON.parse(payload)
      const beautified = JSON.stringify(parsed, null, 2)
      setPayload(beautified)
    } catch {
      // If not valid JSON, do nothing
    }
  }

  const handleMinify = () => {
    if (!payload.trim()) return
    
    try {
      const parsed = JSON.parse(payload)
      const minified = JSON.stringify(parsed)
      setPayload(minified)
    } catch {
      // If not valid JSON, do nothing
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <h1 className="text-xl font-semibold text-foreground">Payload Analyzer</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Paste JSON, text, or any string to analyze size and structure
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 p-6 overflow-hidden h-[calc(100vh-120px)]">
        {/* Text Area Section */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">Input</label>
            <div className="flex gap-2">
              <Button
                onClick={handleBeautify}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={!payload || !stats.isValidJSON}
                title="Beautify JSON"
              >
                <Code className="h-4 w-4" />
                Beautify
              </Button>
              <Button
                onClick={handleMinify}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={!payload || !stats.isValidJSON}
                title="Minify JSON"
              >
                <Minus className="h-4 w-4" />
                Minify
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={!payload}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Paste your JSON, text, or any payload here..."
            className="flex-1 w-full p-4 bg-card border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none min-h-0"
          />
        </div>

        {/* Stats Panel */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto">
          <Card className="p-4 bg-card border-border">
            <h2 className="text-sm font-semibold text-foreground mb-4">Size Information</h2>
            <div className="space-y-3">
              <StatRow label="Size" value={formatBytes(stats.bytes)} />
              <StatRow label="Characters" value={stats.characters.toLocaleString()} />
              <StatRow label="Lines" value={stats.lines.toLocaleString()} />
              <StatRow label="Words" value={stats.words.toLocaleString()} />
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h2 className="text-sm font-semibold text-foreground mb-4">Type Detection</h2>
            <div className="space-y-3">
              <StatRow
                label="Format"
                value={stats.isValidJSON ? "Valid JSON" : "Plain Text"}
                highlight={stats.isValidJSON}
              />
              {stats.isValidJSON && (
                <>
                  <StatRow label="JSON Depth" value={stats.jsonDepth.toString()} highlight={true} />
                  <StatRow label="Total Keys" value={stats.jsonKeys.toLocaleString()} highlight={true} />
                </>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h2 className="text-sm font-semibold text-foreground mb-4">Encoding</h2>
            <div className="space-y-3">
              <StatRow label="Bytes (UTF-8)" value={stats.bytes.toLocaleString()} />
              <StatRow label="Kilobytes" value={stats.kilobytes.toFixed(3)} />
              {stats.bytes > 0 && (
                <StatRow label="Avg bytes/char" value={(stats.bytes / stats.characters).toFixed(2)} />
              )}
            </div>
          </Card>

          {payload && (
            <Card className="p-4 bg-muted/50 border-border">
              <h2 className="text-sm font-semibold text-foreground mb-2">Quick Stats</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your payload contains <span className="text-foreground font-medium">{stats.characters}</span> characters
                across <span className="text-foreground font-medium">{stats.lines}</span> lines, totaling{" "}
                <span className="text-foreground font-medium">{formatBytes(stats.bytes)}</span>.
              </p>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-mono font-medium ${highlight ? "text-black dark:text-white" : "text-foreground"}`}>{value}</span>
    </div>
  )
}
