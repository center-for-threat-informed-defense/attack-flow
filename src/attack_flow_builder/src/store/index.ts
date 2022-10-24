import { createStore } from 'vuex'
import { ModuleStore } from './StoreTypes'
import ApplicationStore from './Stores/ApplicationStore'
import ContextMenuStore from './Stores/ContextMenuStore'
import HotkeyStore from './Stores/HotkeyStore'

export default createStore<ModuleStore>({
  modules: {
    ApplicationStore,
    ContextMenuStore,
    HotkeyStore
  }
})
