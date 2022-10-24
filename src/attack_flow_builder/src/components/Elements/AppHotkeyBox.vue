<template>
  <HotkeyBox class="app-hotkey-box-element" :hotkeys="hotkeys" :global="true" @fire="onHotkeyFired">
    <slot></slot>
  </HotkeyBox>
</template>

<script lang="ts">
// Dependencies
import { Hotkey } from "@/assets/scripts/HotkeyObserver";
import { defineComponent } from "vue";
import { Command, CommandEmitter } from "@/store/Commands/Command";
import { mapGetters, mapMutations } from "vuex";
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
    hotkeys(): Hotkey<() => Command>[] {
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
     * Application Store mutations
     */
    ...mapMutations("ApplicationStore", ["execute"]),

    /**
     * Hotkey fired behavior.
     * @param emitter
     *  The hotkey's command emitter.
     */
    async onHotkeyFired(emitter: CommandEmitter) {
      try {
        let cmd = emitter();
        if(cmd instanceof Promise) {
          let test = await cmd;
          this.execute(test);
        } else {
          this.execute(cmd);
        }
      } catch(ex: any) {
        console.error(ex);
      }
    }

  },
  components: { HotkeyBox }
});
</script>
