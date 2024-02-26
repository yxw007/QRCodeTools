import Store from 'electron-store'
import { shortcutKeys } from './constant'

let store = null

function createStore() {
  let store = new Store({
    shortcut_snapshot: {
      type: 'string'
    }
  })

  if (store.get(shortcutKeys.shortcut_snapshot) === undefined) {
    store.set(shortcutKeys.shortcut_snapshot, 'CommandOrControl+Alt+C')
  }
  return store
}

export function useStore() {
  if (store == null) {
    store = createStore()
  }
  return store
}
