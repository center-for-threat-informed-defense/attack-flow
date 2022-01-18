<template>
  <div class="app-notifications-element">
    <transition-group name="notification">
      <div v-for="[id, item] of notifications" :key="id" class="notification-item">
        <div class="icon">
          <template v-if="item.type === 'info'">
            <div class="info-icon">i</div>
          </template>
          <template v-if="item.type === 'error'">
            <div class="error-icon">⚠</div>
          </template> 
        </div>
        <div class="info">
          <span class="title">{{ item.title.toLocaleUpperCase() }}</span>
          <span class="description">{{ item.description }}</span>
        </div>
        <div class="close" @click="pullNotification(id)">✗</div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "vuex";
import * as Store from "@/store/StoreTypes";

export default defineComponent({
  name: "AppNotifications",
  computed: {
    ...mapState({
      notifications(state: Store.ModuleStore): Map<number, Store.Notification> {
        return state.NotificationsStore.notifications;
      },
    }),
  },
  methods: {
    ...mapActions(["pullNotification"])
  },
});
</script>

<style scoped>

/** === Notifications === */

.notification-item {
  display: flex;
  font-size: 10pt;
  border: solid 1px #333;
  border-radius: 4px;
  margin-bottom: 5px;
  background: #242424;
  overflow: hidden;
  pointer-events: all;
  width: max-content;
  max-width: 400px;
  box-shadow: 2px 2px 4px 0px #00000073;
}

.icon {
  display: flex;
  align-items: center;
  padding: 0px 12px;
  user-select: none;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 14px;
  width: 14px;
  font-family: 'Inconsolata', monospace;
  color: #fff;
  font-size: 14pt;
  font-weight: 600;
  padding: 10px;
  border-radius: 100px;
  background: hsl(226deg 49% 59%);
}

.error-icon {
  color: #d0ad43;
  font-size: 25.5pt;
}

.info {
  display: flex;
  flex-direction: column;
  padding: 12px 17px 12px 5px;
}

.title {
  color: #999999;
  font-weight: 700;
  margin-bottom: 4px;
}
.description {
  color: #cccccc;
}

.close {
  display: flex;
  align-items: center;
  color: #999999;
  font-size: 14pt;
  padding: 0px 10px;
  user-select: none;
  cursor: pointer;
  transition: .15s color;
}
.close:hover {
  color: #ccc;
}

/** === Animations === */

.notification-item {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.notification-leave-active {
  position: absolute;
}

</style>
