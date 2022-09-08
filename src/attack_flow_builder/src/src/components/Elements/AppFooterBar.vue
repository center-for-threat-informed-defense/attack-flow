<template>
  <div class="app-footer-bar-element">
    <div class="info left">
      <p class="selected"><span>Selected:</span> {{ selects }}</p>
    </div>
    <div class="info right">
      <div v-if="isPageValid" class="page-check valid">
        <span>✓</span> Valid {{ fileName }}
      </div>
      <div v-else class="page-check invalid">
        <span>⚠</span> Invalid {{ fileName }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as Store from "@/store/StoreTypes";
// Dependencies
import { defineComponent } from "vue";
import { mapGetters, mapState } from "vuex";
import Configuration from "@/assets/builder.config";

export default defineComponent({
  name: "AppFooterBar",
  data(){
    return {
      fileName: Configuration.file_type_name
    }
  },
  computed: {

    /**
     * Active Page Store data
     */
    ...mapState("ActivePageStore", {
      selects(state: Store.ActivePageStore): number {
        // Using trigger to trip the reactivity system
        if(1 + state.selects.trigger === 0) {
          return 0;  // Will never run
        }
        return state.selects.ref.size;
      },
    }),

    ...mapGetters("ActivePageStore", ["isPageValid"]),
    
  }
});
</script>

<style scoped>

/** === Main Element === */

.app-footer-bar-element {
  display: flex;
}

.info {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 10pt;
  user-select: none;
}

/** === Info Left === */

.info.left {
  justify-content: left;
  margin-top: -1px;
  padding: 0px 15px;
}

.selected span {
  color: #a6a6a6;
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
