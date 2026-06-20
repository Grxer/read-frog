import type { PlatformConfig } from "@/entrypoints/subtitles.content/platforms"
import { DEFAULT_CONTROLS_HEIGHT } from "@/utils/constants/subtitles"

function getIhavenotvVideoId(): string | null {
  try {
    // Try to get video ID from the SRT download link on the parent page
    const parentDoc = window.parent.document
    const srtLink = parentDoc.querySelector<HTMLAnchorElement>("a[href*=\"Srt\"]")
    if (srtLink) {
      const url = new URL(srtLink.href)
      const path = url.searchParams.get("virtualFilePath") || ""
      const match = path.match(/\/([^/]+)\.\w+\.srt$/)
      if (match)
        return match[1]
    }
  }
  catch {
    // Cross-origin fallback: extract from document referrer
    const referrer = document.referrer
    if (referrer) {
      const match = referrer.match(/ihavenotv\.com\/([^/?#]+)/)
      if (match)
        return match[1]
    }
  }
  return null
}

export function getIhavenotvConfig(): PlatformConfig {
  return {
    embedded: true,
    selectors: {
      video: "#mainvideo",
      playerContainer: ".plyr",
      controlsBar: ".plyr__controls",
      nativeSubtitles: ".plyr__captions",
    },
    events: {},
    controls: {
      measureHeight: (container) => {
        const controls = container.querySelector(".plyr__controls")
        return controls?.getBoundingClientRect().height ?? DEFAULT_CONTROLS_HEIGHT
      },
      checkVisibility: () => true,
    },
    getVideoId: getIhavenotvVideoId,
  }
}
