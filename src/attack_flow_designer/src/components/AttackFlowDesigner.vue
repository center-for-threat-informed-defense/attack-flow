<template>
  <div class="attack-flow-designer-container">
    <div class="attack-flow-designer-header">
        <span class="menu-item">FILE</span>
        <span class="menu-item">EDIT</span>
        <span class="menu-item">EXPORT</span>
        <span class="logo">ATTACK FLOW DESIGNER</span>
    </div>
    <div class="attack-flow-designer-contents">
      <AttackFlowCanvas class="attack-flow-canvas" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "vuex";

// Components
import AttackFlowCanvas from "./AttackFlowCanvas.vue";

// Default Session
import AttackFlowSchema from "@/assets/attack_flow_schema.json";
import DefaultSession from "@/assets/attack_flow_default_session.json";

export default defineComponent({
  name: "AttackFlowDesigner",
  methods: {
    ...mapActions(["importSession"]),
  },
  created() {
    this.importSession({ session: DefaultSession, schema: AttackFlowSchema });
  },
  components: { AttackFlowCanvas },
});
</script>

<style scoped>
.attack-flow-designer-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #121212;
  border: solid 1px #383838;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 6px;
}

.attack-flow-designer-header {
  background: #1f1f1f;
  border-bottom: solid 1px #383838;
  box-sizing: border-box;
  height: 30px;
}

.attack-flow-designer-header {
    padding: 0px 10px;
}

.attack-flow-designer-header span {
    font-family: "Inter";
    font-weight: 700;
    font-size: 10pt;
    color: #666666;
    padding: 0px 9px;
    user-select: none;
    height: 100%;
    display: inline-flex;
    align-items: center;
}
.attack-flow-designer-header .menu-item:hover {
    background: #333333;
    color: #9e9e9e;
}
.attack-flow-designer-header .logo {
    font-weight: 800;
    float: right;
}

.attack-flow-designer-contents {
  flex: 1;
  overflow: hidden;
}

.attack-flow-canvas {
  width: 100%;
  height: 100%;
}

</style>
