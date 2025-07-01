<template>
  <div class="app-footer-bar-element">
    <div class="left-align">
      <p class="metric selected">
        <span>{{ application.hasSelection }} Selected</span>
      </p>
      <Transition name="fade">
        <div :class="['metric', { error: hasAutosaveFailed }]" v-if="lastAutosave">
          <FloppyDisk class="icon"/>
          <Transition name="fade" mode="out-in">
            <span v-if="showAutosaveTime">{{ lastAutosave }}</span>
            <span v-else-if="hasAutosaveFailed">FAILED TO AUTOSAVE</span>
            <span v-else>Autosaved</span>
          </Transition>
        </div>
      </Transition>
    </div>
    <div class="right-align">
      <div class="metric validity valid" v-if="application.isValid">
        <span class="icon">✓</span>Valid Attack Flow
      </div>
      <div class="metric validity" v-else>
        <span class="warning" v-if="warnings">
          <span class="icon">⚠</span><span>{{ warnings }}</span>
        </span>
        <span class="spacer"></span>
        <span class="error" v-if="errors">
          <span class="icon">⚠</span><span>{{ errors }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Configuration from "@/assets/configuration/app.configuration";
// Dependencies
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
// Components
import FloppyDisk from "../Icons/FloppyDisk.vue";

export default defineComponent({
  name: "AppFooterBar",
  data(){
    return {
      application: useApplicationStore(),
      fileName: Configuration.file_type_name,
      showAutosaveTime: false,
      showAutosaveTimeTimeoutId: 0
    }
  },
  computed: {

    /**
     * Returns the number of warnings as a string.
     */
    warnings(): string | null {
      const size = this.application.validationWarnings.length;
      if(size === 0) {
        return null;
      } else if(size === 1) {
        return `${ size } Warning`
      } else {
        return `${ size } Warnings`
      }
    },

    /**
     * Returns the number of errors as a string.
     */
    errors(): string | null {
      const size = this.application.validationErrors.length;
      if(size === 0) {
        return null;
      } else if(size === 1) {
        return `${ size } Error`
      } else {
        return `${ size } Errors`
      }
    },

    /**
     * Returns the last time the active editor autosaved.
     * @returns
     *  The last time the active editor autosaved.
     */
    lastAutosave(): string | null {
      const time = this.application.activeEditor.lastAutosave;
      if(time === null) {
        return null;
      } else if(Number.isNaN(time.getTime())) {
        return "ERROR"
      } else {
        return time.toLocaleString();
      }
    },

    /**
     * Tests if the last autosave failed.
     * @returns
     *  True if the last autosave failed, false otherwise.
     */
    hasAutosaveFailed(): boolean {
      const time = this.application.activeEditor.lastAutosave;
      return time !== null && Number.isNaN(time.getTime());
    }

  },
  watch: {
    "lastAutosave"() {
      // Clear timer
      clearTimeout(this.showAutosaveTimeTimeoutId);
      // Show time
      this.showAutosaveTime = true;
      // Set timer
      this.showAutosaveTimeTimeoutId = window.setTimeout(() => {
        // Hide time
        this.showAutosaveTime = false;
      }, 2500)
    }
  },
  components: { FloppyDisk }
});
</script>

<style scoped>

/** === Main Element === */

.app-footer-bar-element {
  display: flex;
  user-select: none;
}

.left-align {
  flex: 1;
  display: flex;
  justify-content: baseline;
}

.right-align {
  flex: 1;
  display: flex;
  justify-content: end;
}

.metric {
  display: flex;
  align-items: center;
  color: #cccccc;
  font-size: 9.5pt;
  margin: 0px 10px;
}

.left-align .metric:first-child {
  margin-left: 20px;
}

.right-align .metric:last-child {
  margin-right: 20px;
}

.icon {
  margin-right: 8px;
}

.valid {
  color: #2bd463;
}

.valid .icon {
  fill: #2bd463;
}

.warning {
  color: #e6d846;
}

.warning .icon {
  fill: #e6d846;
}

.error {
  color: #ff4d4d;
  font-weight: 800;
}

.error .icon {
  fill: #ff4d4d;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.spacer {
  padding-left: 12px;
}

/** === Info Right === */

.info.right {
  justify-content: right;
}

.page-check {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0px 15px;
  font-weight: 500;
}
.page-check span {
  font-size: 10.5pt;
  margin-right: 7px;
}
.page-check.invalid {
  color: #cccccc;
  background: #c94040;
}
.page-check.invalid span {
  margin-top: 1px;
}
.page-check.valid {
  color: #bfbfbf;
  background: #333333;
}

</style>
