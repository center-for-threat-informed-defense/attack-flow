<template>
  <div class="dropdown-field-input" @click="showDropdown = true">
    <div class="dropdown-field">
      <div class="dropdown-text">
        <slot :selected="options[selection]">
          <span class="slot-fallback" :class="`align-${align}`">{{ options[selection][textKey] }}</span>
        </slot>
      </div>
      <div class="dropdown-arrow">▼</div>
    </div>
    <div :class="['dropdown-options',`align-${align}`]" v-show="showDropdown" :style="{ marginTop: `${dropMargin}px` }">
      <li v-for="(option, i) of options" :key="option.text" :class="`align-${align}`" @click.stop="select(i)">
        {{ option[textKey] }}
      </li>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Dropdown",
  props: {
    value      : { type: Number, default: 0 },
    textKey    : { type: String, default: "text" },
    options    : { type: Array, required: true },
    align      : { type: String, default: "left" },
    dropMargin : { type: Number, default: 4 }
  },
  data() {
    return {
      showDropdown: false,
      clickOutsideHandler: (event: MouseEvent) => {}
    };
  },
  computed: {
    selection: {
      get() {
        return Math.min(this.value, this.options.length - 1);
      },
      set(index: number) {
        this.$emit("change", index);
      }
    }
  },
  emits: {
    change: (value: number) => true,
  },
  methods: {
    select(selection: number) {
      this.selection = selection;
      this.showDropdown = false;
    },
  },
  mounted() {
    this.clickOutsideHandler = function(this: any, event: MouseEvent) {
      if (this.$el != event.target && !this.$el.contains(event.target)) {
        this.showDropdown = false;
      }
    }.bind(this);
    document.body.addEventListener("click", this.clickOutsideHandler);
  },
  destroyed() {
    document.body.removeEventListener("click", this.clickOutsideHandler);
  }
});
</script>

<style scoped>
.dropdown-field-input {
  position: relative;
}

.dropdown-field {
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.dropdown-text {
  flex: 1;
  padding: 6px 0px;
}
.dropdown-arrow {
  font-family: "Inter";
  font-size: 7pt;
  color: #666666;
  padding-right: 10px;
}

.slot-fallback {
  display: block;
  width: 100%;
  padding: 0px 8px 0px 12px;
  box-sizing: border-box;
  font-family: "Inconsolata";
  color: #bfbfbf;
  font-size: 10pt;
}

.dropdown-options {
  width: max-content;  
  top: 100%;
  position: absolute;
  max-width: 500px;
  padding: 8px;
  background: #0f0f0f;
  border-radius: 3px;
  box-shadow: 2px 2px 0px 0px rgb(0 0 0 / 30%);
  box-sizing: border-box;
  z-index: 10;
}
.align-left.dropdown-options {
  left: 2px;
}
.align-right.dropdown-options {
  right: 2px;
}

.dropdown-options li {
  list-style: none;
  user-select: none;
  font-family: "Inter";
  font-size: 10pt;
  color: #999999;
  padding: 4px 12px;
  border-radius: 3px;
  cursor: pointer;
}
.dropdown-options li:hover {
  background: #1f1f1f;
}

.align-left {
    text-align: left;
}
.align-right {
    text-align: right;
}
</style>
