<template>
  <div class="object-editor-element">
    <template v-if="property">
      <template v-if="hasEditableProperties">
        <ScrollBox
          :always-show-scroll-bar="true"
          scroll-color="#1f1f1f"
        >
          <DictionaryFieldContents
            class="contents"
            :property="property"
            @execute="execute"
          />
        </ScrollBox>
      </template>
      <template v-else>
        <p class="no-prop">
          <slot name="no-props" />
        </p>
      </template>
    </template>
    <template v-else>
      <p class="no-prop">
        <slot name="no-prop" />
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@OpenChart/DiagramEditor/Commands";
// Dependencies
import { Settings } from "luxon";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { defineComponent, type PropType } from "vue";
import { SetDatePropertyTimezone } from "@OpenChart/DiagramEditor/Commands/index.commands";
import type { Command } from "@/assets/scripts/Application";
import type { DictionaryProperty } from "@OpenChart/DiagramModel";
// Components
import ScrollBox from "@/components/Containers/ScrollBox.vue";
import DictionaryFieldContents from "@/components/Controls/Fields/DictionaryFieldContents.vue";

export default defineComponent({
  name: "PropertyEditor",
  props: {
    property: {
      type: Object as PropType<DictionaryProperty>,
      default: undefined
    }
  },
  data() {
    return {
      application: useApplicationStore()
    }
  },
  computed: {

    /**
     * Tests if the property has editable subproperties.
     * @returns
     *  True if the property has editable subproperties, false otherwise.
     */
    hasEditableProperties(): boolean {
      if(!this.property) {
        return false;
      }
      for(const value of this.property.value.values()) {
        // if(value.descriptor.is_visible_sidebar ?? true) {
        if(true) {
          return true;
        }
      }
      return false;
    }

  },
  methods: {
    
    /**
     * Executes an application command.
     * @param command
     *  The command to execute.
     */
    execute(command: Command) {
      // If timezone is being set...
      if(command instanceof SetDatePropertyTimezone) {
        // ...augment command to set the file's default timezone
        const cmd = EditorCommands.newGroupCommand();
        const file = this.application.activeEditor.file;
        cmd.do(command);
        cmd.do(EditorCommands.setDefaultTimezone(
          file, command.nextValue ?? Settings.defaultZone.name
        ));
        command = cmd;
      }
      this.application.execute(command);
    }

  },
  components: { ScrollBox, DictionaryFieldContents }
});
</script>

<style scoped>

/** === Main Element === */

.scrollbox-container {
  height: 100%;
}

.contents {
  padding: 18px 16px;
}

.no-prop {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818181;
  font-size: 10pt;
  text-align: center;
  user-select: none;
  width: 100%;
  height: 100%;
  padding: 100px 0px;
  box-sizing: border-box;
}

</style>
