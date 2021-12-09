<template>
  <div class="attack-flow-node-element">
    <div 
      class="attack-flow-node-header" :style="headerStyle"
      @pointerdown="$emit('dragStart', $event)"
    >
      {{ node.type.toLocaleUpperCase() }}
      <div class="link-area">
          <div class="link-icon" @mousedown="$emit('linkStart', $event)" @pointerdown.stop><PlugIcon /></div>
          <div class="link-chip" :style="{ background: this.schema.color }"></div>
      </div>
    </div>
    <div class="attack-flow-node-content">
      <!-------- Subtype Field -------->
      <div class="subtype" v-if="schema.subtype !== null">
        <TextField
          v-if="schema.subtype.type === 'string'"
          :value="node.subtype"
          @change="onSubtypeUpdate"
        />
        <Dropdown 
          v-if="schema.subtype.type === 'dropdown'"
          :value="node.subtype"
          :textKey="schema.subtype.textKey"
          :options="schema.subtype.options"
          @change="onSubtypeUpdate"
        >
          <template v-if="schema.subtype.list==='technique'" v-slot:default="{ selected }">
            <div class="technique-selection">
              <p class="tactic-badge">{{ selected.tactic.toLocaleUpperCase() }}</p>
              <p class="technique">{{ selected.technique }} <span>({{ selected.id }})</span></p>
            </div>
          </template> 
        </Dropdown>
        <Dropdown 
          v-if="schema.subtype.type === 'boolean'"
          :value="node.subtype ? 1 : 0"
          :options="[{ text: 'false' }, { text: 'true' }]"
          @change="value => onSubtypeUpdate(value === 1)"
        />
        <NumberField
          v-if="schema.subtype.type === 'number'"
          :value="node.subtype"
          @change="onSubtypeUpdate"
        />
      </div>
      <!-------- Subtype Field -------->
      <!--------- Fields List --------->
      <div class="fields-list" v-if="schema.fields.size !== 0">
        <div class="field-row" v-for="[name, field] of schema.fields" :key="name">
          <span class="field-name">{{ name }}</span>
          <span class="field-value">
            <TextField
              v-if="field.type === 'string'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="node.payload[name]"
              align="right"
            />
            <Dropdown
              v-if="field.type === 'boolean'"
              @change="value => onFieldUpdate(name, value === 1)"
              :value="node.payload[name] ? 1 : 0"
              :options="[{ text: 'false' }, { text: 'true' }]"
              align="right"
            />
            <Dropdown
              v-if="field.type === 'dropdown'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="node.payload[name]"
              :textKey="field.textKey"
              :options="field.options"
              align="right"
            />
            <NumberField
              v-if="field.type === 'number'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="node.payload[name]"
              align="right"
            />
          </span>
        </div>
      </div>
      <!--------- Fields List --------->
      <div class="empty-type" v-if="!schema.subtype && !schema.fields.size">
        <p>[ Missing Type Definition ]</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "vuex";

import PlugIcon from "@/components/Vectors/PlugIcon.vue";
import TextField from "@/components/Controls/Fields/TextField.vue";
import Dropdown from "@/components/Controls/Fields/Dropdown.vue";
import NumberField from "@/components/Controls/Fields/NumberField.vue";

export default defineComponent({
  name: "AttackFlowNode",
  props: {
    id : {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState({
      node(state: Types.DesignerStore): Types.CanvasNode {
        return state.session.nodes.get(this.id) ?? {
          id: this.id,
          type: `UNKNOWN NODE: '${ this.id }'`,
          subtype: 0,
          payload: {},
          x0: 0,
          x1: 0,
          y0: 0,
          y1: 0
        };
      },
      schemas(state: Types.DesignerStore): Map<string, Types.NodeSchema> {
        return state.schema.nodes;
      },
    }),
    schema() : Types.NodeSchema {
      return this.schemas.get(this.node.type) ?? {
        color: "#1f1f1f", 
        outline: "#383838",
        subtype: null,
        fields: new Map(),
        fieldsText : ""
      };
    },
    headerStyle(): Object {
      return {
        background: this.schema.color,
        borderColor: this.schema.outline,
      };
    },
  },
  emits: {
    dragStart: (event: PointerEvent) => true,
    linkStart: (event: PointerEvent) => true
  },
  methods: {
    ...mapActions(["setNodeSubtype", "setNodeField"]),
    onSubtypeUpdate(value: any) {
      this.setNodeSubtype({ id: this.id, value })
    },
    onFieldUpdate(field: string, value: any) {
      this.setNodeField({ id: this.id, value, field })
    },
  },
  components: { PlugIcon, TextField, NumberField, Dropdown },
});
</script>

<style scoped>
.attack-flow-node-element {
  font-family: "Inter";
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.3);
}

.attack-flow-node-header {
  position: relative;
  border: solid 1px;
  font-weight: 800;
  font-size: 10pt;
  color: #d8d8d8;
  padding: 6px 10px;
  box-sizing: border-box;
  border-top-left-radius: 4px;
  border-top-right-radius: 10px;
  user-select: none;
  cursor: pointer;
}

.attack-flow-node-content {
  padding: 12px;
  flex: 1;
  background: #1f1f1f;
  border: solid 1px #383838;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.subtype {
  background: #242424;
  border: solid 1px #383838;
  border-radius: 3px;
}

.technique-selection {
  padding: 4px 12px;
}

.technique-selection .tactic-badge {
  font-size: 8.5pt;
  background: #383838;
  color: #999999;
  font-weight: 500;
  padding: 3px 5px;
  display: inline-block;
  border-radius: 2px;
  margin-bottom: 5px;
}

.technique-selection .technique {
  color: #bfbfbf;
  font-weight: 700;
  font-size: 12pt;
  display: block;
  padding: 0px 2px;
}

.technique-selection .technique span {
  color: #a1a1a1;
  font-size: 10pt;
}

.fields-list {
  display: table;
  border: solid 1px #383838;
  border-radius: 3px;
}
.field-row {
  display: table-row;
  border-bottom: solid 1px #383838;
}
.field-name,
.field-value {
  display: table-cell;
  border-bottom: solid 1px #383838;
  vertical-align: middle;
}
.field-row:last-child .field-name,
.field-row:last-child .field-value {
  border-bottom: none;
}

.field-name {
  padding: 7px 8px;
  background: #242424;
  border-right: solid 1px #383838;
  font-family: "Inconsolata";
  font-size: 11pt;
  color: #999999;
}

.subtype + .fields-list {
    margin-top: 10px;
}

.link-area {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 55px;
  height: 22px;
  overflow: hidden;
}
.link-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: right;
  height: 100%;
  width: 100%;
  padding-right: 12px;
  background: #1f1f1f;
  border: solid 1px #383838;
  border-top-right-radius: 4px;
  box-sizing: border-box;
}
.link-chip {
  position: absolute;
  top: 7px;
  left: -15px;
  height: 30px;
  width: 33px;
  transform: rotate(45deg);
  border-top: solid 1px #383838;
}

p { margin: 0px }

.empty-type {
  color: #999999;
  font-size: 11pt;
  padding: 5px;
}

</style>
