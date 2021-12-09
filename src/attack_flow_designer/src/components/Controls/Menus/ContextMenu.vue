<template>
  <div class="context-menu-element">
    <div class="context-menu-section" v-for="(section, i) of options" :key="i">
      <li v-for="option of section" :key="option.text" @click="select(option.id, option.data)">
        {{ option.text }}
      </li>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ContextMenu",
  props: {
    options : { type: Array, required: true },
  },
  data: () => ({ clickOutsideHandler : (event: MouseEvent) => {} }),
  methods: {
    select(id: string, data: any) {
      this.$emit('select', id, data);
      this.$emit('unfocus');
    }
  },
  emits: {
    select: (id: string, data: any) => true,
    unfocus: () => true
  },
  mounted() {
    this.clickOutsideHandler = function(this: any, event: MouseEvent) {
      if (this.$el != event.target && !this.$el.contains(event.target)) {
        this.$emit("unfocus");
      }
    }.bind(this);
    document.body.addEventListener("click", this.clickOutsideHandler);
  },
  beforeUnmount() {
    document.body.removeEventListener("click", this.clickOutsideHandler);
  }
});
</script>

<style scoped>

.context-menu-element {
  width: max-content;
  padding: 8px 12px;
  background: #0f0f0f;
  border-radius: 3px;
  border: solid 1px #1f1f1f;
  box-shadow: 3px 3px 0px 0px rgb(0 0 0 / 30%);
  box-sizing: border-box;
  z-index: 10;
}

.context-menu-section {
  padding-bottom: 5px;
  border-bottom: solid 1px #333333;
  margin-bottom: 5px;
}
.context-menu-section:last-child {
  padding-bottom: 0px;
  border-bottom: none;
  margin-bottom: 0px;
}

.context-menu-element li {
  list-style: none;
  user-select: none;
  font-family: "Inter";
  font-size: 10pt;
  color: #999999;
  padding: 4px 12px;
  border-radius: 3px;
  cursor: pointer;
}
.context-menu-element li:hover {
  background: #1f1f1f;
}

</style>
