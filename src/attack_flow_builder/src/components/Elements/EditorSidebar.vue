<template>
  <AccordionBox class="editor-tabs-element">
    <AccordionPane name="Properties" :units="3">
      <PropertyEditor class="properties-pane" :property="selected">
        <template #no-props>
          The selected object has no properties.
        </template>
        <template #no-prop>
          Select a single object to edit its properties.
        </template>
      </PropertyEditor>
    </AccordionPane>
    <AccordionPane name="Problems" :units="1">
      <ValidatorProblems class="validator-problems-pane" />
    </AccordionPane>
  </AccordionBox>
</template>

<script lang="ts">
import * as Store from "@/store/StoreTypes";
// Dependencies
import { defineComponent } from "vue";
import { mapGetters, mapState } from "vuex";
import { DictionaryProperty, PageModel } from "@/assets/scripts/BlockDiagram";
// Components
import AccordionBox from "@/components/Containers/AccordionBox.vue";
import AccordionPane from "@/components/Containers/AccordionPane.vue";
import PropertyEditor from "@/components/Elements/PropertyEditor.vue";
import ValidatorProblems from "@/components/Elements/ValidatorProblems.vue";

export default defineComponent({
  name: "EditorSidebar",
  computed: {

    /**
     * Application Store data
     */
    ...mapState("ApplicationStore", {
      page(state: Store.ApplicationStore): PageModel {
        return state.activePage.page;
      },
    }),

    ...mapGetters("ApplicationStore", [
      "hasSelection", "getSelection"
    ]),

    /**
     * Returns the currently selected object's properties.
     * @returns
     *  The currently selected object's properties.
     */
    selected(): DictionaryProperty | undefined {
      if(this.hasSelection === 0) {
        return this.page.props;
      } else if(this.hasSelection === 1) {
        return this.getSelection[0].props;
      }
      return undefined;
    }

  },
  components: { 
    AccordionBox,
    AccordionPane,
    PropertyEditor,
    ValidatorProblems
  }
});
</script>

<style scoped>

/** === Main Element === */

.editor-tabs-element {
  border-left: solid 1px #303030;
  background: #242424;
}

.properties-pane,
.validator-problems-pane {
  height: 100%;
}

</style>
