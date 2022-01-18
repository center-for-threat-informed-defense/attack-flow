import { Module } from "vuex"
import { ModuleStore, Notification, NotificationsStore } from "../StoreTypes";

export default {
    state: {
        id: 0,
        notifications: new Map()
    },
    actions: {

        /**
         * Pushes a notification to the store.
         * @param ctx
         *  The Vuex context.
         * @param notification
         *  The notification. 
         */
        pushNotification({ commit, state }, notification: Notification) {
            commit("pushNotification", notification);
            if(notification.time !== undefined) {
                let { id } = state;
                setTimeout(() => {
                    commit("pullNotification", id);
                }, notification.time)
            }
        },

        /**
         * Pulls a notification from the store.
         * @param ctx
         *  The Vuex context.
         * @param id
         *  The id of the notification to pull.
         */
        pullNotification({ commit }, id: number) {
            commit("pullNotification", id)
        }

    },
    mutations: {
        
        /**
         * Pushes a notification to the store.
         * @param state
         *  The Vuex state.
         * @param notification
         *  The notification.
         */
        pushNotification(state, notification: Notification) {
            state.notifications.set(++state.id, notification);
        },

        /**
         * Pulls a notification from the store.
         * @param state
         *  The Vuex state.
         * @param id
         *  The id of the notification to pull.
         */
        pullNotification(state, id: number) {
            state.notifications.delete(id);
        }

    }
} as Module<NotificationsStore, ModuleStore>
