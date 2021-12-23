<template>
  <div class="context-menu-listing-control" :style="offset">
    <input type="file" ref="file" style="display:none" @change="readFile">
    <div class="section" v-for="section of sections" :key="section.name">
      <template v-for="item of section.items" :key="item.id">
        <li 
          v-if="item.type === 'submenu'"
          :class="{ disabled: item.disabled }"
          @mouseenter="subMenuEnter(item)"
          @mouseleave="subMenuLeave"
        >
          <a class="item">
            <span class="text">{{ item.text }}</span>
            <span class="more-arrow"></span>
          </a>
          <div class="submenu" v-if="item.id === focusedSubMenu">
            <ContextMenuListing :sections="item.sections" @select="select"/>
          </div>
        </li>
        <li v-else :class="{ disabled: item.disabled }" @click="fireAction(item)">
          <a class="item" :href="item.link" target="_blank">
            <span class="check" v-show="item.value">✓</span>
            <span class="text">{{ item.text }}</span>
            <span v-if="item.shortcut" class="shortcut">{{ formatShortcut(item.shortcut) }}</span>
          </a>
        </li>
      </template>
      <a class="section-divider"></a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

const SHORTCUT_KEY_TO_TEXT: { [key: string]: string } = {
    Control: "Ctrl",
    Escape: "Esc",
    ArrowLeft: "←",
    ArrowUp: "↑",
    ArrowRight: "→",
    ArrowDown: "↓",
    Delete: "Del"
}

export default defineComponent({
  name: 'ContextMenuListing',
  props: {
    sections: {
      type: Array as PropType<Array<Types.ContextMenuItem>>,
      required: true
    }
  },
  data() {
    return {
      leaveTimeout: 500,
      leaveTimeoutRef: 0,
      focusedSubMenu: null as string | null,
      xOffset: 0 as number,
      yOffset: 0 as number,
      selectedFileId: null as string | null
    }
  },
  computed: {
    offset() {
      return {
        marginTop: `${ this.yOffset }px`,
        marginLeft: `${ this.xOffset }px`
      }
    }
  },
  emits: ["select"],
  methods: {
    
    /**
     * Submenu hide/show behavior
     */
    subMenuEnter(item: Types.ContextMenuItem) {
      clearInterval(this.leaveTimeoutRef);
      if(!item.disabled) {
        this.focusedSubMenu = item.id;
      }
    },
    subMenuLeave() {
      this.leaveTimeoutRef = setTimeout(() => {
        this.focusedSubMenu = null;
      }, this.leaveTimeout)
    },

    /**
     * Menu item selection behavior
     */
    fireAction(item: Types.ContextMenuItem) {
      if(item.disabled)
        return;
      let { id, data } = this.parseId(item.id);
      switch(item.type) {
        case "file":
          (this.$refs.file as any).click();
          this.selectedFileId = id;
          this.select(`__preload_${ id }`, data);
          break;
        case "toggle":
          this.select(id, { ...data, value: item.value });
          break;
        default:
          this.select(id, data);
          break;
      }
    },
    readFile(event: Event) {
      let file = (event.target as any).files[0];
      let reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.select(this.selectedFileId!, {
          filename: file.name,
          file: e.target?.result,
        })
        this.selectedFileId = null;
      }
      reader.readAsText(file);
    },
    select(id: string, data?: any) {
      this.$emit("select", id, data)
      this.focusedSubMenu = null;
    },

    /**
     * Format shortcut text
     */
    formatShortcut(shortcut?: string): string | undefined {
      if(!shortcut) {
        return shortcut;
      } else {
        return shortcut
          .split("+")
          .map(c => c in SHORTCUT_KEY_TO_TEXT ? SHORTCUT_KEY_TO_TEXT[c] : c)
          .join("+");
      }
    },

    /**
     * Parses a context menu id and extracts id parameters.
     * @param id
     *  The context menu id.
     * @returns
     *  The parsed id and id parameters.
     */
    parseId(id: string) {
      let parts = id.split(/#/);
      id = parts[0];
      let params = parts[1].split(/::/);
      let data: any = {};
      // Only parse valid parameters list
      if(params.length % 2 === 0) {
        for(let i = 0; i < params.length; i += 2){
          data[params[i]] = params[i + 1];
        }
      }
      return { id, data };
    }
  
  },
  mounted() {
    // Offset submenu if outside of viewport
    let viewWidth  = window.innerWidth;
    let viewHeight = window.innerHeight;
    let { top, left, bottom, right } = this.$el.getBoundingClientRect();
    this.xOffset = right > viewWidth ? -Math.min(left, right - viewWidth) : 0;
    this.yOffset = bottom > viewHeight ? -Math.min(top, bottom - viewHeight) : 0;
  }
});
</script>

<style scoped>

/** === Main Control === */

.context-menu-listing-control {
  display: flex;
  flex-direction: column;
  width: max-content;
  min-width: 130px;
  color: #cccccc;
  font-size: 10pt;
  padding: 6px 4px;
  border: solid 1px #141414;
  border-radius: 3px;
  box-sizing: border-box;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
  background: #333333;
}

/** === Section Divider === */

.section .section-divider {
  padding: 0px;
  border-bottom: solid 1px #505050;
  margin: 4px 4px;
  cursor: unset;
}
.section:last-child .section-divider {
  border-bottom: none;
  margin: 0px
}

/** === Submenu === */

.submenu {
  position: absolute;
  top: -4px;
  left: 100%;
  padding-left: 6px;
  z-index: 1;
}

/** === Menu Item === */

li {
  position: relative;
  list-style: none;
}
li:not(.disabled):hover {
  background: #7155c3;
  color: #fff;
}

a {
  display: flex;
  padding: 4px 0px;
  cursor: pointer;
}
li.disabled a {
  color: #949494;
  cursor: unset;
}

.text, 
.shortcut,
.more-arrow {
  display: flex;
  align-items: center;
  padding: 0px 23px;
}
.text {
  flex: 1 1 auto;
}
.shortcut {
  flex: 2 1 auto;
  justify-content: right;
}
.check {
  position: absolute;
  left: 5px;
}
.more-arrow::before {
  content: "";
  display: block;
  width: 6px;
  height: 6px;
  border-top: solid 1px;
  border-right: solid 1px;
  transform: rotate(45deg);
}

a {
  text-decoration: none;
  color: inherit;
}

</style>
