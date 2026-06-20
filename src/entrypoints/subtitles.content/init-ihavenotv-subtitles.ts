import { createIhavenotvSubtitlesAdapter, isIhavenotvStreamtape } from "./platforms/ihavenotv"
import { getIhavenotvConfig } from "./platforms/ihavenotv/config"
import { mountSubtitlesUI } from "./renderer/mount-subtitles-ui"

export function initIhavenotvSubtitles() {
  let initialized = false
  let adapter: ReturnType<typeof createIhavenotvSubtitlesAdapter> | null = null

  const tryInit = async () => {
    if (!isIhavenotvStreamtape()) {
      return
    }

    const config = getIhavenotvConfig()

    if (!adapter) {
      adapter = createIhavenotvSubtitlesAdapter(config)
    }

    await mountSubtitlesUI({ adapter, config })

    if (initialized) {
      return
    }

    initialized = true
    void adapter.initialize()
  }

  void tryInit()
}
