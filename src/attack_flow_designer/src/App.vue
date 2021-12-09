<template>
  <AttackFlowDesigner id="designer"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AttackFlowDesigner from '@/components/Elements/AttackFlowDesigner.vue';

export default defineComponent({
  name: 'App',
  components: { AttackFlowDesigner }
});
</script>

<style>
html, body { 
    width: 100%; height: 100%; 
    margin: 0px; padding: 10px; 
    box-sizing: border-box;
}
#app { height: 100%; width: 100%; }
#designer { width: 100%; height: 100%; }
</style>
