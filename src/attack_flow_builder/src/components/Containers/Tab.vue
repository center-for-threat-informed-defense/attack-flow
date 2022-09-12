<template>
  <div class="tab-container" v-if="isActive"><slot></slot></div>
</template>

<script lang="ts">
import { 
  inject,
  computed,
  watchEffect,
  defineComponent, 
  getCurrentInstance, 
  ComponentInternalInstance
} from "vue";

export default defineComponent({
  name: "Tab",
  setup() {

    // Get tabsState from ancestor
    let instance = getCurrentInstance()!;
    let tabsState = inject("tabsState") as { active: any, tabs: any } | undefined;

    // Load tabState
    if(tabsState === undefined) {
      throw new TypeError("<Tab> can only be used within a <TabBox>.");
    }
    let { active, tabs } = tabsState;

    // Create reactive state properties
    let index = computed(() => {
      return tabs.value.findIndex(
        (target: ComponentInternalInstance) => 
          target.props.name === instance.props.name)
      }
    )
    let isActive = computed(() => index.value === active.value)

    // Add tab if not present in list
    watchEffect(() => {
      if(index.value === -1) {
        tabs.value.push(instance);
      }
    })

    // Return properties
    return { isActive }

  },
  props: {
    name: {
      type: String,
      required: true 
    }
  }
});
</script>

<style scoped>

/** === Main Container === */

.tab-container {
  width: 100%;
  height: 100%;
}

</style>
