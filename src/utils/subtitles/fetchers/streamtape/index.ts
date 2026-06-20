import type { SubtitlesFragment } from "../../types"
import type { SubtitlesFetcher } from "../types"
import { parseVttToFragments } from "./vtt-parser"

export class StreamtapeFetcher implements SubtitlesFetcher {
  private cachedFragments: SubtitlesFragment[] | null = null
  private cachedTrackSrc: string | null = null
  private sourceLanguage = "en"

  async fetch(): Promise<SubtitlesFragment[]> {
    const trackSrc = this.getTrackSrc()
    if (!trackSrc) {
      throw new Error("No caption track found")
    }

    // Return cache if same track
    if (this.cachedFragments && this.cachedTrackSrc === trackSrc) {
      return this.cachedFragments
    }

    const resp = await fetch(trackSrc)
    if (!resp.ok) {
      throw new Error(`Failed to fetch VTT: ${resp.status}`)
    }

    const vttText = await resp.text()
    const fragments = parseVttToFragments(vttText)

    this.cachedFragments = fragments
    this.cachedTrackSrc = trackSrc

    return fragments
  }

  cleanup(): void {
    this.cachedFragments = null
    this.cachedTrackSrc = null
  }

  async shouldUseSameTrack(): Promise<boolean> {
    const currentSrc = this.getTrackSrc()
    if (!currentSrc || !this.cachedTrackSrc) {
      return false
    }
    return currentSrc === this.cachedTrackSrc
  }

  getSourceLanguage(): string {
    return this.sourceLanguage
  }

  async hasAvailableSubtitles(): Promise<boolean> {
    return !!this.getTrackSrc()
  }

  private getTrackSrc(): string | null {
    const track = document.querySelector<HTMLTrackElement>("video track[kind='captions']")
    if (track?.src) {
      // Extract language from track label if available
      if (track.srclang) {
        this.sourceLanguage = track.srclang
      }
      return track.src
    }
    return null
  }
}
