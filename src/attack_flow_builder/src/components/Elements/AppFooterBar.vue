<template>
  <div class="app-footer-bar-element">
    <div class="info left">
      <p class="selected"><span>Selected:</span> {{ hasSelection }}</p>
    </div>
    <div class="info right">
      <div v-if="isValid" class="page-check valid">
        <span>✓</span> Valid {{ fileName }}
      </div>
      <div v-else class="page-check invalid">
        <span>⚠</span> Invalid {{ fileName }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Configuration from "@/assets/configuration/builder.config";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "AppFooterBar",
  data(){
    return {
      fileName: Configuration.file_type_name
    }
  },
  computed: {

    /**
     * Application Store getters
     */
    ...mapGetters("ApplicationStore", [
        "hasSelection", "isValid"
    ])
    
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
