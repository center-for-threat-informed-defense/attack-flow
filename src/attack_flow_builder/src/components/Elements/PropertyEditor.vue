<template>
  <div class="object-editor-element">
    <template v-if="property">
      <template v-if="hasEditableProperties">
        <ScrollBox :alwaysShowScrollBar="true" scrollColor="#1f1f1f">
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
        <p class="no-prop"><slot name="no-props"></slot></p>
      </template>
    </template>
    <template v-else>
      <p class="no-prop"><slot name="no-prop"></slot></p>
    </template>
  </div>
</template>

<script lang="ts">
import * as Page from "@/store/Commands/PageCommands";
// Dependencies
import { mapMutations } from "vuex";
import { defineComponent, PropType } from "vue";
import { 
  DateProperty,
  DictionaryProperty,
  EnumProperty,
  ListProperty,
  NumberProperty,
  Property,
  PropertyType,
  StringProperty
} from "@/assets/scripts/BlockDiagram";
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
      for(let value of this.property.value.values()) {
        if(value.descriptor.is_visible_sidebar ?? true)
          return true;
      }
      return false;
    }

  },
  methods: {

    /**
     * Application Store actions
     */
    ...mapMutations("ApplicationStore", ["execute"]),

    /**
     * Field change behavior.
     * @param property
     *  The field's property.
     * @param value
     *  The field's new value.
     */
    onChange(property: Property, value: any) {
      switch(property.type) {
        case PropertyType.Int:
        case PropertyType.Float:
          if(property instanceof NumberProperty) {
            this.execute(new Page.SetNumberProperty(property, value));
          }
          break;
        case PropertyType.String:
          if(property instanceof StringProperty) {
            this.execute(new Page.SetStringProperty(property, value));
          }
          break;
        case PropertyType.Date:
          if(property instanceof DateProperty) {
            this.execute(new Page.SetDateProperty(property, value));
          }
          break;
        case PropertyType.Enum:
          if(property instanceof EnumProperty) {
            this.execute(new Page.SetEnumProperty(property, value));
          }
          break;
      }
    },

    /**
     * Field create subproperty behavior.
     * @param property
     *  The field's property.
     */
    onCreate(property: Property) {
      switch(property.type) {
        case PropertyType.List:
          if(property instanceof ListProperty) {
            this.execute(new Page.CreateSubproperty(property));
          }
          break;
      }
    },

    /**
     * Field delete subproperty behavior.
     * @param property
     *  The field's property.
     * @param id
     *  The subproperty's id.
     */
    onDelete(property: Property, id: string) {
      switch(property.type) {
        case PropertyType.List:
          if(property instanceof ListProperty) {
            this.execute(new Page.DeleteSubproperty(property, id));
          }
          break;
      }
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
