import { createStore } from 'vuex'
import { ModuleStore } from './StoreTypes'
import SchemaStore from './Stores/SchemaStore'
import SessionStore from './Stores/SessionStore'
import NotificationsStore from './Stores/NotificationsStore'

export default createStore<ModuleStore>({
    modules: {
        SchemaStore: SchemaStore,
        SessionStore: SessionStore,
        NotificationsStore: NotificationsStore
    }
})
