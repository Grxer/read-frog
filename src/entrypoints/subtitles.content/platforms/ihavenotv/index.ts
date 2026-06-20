import type { PlatformConfig } from "@/entrypoints/subtitles.content/platforms"
import { StreamtapeFetcher } from "@/utils/subtitles/fetchers/streamtape"
import { UniversalVideoAdapter } from "../../universal-adapter"

export function isIhavenotvStreamtape(): boolean {
  const hostname = window.location.hostname
  return (
    (hostname.includes("streamtape.com") || hostname.includes("tpead.net"))
    && window.location.pathname.startsWith("/e/")
    && !!document.querySelector("video#mainvideo")
  )
}

export function createIhavenotvSubtitlesAdapter(config: PlatformConfig) {
  const subtitlesFetcher = new StreamtapeFetcher()
  return new UniversalVideoAdapter({
    config,
    subtitlesFetcher,
  })
}
