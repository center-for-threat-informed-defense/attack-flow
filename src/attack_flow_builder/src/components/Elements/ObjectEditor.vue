<template>
  <div class="object-editor-element">
    <template v-if="selected">
      <ScrollBox
        class="scrollbox"
        :alwaysShowScrollBar="true"
        scrollColor="#1f1f1f"
      >
        <DictionaryFieldContents class="contents" :property="property" @change="onChange"/>
      </ScrollBox>
    </template>
    <template v-else>
      Nothing
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
            let item = this.selects.values().next().value;
            if(item instanceof DictionaryBlockModel) {
                return item;
            }
        }
        return undefined;
    },

    property(): DictionaryProperty | undefined {
        // Using trigger to trip the reactivity system
        if(1 + this.pageUpdate === 0) {
          return undefined;  // Will never run
        }
        return this.selected?.props;
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

</style>

