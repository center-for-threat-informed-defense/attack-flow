<template>
  <BlockDiagram class="diagram" />
</template>

<script lang="ts">
import { mapActions } from 'vuex';
import { defineComponent } from 'vue';
import BlockDiagram from "@/components/Elements/BlockDiagram.vue";

import FILE from "@/assets/test_file.json";

export default defineComponent({
  name: 'App',
  components: {
    BlockDiagram
  },
  methods: {
    ...mapActions("ActiveDocumentStore", ["openDocument"])
  },
  created() {
    this.openDocument(FILE);
  }
});
</script>

<style>

html, body {
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

.diagram { 
  width: 100%;
  height: 100%;
}
</style>
