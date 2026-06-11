<template>
  <div
    class="multiselect-field-control"
    :class="{ column: direction === 'column' }"
  >
    <div
      v-if="!options.length"
      class="no-options"
    >
      No options available.
    </div>

    <button
      v-for="opt in options"
      :key="opt.value as string"
      type="button"
      class="option"
      :class="[{ active: isSelected(opt.value as string) }, { dim: opt.feature === false }]"
      :aria-pressed="isSelected(opt.value as string)"
      :disabled="disabled"
      @click="toggle(opt.value as string)"
    >
      <span
        class="checkmark"
        aria-hidden="true"
      >
        {{ isSelected(opt.value as string) ? '✓' : '' }}
      </span>

      <span
        v-if="isTagField"
        class="tag-color-circle"
        :style="{ backgroundColor: getTagColor(opt.value as string) }"
        aria-hidden="true"
      />

      <span class="label">{{ opt.text }}</span>
    </button>

    <button
      v-if="canCreateTag && !showCreateTagForm"
      type="button"
      class="create-tag-button"
      :disabled="disabled"
      @pointerdown="beginCreateTag"
    >
      <span><PlusIcon /></span>Create New Tag
    </button>

    <div v-if="canCreateTag && showCreateTagForm">
      <NewTagForm
        :disabled="disabled"
        @create="submitCreateTag"
        @cancel="cancelCreateTag"
      />
    </div>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@OpenChart/DiagramEditor";
import { defineComponent, type PropType } from "vue";
import type { OptionItem } from "@/assets/scripts/Browser";
import {
  DictionaryProperty,
  ListProperty,
  MultiSelectProperty,
  Property
} from "@OpenChart/DiagramModel";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
import { useApplicationStore } from "@/stores/ApplicationStore";
import PlusIcon from "@/components/Icons/PlusIcon.vue";
import NewTagForm from "./NewTagForm.vue";

const DEFAULT_TAG_COLOR = "#cccccc";

export default defineComponent({
  name: "MultiSelectField",
  props: {
    property: {
      // Support new MultiSelectProperty as the data model
      type: Object as PropType<MultiSelectProperty>,
      required: true
    },
    featuredOptions: {
      type: Set as PropType<Set<string>>,
      required: false,
      default: () => new Set<string>()
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // Layout direction for the rendered options
    direction: {
      type: String as PropType<"row" | "column">,
      default: "column"
    }
  },
  emits: {
    execute: (cmd: SynchronousEditorCommand) => cmd
  },
  data() {
    return {
      showCreateTagForm: false
    };
  },
  computed: {
    isTagField(): boolean {
        // Optional chaining to safely check the nested parent structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.property as any).id === "tags";
    },

    canCreateTag(): boolean {
        return this.isTagField && !!this.canvasTagsProperty;
    },

    canvasTagsProperty(): ListProperty | undefined {
        const app = useApplicationStore();
        const canvas = app?.activeEditor?.file?.canvas;
        return canvas?.properties.value.get("tags") as ListProperty | undefined;
    },

    /**
     * Build options from the MultiSelectProperty's options list.
     */
    options(): OptionItem<string>[] {
        // 1. If it's a tag field, we must sync the global Canvas Tags
        // into this specific property's options list first.
        if (this.isTagField) {
            const globalTags = this.canvasTags;
            const localOptionsList = this.property.options as ListProperty;

            if (localOptionsList) {
                // Clear and rebuild the local options Map to match the global Canvas Tags
                localOptionsList.value.clear();
                for (const tag of globalTags) {
                    // We use the UUID as the Key, and the Tag Object as the Value
                    // This is what makes it "structured the same" as non-tags
                    localOptionsList.value.set(tag.id, tag as unknown as Property);
                }
            }
        }

        // 2. NOW the logic is identical for both situations
        const optionsProp: ListProperty | undefined = this.property.options;
        const options: OptionItem<string>[] = [];

        if (!optionsProp || !optionsProp.value) {
            return options;
        }

        const fo = this.featuredOptions;

        // 3. This loop now works for BOTH standard enums and Tags
        for (const [value, prop] of optionsProp.value) {
            // For tags, 'prop' is now the tag object from canvasTags
            // For non-tags, 'prop' is the standard Enum property
            const text = prop.name || prop.toString();
            const feat = fo ? fo.has(value) : true;

            options.push({ value, text, feature: feat });
        }

        // 4. Consistent Sort
        return options.sort((a, b) => {
            if (a.feature && !b.feature) return -1;
            if (!a.feature && b.feature) return 1;
            return 0;
        });
    },

    /**
     * Current selection derived from MultiSelectProperty.
     */
    selectedValues(): Set<string> {
      return new Set<string>(this.property.values as Iterable<string>);
    },

    /**
     * Retrieves the master list of tags defined at the Canvas level.
     */
    canvasTags(): Array<{ id: string, name: string, color: string }> {
        const tagsProp = this.canvasTagsProperty;
        if (!tagsProp) return [];

        const results: Array<{ id: string, name: string, color: string }> = [];

        // 3. Iterate through the dictionaries in the list
        for (const [key, prop] of tagsProp.value) {
            const dict = prop as DictionaryProperty;
            results.push({
                id: dict.value.get("id")?.toJson() as string || key,
                name: dict.value.get("name")?.toString() || "Unnamed Tag",
                color: dict.value.get("color")?.toJson() as string || DEFAULT_TAG_COLOR
            });
        }

        return results;
    }
  },
  methods: {
    isSelected(value: string): boolean {
      return this.selectedValues.has(value);
    },
    toggle(value: string) {
      if (this.disabled) return;
      const next = new Set(this.selectedValues);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      const out = Array.from(next);
      const cmd = EditorCommands.setMultiSelectProperty(this.property, out);
      this.$emit("execute", cmd);
    },
    getTagColor(tagId: string): string {
        const tag = this.canvasTags.find(t => t.id === tagId);
        return tag ? tag.color : DEFAULT_TAG_COLOR;
    },
    beginCreateTag() {
        if (this.disabled) return;
        this.showCreateTagForm = true;
    },
    cancelCreateTag() {
        this.showCreateTagForm = false;
    },
    submitCreateTag(tag: { text: string, color: string }) {
        if (this.disabled) return;

        const tagsProperty = this.canvasTagsProperty;
        if (!tagsProperty) return;

        const cmd = EditorCommands.createAndAssignTag(
            tagsProperty,
            this.property,
            tag
        );
        this.$emit("execute", cmd);
        this.cancelCreateTag();
    }
  },
  components: {
    PlusIcon,
    NewTagForm
  }
});
</script>

<style scoped>
.multiselect-field-control {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 6px;
  color: var(--af-text-color-primary);
}
.multiselect-field-control.column {
  flex-direction: column;
}
.no-options {
  font-size: 9pt;
  color: var(--af-text-color-disabled);
  padding: 8px 8px 4px;
  line-height: 1.4;
}
.option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--af-text-color-primary);
  font-size: 10pt;
  font-family: inherit;
  padding: 6px 10px;
  min-height: 32px;
  border: solid 1px var(--af-border-color-primary);
  border-radius: 4px;
  background: var(--af-bg-color-primary);
  cursor: pointer;
  user-select: none;
  width: 100%;
  box-sizing: border-box;
}
.option:hover:not(:disabled) {
  color: var(--af-text-color-hover-action);
  border-color: var(--af-bg-color-hover-action);
  background: var(--af-bg-color-hover-action);
}
.option:focus-visible {
  outline: solid 2px var(--af-color-info);
  outline-offset: 1px;
}
.option.dim {
  color: var(--af-text-color-disabled);
}
.option.active {
  color: var(--af-color-info);
  border-color: var(--af-color-info);
  background: var(--af-bg-color-tertiary);
  font-weight: 500;
}
.option.active:hover:not(:disabled) {
  color: var(--af-text-color-hover-action);
  border-color: var(--af-bg-color-hover-action);
  background: var(--af-bg-color-hover-action);
}
.option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.checkmark {
  width: 1em;
  color: var(--af-color-info);
  font-weight: 600;
  text-align: center;
}
.label {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.create-tag-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 4px 10px;
  color: var(--af-text-color-primary);
  font-size: 9pt;
  font-family: inherit;
  border: solid 1px var(--af-border-color-tertiary);
  border-radius: 3px;
  background: none;
}
.create-tag-button:hover:not(:disabled) {
  background: var(--af-border-color-secondary);
}
.create-tag-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.create-tag-button span {
  margin-right: 9px;
}

.tag-color-circle {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
