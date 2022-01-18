<template>
  <div class="attack-flow-edge-element">
    <div class="attack-flow-edge-header" :style="headerStyle">
      {{ schema.type.toLocaleUpperCase().replace(/_/g, " ") }}
    </div>
    <div class="attack-flow-edge-content">
      <!--------- Fields List --------->
      <div class="fields-list" v-if="schema.fields.size !== 0">
        <div class="field-row" v-for="[name, field] of schema.fields" :key="name">
          <span class="field-name">{{ name }}</span>
          <span class="field-value">
            <TextField
              v-if="field.type === 'string'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="edge.payload[name]"
              :required="field.required"
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
              :range="field.range"
              align="right"
            />
            <DateTimeField
              v-if="field.type === 'datetime'"
              @change="(value) => onFieldUpdate(name, value)"
              :value="edge.payload[name]"
              :required="field.required"
              align="right"
            />
          </span>
        </div>
      </div>
      <!--------- Fields List --------->
      <div class="empty-type" v-if="!schema.fields.size">
        <p>[ No Fields Defined ]</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "vuex";
import * as Store from "@/store/StoreTypes";
import TextField from "@/components/Controls/Fields/TextField.vue";
import Dropdown from "@/components/Controls/Fields/Dropdown.vue";
import NumberField from "@/components/Controls/Fields/NumberField.vue";
import DateTimeField from "@/components/Controls/Fields/DateTimeField.vue";

export default defineComponent({
  name: "AttackFlowEdgeMenu",
  props: {
    id : { 
      type: String, 
      required: true
    }
  },
  computed: {
    ...mapState({
      edge(state: Store.ModuleStore): Store.CanvasEdge {
        return state.SessionStore.session.edges.get(this.id) ?? {
          id: this.id,
          sourceId: "-1",
          targetId: "-1",
          source: { x0: 0, x1: 0, y0: 0, y1: 0},
          target: { x0: 0, x1: 0, y0: 0, y1: 0},
          type: null,
          payload: {}
        };
      },
      schemas(state: Store.ModuleStore): Map<string, Store.EdgeSchema> {
        return state.SchemaStore.edgeSchemas;
      },
    }),

    /**
     * Returns the edge's schema from the schema store.
     */
    schema(): Store.EdgeSchema {
      if(this.edge.type === null || !this.schemas.has(this.edge.type)) {
        return {
          type: "Unknown Node Schema",
          color: "#4d4d4d",
          outline: "#fff",
          hasArrow: true,
          hasDash: false,
          fields: new Map()
        };
      }
      return this.schemas.get(this.edge.type)!;
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
  methods: {
    ...mapActions(["setEdgeField"]),

    /**
     * Updates an edge's field value in the session store.
     * @param field
     *  The field to update.
     * @param value
     *  The field's new value.
     */
    onFieldUpdate(field: string, value: any) {
      this.setEdgeField({ id: this.id, field, value })
    }

  },
  components: { TextField, NumberField, Dropdown, DateTimeField },
});
</script>

<style scoped>

/** === Main Element === */

p { margin: 0px }

.attack-flow-edge-element {
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.3);
}

.attack-flow-edge-header {
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

.attack-flow-edge-content {
  flex: 1;
  padding: 12px;
  border: solid 1px #383838;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  background: #1f1f1f;
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
  padding: 7px 8px;
  background: #242424;
  border-right: solid 1px #383838;
  font-family: "Inconsolata", monospace;
  font-size: 11pt;
  color: #999999;
}

/** === Empty Type === */

.empty-type {
  color: #999999;
  font-size: 11pt;
  padding: 5px;
}

</style>
