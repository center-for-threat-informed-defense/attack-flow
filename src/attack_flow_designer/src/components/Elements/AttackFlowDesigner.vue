<template>
  <div class="attack-flow-designer-container">
    <AppTitleBar id="toolbar"></AppTitleBar>
    <div class="attack-flow-designer-contents">
      <AttackFlowCanvas class="attack-flow-canvas" />
      <AppNotifications class="notifications"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "vuex";
import "@/assets/fonts/inter.css"

// Components
import AttackFlowCanvas from "./AttackFlowCanvas.vue";
import AppTitleBar from "./AppTitleBar.vue";
import AppNotifications from "./AppNotifications.vue";

// Default Session
import AttackFlowSchema from "@/assets/attack_flow_schema.json";
import DefaultSession from "@/assets/attack_flow_default_session.json";

export default defineComponent({
  name: "AttackFlowDesigner",
  methods: {
    ...mapActions(["importSession", "pushNotification"]),
  },
  created() {
    this.importSession({ session: DefaultSession, schema: AttackFlowSchema });
    this.pushNotification({
      type: "info",
      title: "Notice",
      description: "The Attack Flow schema and this designer are still under active development, both are subject to change.",
      time: 8000
    })
  },
  components: { AppTitleBar, AppNotifications, AttackFlowCanvas },
});
</script>

<style scoped>
.attack-flow-designer-container {
  font-family: "Inter";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #121212;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
    
    font-weight: 700;
    font-size: 10pt;
    color: #666666;
    padding: 0px 9px;
    user-select: none;
    height: 100%;
    display: inline-flex;
    align-items: center;
}

.attack-flow-designer-header .logo {
    font-weight: 800;
    float: right;
}

.attack-flow-designer-contents {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.notifications {
  position: absolute;
  top:0px;
  left: 0px;
  width: 100%;
  height: 100%;
  pointer-events: none;
  padding: 15px;
  box-sizing: border-box;
}

.attack-flow-canvas {
  width: 100%;
  height: 100%;
}

#toolbar {
  height: 30px;
  box-sizing: border-box;
  border-bottom: solid 1px #404040;
  background: #262626;
  color: #9e9e9e;
  padding: 0px 5px;
}

</style>
