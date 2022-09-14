<template>
  <div class="object-editor-element">
    <template v-if="property">
      <ScrollBox
        class="scrollbox"
        :alwaysShowScrollBar="true"
        scrollColor="#1f1f1f"
      >
        <DictionaryFieldContents class="contents" :property="property" @change="onChange"/>
      </ScrollBox>
    </template>
    <template v-else-if="selected">
      <p class="no-prop-selection">The selected object has no properties.</p>
    </template>
    <template v-else>
      <p class="no-prop-selection">Select an object to edit its properties.</p>
    </template>
  </div>
</template>

<script lang="ts">
import * as Store from "@/store/StoreTypes";
// Dependencies
import { defineComponent } from "vue";
import { mapActions, mapState } from "vuex";
import {
    DiagramObjectModel,
    DictionaryBlockModel,
    DictionaryProperty,
    Property
} from "@/assets/scripts/BlockDiagram";
// Components
import ScrollBox from "@/components/Containers/ScrollBox.vue";
import DictionaryFieldContents from "@/components/Controls/Fields/DictionaryFieldContents.vue";

export default defineComponent({
  name: "ObjectEditor",
  computed: {

    /**
     * Active Page Store data
     */
    ...mapState("ActivePageStore", {
      selects(state: Store.ActivePageStore): Map<string, DiagramObjectModel> {
        return state.selects.ref;
      },
      selectTrigger(state: Store.ActivePageStore): number {
        return state.selects.trigger;
      },
      pageUpdate(state: Store.ActivePageStore): number {
        return state.page.trigger;
      }
    }),

    selected(): DictionaryBlockModel | undefined {
        // Using trigger to trip the reactivity system
        if(1 + this.selectTrigger === 0) {
          return undefined;  // Will never run
        }
        if(this.selects.size === 1) {
            return this.selects.values().next().value;
        }
        return undefined;
    },

    property(): DictionaryProperty | undefined {
        // Using trigger to trip the reactivity system
        if(1 + this.pageUpdate === 0) {
          return undefined;  // Will never run
        }
        if(0 < (this.selected?.props.value.size ?? 0)) {
            return this.selected?.props;
        }
    }

  },
  methods: {

    /**
     * App Actions Store actions
     */
    ...mapActions("AppActionsStore", ["executeAppAction"]),
    
    /**
     * Active Page Store actions
     */
    ...mapActions("ActivePageStore", ["setObjectProperty"]),

    onChange(property: Property, value: any) {
      // TODO: All this is really ugly, for now, please ignore
      this.setObjectProperty({
        object: this.selected!.id,property, value
      });
    }

  },
  components: { ScrollBox, DictionaryFieldContents }
});
</script>

<style scoped>

.object-editor-element {
  overflow: hidden;
  height: 100%;
}

.scrollbox {
  height: 100%;
}

.contents {
  padding: 18px 16px;
}

.no-prop-selection {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 10pt;
  justify-content: center;
  color: #818181;
  padding: 100px 0px;
  box-sizing: border-box;
  text-align: center;
}

</style>

