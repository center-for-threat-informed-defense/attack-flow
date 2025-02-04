<template>
  <div class="validator-problems-element">
    <template v-if="0 < getValidationErrors.length || 0 < getValidationWarnings.length">
      <ScrollBox
        class="scrollbox"
        :always-show-scroll-bar="true"
        scroll-color="#1f1f1f"
      >
        <div class="content">
          <div 
            class="validation-result error"
            v-for="error of getValidationErrors"
            :key="key(error)"
            @click="focus(error.object)"
          >
            <span class="icon"></span>
            <p class="message">
              {{ error.reason }}
            </p>
          </div>
          <div
            class="validation-result warning"
            v-for="warning of getValidationWarnings"
            :key="key(warning)"
            @click="focus(warning.object)"
          >
            <span class="icon"></span>
            <p class="message">
              {{ warning.reason }}
            </p>
          </div>
        </div>
      </ScrollBox>
    </template>
  </div>
</template>

<script lang="ts">
import * as Page from "@/stores/Commands/PageCommands";
// Dependencies
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/Stores/ApplicationStore";
import type { Command } from "@/stores/Commands/Command";
// Components
import ScrollBox from "@/components/Containers/ScrollBox.vue";

export default defineComponent({
  name: "ValidatorProblems",
  data() {
    return {
      application: useApplicationStore()
    }
  },
  computed: {

    /**
     * Returns the application's validation errors.
     * @returns
     *  The application's validation errors.
     */
    getValidationErrors() {
      return this.application.getValidationErrors;
    },

    /**
     * Returns the application's validation warnings.
     * @returns
     *  The application's validation warnings.
     */
    getValidationWarnings() {
      return this.application.getValidationWarnings;
    }

  },
  methods: {

    /**
     * Executes an application command.
     * @param command
     *  The command to execute.
     */
    execute(command: Command) {
      this.application.execute(command);
    },

    /**
     * Focuses the camera on an object.
     * @param id
     *  The id of the object.
     */
    focus(id: string) {
      const editor = this.application.activePage;
      const obj = editor.page.lookup(id);
      if(obj === editor.page) {
        this.execute(new Page.UnselectDescendants(editor.page));
      } else if(obj) {
        this.execute(new Page.UnselectDescendants(editor.page));
        this.execute(new Page.SelectObject(obj));
        this.execute(new Page.MoveCameraToSelection(this.application, editor.page))
      }
    },

    /**
     * Returns a validation object's key.
     * @returns
     *  The validation object's key.
     */
    key(obj: { object: string, reason: string}): string {
      return `${ obj.object }.${ obj.reason }`
    }

  },
  components: { ScrollBox }
});
</script>

<style scoped>

/** === Main Element === */

.scrollbox {
  height: 100%;
}

.content {
  padding: 5px 0px; 
}

/** === Validation Result === */

.validation-result {
  display: flex;
  align-items: center;
  color: #d9d9d9;
  font-size: 10pt;
  user-select: none;
  min-height: 27px;
  padding: 5px 16px;
  box-sizing: border-box;
  cursor: pointer;
}

.validation-result:hover {
  background: #303030;
}

.validation-result .icon {
  font-size: 10pt;
  font-weight: 300;
  user-select: none;
  padding-right: 10px;
  margin-top: -1px;
}

.validation-result.error .icon {
  color: #ff6969;
}

.validation-result.warning .icon {
  color: #e6d845;
}

</style>
