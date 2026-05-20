<template>
  <div class="create-tag-form">
    <div class="field-item">
      <p class="field-name">
        {{ draftTagNameProperty.name }}
      </p>
      <TextField
        class="field-value"
        :property="draftTagNameProperty"
        @execute="executeDraftCommand"
      />
    </div>

    <div class="field-item">
      <p class="field-name">
        {{ draftTagColorProperty.name }}
      </p>
      <ColorField
        class="field-value"
        :property="draftTagColorProperty"
        @execute="executeDraftCommand"
      />
    </div>

    <div class="create-tag-actions">
      <button
        type="button"
        class="create-tag-button"
        :disabled="disabled || !draftTagName.trim()"
        @pointerdown="submit"
      >
        Create Tag
      </button>
      <button
        type="button"
        class="create-tag-button secondary"
        :disabled="disabled"
        @pointerdown="cancel"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  ColorProperty,
  DictionaryProperty,
  StringProperty
} from "@OpenChart/DiagramModel";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
import TextField from "./TextField.vue";
import ColorField from "./ColorField.vue";

const DEFAULT_TAG_COLOR = "#000000";

function createDraftTagProperty(name: string, color: string): DictionaryProperty {
  const property = new DictionaryProperty({
    id: "draft-tag",
    name: "Tag",
    editable: true
  });
  const nameProperty = new StringProperty({
    id: "name",
    name: "Name",
    editable: true
  }, name);
  const colorProperty = new ColorProperty({
    id: "color",
    name: "Color",
    editable: true
  }, color);

  property.addProperty(nameProperty, "name");
  property.addProperty(colorProperty, "color");
  property.representativeKey = "name";
  return property;
}

export default defineComponent({
  name: "NewTagForm",
  props: {
    defaultName: {
      type: String,
      default: ""
    },
    defaultColor: {
      type: String as PropType<string>,
      default: DEFAULT_TAG_COLOR
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    create: (tag: { text: string, color: string }) => tag,
    cancel: () => true
  },
  data() {
    return {
      draftTagProperty: createDraftTagProperty(this.defaultName, this.defaultColor)
    };
  },
  computed: {
    draftTagNameProperty(): StringProperty {
      return this.draftTagProperty.value.get("name") as StringProperty;
    },

    draftTagColorProperty(): ColorProperty {
      return this.draftTagProperty.value.get("color") as ColorProperty;
    },

    draftTagName(): string {
      return this.draftTagNameProperty.value ?? "";
    },

    draftTagColor(): string {
      return this.draftTagColorProperty.value ?? DEFAULT_TAG_COLOR;
    }
  },
  methods: {
    executeDraftCommand(cmd: SynchronousEditorCommand) {
      cmd.execute();
    },
    submit() {
      const text = this.draftTagName.trim();
      if (!text) return;

      this.$emit("create", {
        text,
        color: this.draftTagColor || DEFAULT_TAG_COLOR
      });
    },
    cancel() {
      this.$emit("cancel");
    }
  },
  components: {
    TextField,
    ColorField
  }
});
</script>

<style scoped>
.create-tag-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 10px;
  border: solid 1px var(--af-border-color-tertiary);
  border-radius: 4px;
  background: var(--af-bg-color-primary);
}
.field-item {
  margin-bottom: 14px;
}
.field-item:last-child {
  margin-bottom: 0;
}
.field-name {
  color: var(--af-text-color-secondary);
  font-size: 9.5pt;
  font-weight: 500;
  margin-bottom: 6px;
}
.field-value {
  width: 100%;
  font-size: 10.5pt;
  box-sizing: border-box;
}
.field-value.text-field-control,
.field-value {
  min-height: 30px;
  border-radius: 4px;
  background: var(--af-bg-color-secondary);
  overflow: hidden;
}
.create-tag-actions {
  display: flex;
  gap: 8px;
}
.create-tag-actions .create-tag-button {
  justify-content: center;
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
.create-tag-button.secondary {
  border-color: var(--af-border-color-primary);
}
</style>
