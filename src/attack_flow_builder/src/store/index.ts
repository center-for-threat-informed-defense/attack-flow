import { createStore } from 'vuex'
import { ModuleStore } from './StoreTypes'
import ActivePageStore from './Stores/ActivePageStore'
import ActiveDocumentStore from './Stores/ActiveDocumentStore'

export default createStore<ModuleStore>({
  modules: {
    ActiveDocumentStore,
    ActivePageStore
  }
})
