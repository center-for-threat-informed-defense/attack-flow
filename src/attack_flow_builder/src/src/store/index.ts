import { createStore } from 'vuex'
import { ModuleStore } from './StoreTypes'
import ActivePageStore from './Stores/ActivePageStore'
import ActiveDocumentStore from './Stores/ActiveDocumentStore'
import AppActionsStore from './Stores/AppActionsStore'
import AppSettingsStore from './Stores/AppSettingsStore'
import ContextMenuStore from './Stores/ContextMenuStore'
import HotkeyStore from './Stores/HotkeyStore'

export default createStore<ModuleStore>({
  modules: {
    ActiveDocumentStore,
    ActivePageStore,
    AppActionsStore,
    AppSettingsStore,
    ContextMenuStore,
    HotkeyStore
  }
})
