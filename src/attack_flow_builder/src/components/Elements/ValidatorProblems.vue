<template>
  <div class="validator-problems-element">
    <template v-if="0 < getValidationErrors.length || 0 < getValidationWarnings.length">
      <ScrollBox class="scrollbox" :alwaysShowScrollBar="true" scrollColor="#1f1f1f">
        <div class="content">
          <div 
            class="validation-result error"
            v-for="error of getValidationErrors" :key="error"
            @click="focus(error.object)"
          >
            <span class="icon"></span>
            <p class="message">{{ error.reason }}</p>
          </div>
          <div
            class="validation-result warning"
            v-for="warning of getValidationWarnings" :key="warning"
            @click="focus(warning.object)"
          >
            <span class="icon"></span>
            <p class="message">{{ warning.reason }}</p>
          </div>
        </div>
      </ScrollBox>
    </template>
  </div>
</template>

<script lang="ts">
import * as Page from "@/store/Commands/PageCommands";
import * as Store from "@/store/StoreTypes";
// Dependencies
import { defineComponent } from "vue";
import { mapGetters, mapMutations, mapState } from "vuex";
// Components
import ScrollBox from "@/components/Containers/ScrollBox.vue";

export default defineComponent({
  name: "ValidatorProblems",
  computed: {

    /**
     * Application Store data
     */
    ...mapState("ApplicationStore", {
      ctx(state: Store.ApplicationStore): Store.ApplicationStore {
        return state;
      },
      editor(state: Store.ApplicationStore): Store.PageEditor {
        return state.activePage;
      }
    }),

    ...mapGetters("ApplicationStore", [
        "getValidationErrors", "getValidationWarnings"
    ])
  
  },
  methods: {

    /**
     * Application Store actions
     */
    ...mapMutations("ApplicationStore", ["execute"]),

    /**
     * Focuses the camera on an object.
     * @param id
     *  The id of the object.
     */
    focus(id: string) {
      let obj = this.editor.page.lookup(id);
      if(obj === this.editor.page) {
        this.execute(new Page.UnselectDescendants(this.editor.page));
      } else if(obj) {
        this.execute(new Page.UnselectDescendants(this.editor.page));
        this.execute(new Page.SelectObject(obj));
        this.execute(new Page.MoveCameraToSelection(this.ctx, this.editor.page))
      }
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
