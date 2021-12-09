<template>
  <div class="attack-flow-edge-element">
    <div class="attack-flow-edge-content">
      <!-------- Type Field -------->
      <div class="type"> 
        <Dropdown :value="type" :options="types" @change="onTypeUpdate">
          <template v-slot:default="{ selected }">
            <div class="type-info">
              <div class="type-color"><span :style="{ background: schema.color }"></span></div>
              <p class="type-text">{{ selected.text }}</p>
            </div>
          </template>
        </Dropdown>
      </div>
      <!-------- Type Field -------->
      <!--------- Fields List --------->
      <div class="fields-list" v-if="schema.fields.size !== 0">
        <div class="field-row" v-for="[name, field] of schema.fields" :key="name">
          <span class="field-name">{{ name }}</span>
          <span class="field-value">
            <TextField
              v-if="field.type === 'string'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="edge.payload[name]"
              align="right"
            />
            <Dropdown
              v-if="field.type === 'boolean'"
              @change="value => onFieldUpdate(name, value === 1)"
              :value="edge.payload[name] ? 1 : 0"
              :options="[{ text: 'false' }, { text: 'true' }]"
              align="right"
            />
            <Dropdown
              v-if="field.type === 'dropdown'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="edge.payload[name]"
              :textKey="field.textKey"
              :options="field.options"
              align="right"
            />
            <NumberField
              v-if="field.type === 'number'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="edge.payload[name]"
              align="right"
            />
          </span>
        </div>
      </div>
    </div>
    <!--------- Fields List --------->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "vuex";
import { sentenceCase } from "@/assets/StringTools";

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
      edge(state: Types.DesignerStore): Types.CanvasEdge {
        return state.session.edges.get(this.id) ?? {
          id: this.id,
          sourceId: "-1",
          targetId: "-1",
          source: { x0: 0, x1: 0, y0: 0, y1: 0},
          target: { x0: 0, x1: 0, y0: 0, y1: 0},
          type: null,
          payload: {}
        };
      },
      schemas(state: Types.DesignerStore): Map<string, Types.EdgeSchema> {
        return state.schema.edges;
      },
    }),
    schema(): Types.EdgeSchema {
      if(this.edge.type === null) {
        return { 
          color: "#4d4d4d", 
          fields: new Map(), 
          fieldsText: "" 
        };
      } else {
        return this.schemas.get(this.edge.type) ?? { 
          color: "#4d4d4d", 
          fields: new Map(), 
          fieldsText: ""
        };
      }
    },
    types() {
      return ["no edge type", ...this.schemas.keys()].map(type => ({ 
        text: sentenceCase(type),
        value: type
      }))
    },
    type() {
      let type = this.edge.type ?? "no edge type";
      let index = this.types.findIndex(o => o.value === type);
      return index === -1 ? 0 : index;
    }
  },
  methods: {
    ...mapActions(["setEdgeType", "setEdgeField"]),
    onTypeUpdate(index: number) {
      let value = index === 0 ? null : this.types[index].value;
      this.setEdgeType({ id: this.id, value });
    },
    onFieldUpdate(field: string, value: any) {
      this.setEdgeField({ id: this.id, field, value })
    }
  },
  components: { TextField, NumberField, Dropdown },
});
</script>

<style scoped>

.attack-flow-edge-element {
  font-family: "Inter";
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.3);
	padding: 12px;
  background: #1f1f1f;
  border: solid 1px #383838;
  border-radius: 4px;
}

.type {
  background: #242424;
  border: solid 1px #383838;
  border-radius: 3px;
}

.type-info {
  display: flex;
  align-items: center;
  padding: 2px 10px;
}

.type-info .type-text {
  color: #bfbfbf;
  font-weight: 700;
  font-size: 11pt;
  display: block;
  padding: 0px 2px;
}

.type-info .type-color{
  border-radius: 4px;
  margin-right: 6px;
  border: solid 1px #4d4d4d;
  padding: 1px;
  overflow: hidden;
}
.type-info .type-color span {
  width: 12px;
  height: 12px;
  display: block;
  border-radius: 2px;
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

.type + .fields-list {
    margin-top: 10px;
}

p { margin: 0px }
</style>
