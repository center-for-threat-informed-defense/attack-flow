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
            @change="onChange"
            @create="onCreate"
            @delete="onDelete"
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
// Dependencies
import { useApplicationStore } from "@/stores/ApplicationStore";
import { defineComponent, type PropType } from "vue";
import type { Command } from "@/stores/Commands/Command";
// Components
import ScrollBox from "@/components/Containers/ScrollBox.vue";
import DictionaryFieldContents from "@/components/Controls/Fields/DictionaryFieldContents.vue";
import { DateProperty, EnumProperty, Property, StringProperty, type DictionaryProperty } from "@OpenChart/DiagramModel";

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
        if(value.descriptor.is_visible_sidebar ?? true)
          return true;
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
      this.application.execute(command);
    },
    
    /**
     * Field change behavior.
     * @param property
     *  The field's property.
     * @param value
     *  The field's new value.
     */
    onChange(property: Property, value: string | number | null) {
      // switch(property.type) {
      //   case PropertyType.Int:
      //   case PropertyType.Float:
      //     if(
      //       property instanceof NumberProperty &&
      //       (value === null || value.constructor === Number)
      //     ) {
      //       this.execute(new Page.SetNumberProperty(property, value));
      //     }
      //     break;
      //   case PropertyType.String:
      //     if(
      //       property instanceof StringProperty &&
      //       (value === null || value.constructor === String)
      //     ) {
      //       this.execute(new Page.SetStringProperty(property, value));
      //     }
      //     break;
      //   case PropertyType.Date:
      //     if(
      //       property instanceof DateProperty &&
      //       (value === null || value.constructor === Date)
      //     ) {
      //       this.execute(new Page.SetDateProperty(property, value));
      //     }
      //     break;
      //   case PropertyType.Enum:
      //     if(
      //       property instanceof EnumProperty &&
      //       (value && value.constructor === String)
      //     ) {
      //       this.execute(new Page.SetEnumProperty(property, value));
      //     }
      //     break;
      // }
    },

    /**
     * Field create subproperty behavior.
     * @param property
     *  The field's property.
     */
    onCreate(property: Property) {
      // switch(property.type) {
      //   case PropertyType.List:
      //     if(property instanceof ListProperty) {
      //       this.execute(new Page.CreateSubproperty(property));
      //     }
      //     break;
      // }
    },

    /**
     * Field delete subproperty behavior.
     * @param property
     *  The field's property.
     * @param id
     *  The subproperty's id.
     */
    onDelete(property: Property, id: string) {
      // switch(property.type) {
      //   case PropertyType.List:
      //     if(property instanceof ListProperty) {
      //       this.execute(new Page.DeleteSubproperty(property, id));
      //     }
      //     break;
      // }
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
