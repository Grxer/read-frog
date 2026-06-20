import type { SubtitlesFragment } from "../../types"

/**
 * Parse standard WebVTT timestamp (HH:MM:SS.mmm or MM:SS.mmm) to milliseconds
 */
function parseVttTimestamp(timestamp: string): number {
  const parts = timestamp.trim().split(":")

  let hours = 0
  let minutes: number
  let secondsAndMs: string

  if (parts.length === 3) {
    hours = Number.parseInt(parts[0], 10)
    minutes = Number.parseInt(parts[1], 10)
    secondsAndMs = parts[2]
  }
  else if (parts.length === 2) {
    minutes = Number.parseInt(parts[0], 10)
    secondsAndMs = parts[1]
  }
  else {
    return 0
  }

  const [seconds, ms = "0"] = secondsAndMs.split(".")
  return (
    hours * 3600000
    + minutes * 60000
    + Number.parseInt(seconds, 10) * 1000
    + Number.parseInt(ms.padEnd(3, "0"), 10)
  )
}

const TIMESTAMP_LINE_PATTERN = /^(\d{1,2}:\d{2}(?::\d{2})?\.\d{3})\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?\.\d{3})/

/**
 * Parse standard WebVTT content into SubtitlesFragment[]
 *
 * Supports:
 * - HH:MM:SS.mmm --> HH:MM:SS.mmm
 * - MM:SS.mmm --> MM:SS.mmm
 * - Cue identifiers (ignored)
 * - Multi-line cue text
 */
export function parseVttToFragments(vttContent: string): SubtitlesFragment[] {
  const lines = vttContent.split(/\r?\n/)
  const fragments: SubtitlesFragment[] = []

  let i = 0

  // Skip WEBVTT header
  while (i < lines.length && !lines[i].startsWith("WEBVTT")) {
    i++
  }
  // Skip past the WEBVTT line and any header metadata
  while (i < lines.length && lines[i].trim() !== "") {
    i++
  }

  while (i < lines.length) {
    // Skip blank lines
    while (i < lines.length && lines[i].trim() === "") {
      i++
    }

    if (i >= lines.length)
      break

    // Check for optional cue identifier (skip it)
    const timestampMatch = lines[i]?.match(TIMESTAMP_LINE_PATTERN)
    if (!timestampMatch) {
      // Could be a cue identifier, skip and check next line
      i++
      if (i >= lines.length)
        break
      const nextMatch = lines[i]?.match(TIMESTAMP_LINE_PATTERN)
      if (!nextMatch) {
        continue
      }
      // Process with the timestamp on this line
      const start = parseVttTimestamp(nextMatch[1])
      const end = parseVttTimestamp(nextMatch[2])
      i++

      const textLines: string[] = []
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i].trim())
        i++
      }

      const text = textLines.join("\n")
      if (text) {
        fragments.push({ text, start, end })
      }
      continue
    }

    const start = parseVttTimestamp(timestampMatch[1])
    const end = parseVttTimestamp(timestampMatch[2])
    i++

    const textLines: string[] = []
    while (i < lines.length && lines[i].trim() !== "") {
      textLines.push(lines[i].trim())
      i++
    }

    const text = textLines.join("\n")
    if (text) {
      fragments.push({ text, start, end })
    }
  }

  return fragments
}
