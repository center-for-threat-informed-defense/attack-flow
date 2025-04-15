<template>
  <HotkeyBox
    class="app-hotkey-box-element"
    :hotkeys="hotkeySet"
    :global="true"
    @fire="onHotkeyFired"
  >
    <slot />
  </HotkeyBox>
</template>

<script lang="ts">
// Dependencies
import { defineComponent } from "vue";
import { useHotkeyStore } from "@/stores/HotkeyStore";
import { useApplicationStore } from "@/stores/ApplicationStore";
import type { Hotkey } from "@/assets/scripts/Browser";
import type { CommandEmitter } from "@/assets/scripts/Application";
// Components
import HotkeyBox from "@/components/Containers/HotkeyBox.vue";

export default defineComponent({
  name: "AppHotkeyBox",
  data() {
    return {
      hotkeys: useHotkeyStore(),
      application: useApplicationStore()
    }
  },
  computed: {

    /**
     * Returns the application's hotkeys.
     * @returns
     *  The application's hotkeys.
     */
    hotkeySet(): Hotkey<CommandEmitter>[] {
      return [
        ...this.hotkeys.nativeHotkeys, 
        ...this.hotkeys.fileHotkeys,
        ...this.hotkeys.editHotKeys,
        ...this.hotkeys.viewHotkeys
      ]
    }

  },
  methods: {

    /**
     * Hotkey fired behavior.
     * @param emitter
     *  The hotkey's command emitter.
     */
    async onHotkeyFired(emitter: CommandEmitter) {
      try {
        const cmd = emitter();
        if(cmd instanceof Promise) {
          const test = await cmd;
          this.application.execute(test);
        } else {
          this.application.execute(cmd);
        }
      } catch(ex: unknown) {
        console.error(ex);
      }
    }

  },
  components: { HotkeyBox }
});
</script>
