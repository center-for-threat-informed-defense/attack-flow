<template>
  <div class="attack-flow-node-element">
    <div 
      class="attack-flow-node-header" 
      :style="headerStyle"
      :class="{ 'has-link-tab': displayLinkTab }"
      @pointerdown="$emit('dragStart', $event)"
    >
      {{ node.type.toLocaleUpperCase().replace(/_/g, " ") }}
      <div v-if="displayLinkTab" class="link-tab">
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
          :required="schema.subtype.required"
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
          :range="schema.subtype.range"
          @change="onSubtypeUpdate"
        />
        <DateTimeField
          v-if="schema.subtype.type === 'datetime'"
          :value="node.subtype"
          :required="schema.subtype.required"
          @change="onSubtypeUpdate"
        />
      </div>
      <!--------- Fields List --------->
      <div class="fields-list" v-if="schema.fields.size !== 0">
        <div class="field-row" v-for="[name, field] of schema.fields" :key="name">
          <span class="field-name">{{ name }}</span>
          <span class="field-value">
            <TextField
              v-if="field.type === 'string'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="node.payload[name]"
              :required="field.required"
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
              :range="field.range"
              align="right"
            />
            <DateTimeField
              v-if="field.type === 'datetime'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="node.payload[name]"
              :required="field.required"
              align="right"
            />
          </span>
        </div>
      </div>
      <!--------- Missing Type Definition --------->
      <div class="empty-type" v-if="!schema.subtype && !schema.fields.size">
        <p>[ Missing Type Definition ]</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "vuex";
import * as Store from "@/store/StoreTypes"
import PlugIcon from "@/components/Vectors/PlugIcon.vue";
import TextField from "@/components/Controls/Fields/TextField.vue";
import Dropdown from "@/components/Controls/Fields/Dropdown.vue";
import NumberField from "@/components/Controls/Fields/NumberField.vue";
import DateTimeField from "@/components/Controls/Fields/DateTimeField.vue"

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
      node(state: Store.ModuleStore): Store.CanvasNode {
        return state.SessionStore.session.nodes.get(this.id) ?? {
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
      nodeSchemas(state: Store.ModuleStore): Map<string, Store.NodeSchema> {
        return state.SchemaStore.nodeSchemas;
      },
      edgeRules(state: Store.ModuleStore): Map<string, Map<string, string>> {
        return state.SchemaStore.edgeRules;
      }
    }),

    /**
     *  Returns the node's schema from the schema store.
     */
    schema() : Store.NodeSchema {
      return this.nodeSchemas.get(this.node.type) ?? {
        type: `UNKNOWN NODE: '${ this.id }'`,
        color: "#1f1f1f", 
        outline: "#383838",
        subtype: null,
        fields: new Map()
      };
    },

    /**
     * Returns true if the link tab should be displayed, false otherwise.
     */
    displayLinkTab(): boolean {
      return this.edgeRules.has("*") || this.edgeRules.has(this.schema.type)
    },

    /**
     * Returns the node's header style.
     */
    headerStyle(): Object {
      return {
        background: this.schema.color,
        borderColor: this.schema.outline,
      };
    },

  },
  emits: ["dragStart", "linkStart"],
  methods: {
    ...mapActions(["setNodeSubtype", "setNodeField"]),
    
    /**
     * Updates the subtype of the node in the session store.
     * @param value
     *  The new subtype value.
     */
    onSubtypeUpdate(value: any) {
      this.setNodeSubtype({ id: this.id, value })
    },

    /**
     * Updates a node's field value in the session store.
     * @param field
     *  The field to update.
     * @param value
     *  The field's new value.
     */
    onFieldUpdate(field: string, value: any) {
      this.setNodeField({ id: this.id, value, field })
    },

  },
  components: { PlugIcon, TextField, NumberField, Dropdown, DateTimeField },
});
</script>

<style scoped>

/** === Main Element === */

p { margin: 0px }

.attack-flow-node-element {
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.3);
}

.attack-flow-node-header {
  position: relative;
  color: #d8d8d8;
  font-size: 10pt;
  font-weight: 800;
  padding: 6px 10px;
  border: solid 1px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  box-sizing: border-box;
  user-select: none;
  cursor: pointer;
}

.attack-flow-node-header.has-link-tab {
  border-top-right-radius: 10px;
}

.attack-flow-node-content {
  flex: 1;
  padding: 12px;
  border: solid 1px #383838;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  background: #1f1f1f;
}

.subtype {
  border: solid 1px #383838;
  border-radius: 3px;
  background: #242424;
}

/** === Technique Dropdown === */

.technique-selection {
  padding: 4px 12px;
}

.technique-selection .tactic-badge {
  display: inline-block;
  color: #999999;
  font-size: 8.5pt;
  font-weight: 500;
  padding: 3px 5px;
  border-radius: 2px;
  margin-bottom: 5px;
  background: #383838;
}

.technique-selection .technique {
  display: block;
  color: #bfbfbf;
  font-weight: 700;
  font-size: 12pt;
  padding: 0px 2px;
}

.technique-selection .technique span {
  color: #a1a1a1;
  font-size: 10pt;
}

/** === Fields Table === */

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
  color: #999999;
  font-family: "Inconsolata";
  font-size: 11pt;
  padding: 7px 8px;
  border-right: solid 1px #383838;
  background: #242424;
}

.subtype + .fields-list {
    margin-top: 10px;
}

/** === Link Tab === */

.link-tab {
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
  border: solid 1px #383838;
  border-top-right-radius: 4px;
  box-sizing: border-box;
  background: #1f1f1f;
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

/** === Empty Type === */

.empty-type {
  color: #999999;
  font-size: 11pt;
  padding: 5px;
}

</style>
