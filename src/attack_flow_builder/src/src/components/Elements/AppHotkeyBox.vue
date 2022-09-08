<template>
  <HotkeyBox class="app-hotkey-box-element" :hotkeys="hotkeys" @fire="onHotkeyFired">
    <slot></slot>
  </HotkeyBox>
</template>

<script lang="ts">
// Dependencies
import { Hotkey } from "@/assets/scripts/HotkeyObserver";
import { defineComponent } from "vue";
import { mapActions, mapGetters } from "vuex";
// Components
import HotkeyBox from "@/components/Containers/HotkeyBox.vue";

export default defineComponent({
  name: "AppHotkeyBox",
  computed: {

    /**
     * Hotkey Store data
     */
    ...mapGetters("HotkeyStore", [
      "nativeHotkeys",
      "fileHotkeys",
      "editHotKeys",
      "layoutHotkeys",
      "viewHotkeys"
    ]),
    
    /**
     * Returns the application's hotkeys.
     * @returns
     *  The application's hotkeys.
     */
    hotkeys(): Hotkey[] {
      return [
        ...this.nativeHotkeys, 
        ...this.fileHotkeys,
        ...this.editHotKeys,
        ...this.layoutHotkeys,
        ...this.viewHotkeys
      ]
    }

  },
  methods: {

    /**
     * App Actions Store actions
     */
    ...mapActions("AppActionsStore", ["executeAppAction"]),

    /**
     * Hotkey fired behavior.
     * @param id
     *  The id of the hotkey action.
     * @param data
     *  Auxillary data included with the action.
     */
    async onHotkeyFired(id: string, data: any) {
      try {
        await this.executeAppAction({ id, data });
      } catch(ex: any) {
        console.error(ex);
      }
    }

  },
  components: { HotkeyBox }
});
</script>
