<template>
  <div
    class="find-dialog-container"
    :class="{ hidden: !application.isShowingFindDialog }"
  >
    <input
      type="text"
      class="query"
      placeholder="Find"
      v-model="nextQuery"
      @keyup="runQuery"
      ref="query"
    >
    <div class="results">
      <span v-if="resultsLength === 0">
        No results
      </span>
      <span v-if="resultsLength !== 0">
        {{ resultsIndex }} of {{ resultsLength }}
      </span>
    </div>
    <div
      class="control"
      @pointerdown="findPrevious()"
      :class="{ disabled: resultsLength === 0 }"
    >
      <UpArrowIcon />
    </div>
    <div
      class="control"
      @pointerdown="findNext()"
      :class="{ disabled: resultsLength === 0 }"
    >
      <DownArrowIcon />
    </div>
    <div
      class="control"
      @pointerdown="hideFindDialog()"
    >
      <CloseIcon color="#8c8c8c" />
    </div>
  </div>
</template>

<script lang="ts">
import * as AppCommands from "@/assets/scripts/Application/Commands";
// Dependencies
import { Debouncer } from "@/assets/scripts/Browser";
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";
import type { OpenChartFinder, SearchResult } from "@/assets/scripts/OpenChartFinder";
// Components
import CloseIcon from "@/components/Icons/CloseIcon.vue";
import UpArrowIcon from "@/components/Icons/UpArrowIcon.vue";
import DownArrowIcon from "@/components/Icons/DownArrowIcon.vue";

export default defineComponent({
  name: "FindDialog",
  data() {
    return {
      nextQuery: "",
      lastQuery: "",
      application: useApplicationStore(),
      debouncer: new Debouncer(0.4),
    }
  },
  computed: {
    
    /**
     * The application's active finder.
     * @returns
     *  The application's active finder.
     */
    finder(): OpenChartFinder {
      return this.application.activeFinder;
    },

    /**
     * The application's active editor.
     * @returns
     *  The application's active editor.
     */
    editor(): DiagramViewEditor {
      return this.application.activeEditor;
    },

    /**
     * The active search result.
     * @returns
     *  The active search result.
     */
    result(): SearchResult | null {
      return this.finder.result;
    },

    /**
     * The number of results.
     * @returns
     *  The number of results.
     */
    resultsLength() {
      return this.result?.length ?? 0;
    },

    /**
     * The current result index.
     * @returns
     *  The current result index.
     */
    resultsIndex() {
      return (this.result?.index ?? 0) + 1;
    }

  },
  methods: {

    /**
     * Focus the input field and highlight existing text.
     */
    focusField() {
      const queryInput = this.$refs.query as HTMLInputElement;
      queryInput.focus();
      queryInput.select();
    },

    /**
     * Blur the input field.
     */
    blurField() {
      const queryInput = this.$refs.query as HTMLInputElement;
      queryInput.blur();
    },

    /**
     * Update find results with the current query.
     */
    runQuery(event: KeyboardEvent) {
      if (event.key === "Escape") {
        this.hideFindDialog();
      } else if (event.key === "Enter") {
        if (event.shiftKey) {
          this.findPrevious();
        } else {
          this.findNext();
        }
      } else if (this.nextQuery !== this.lastQuery) {
        this.debouncer.call(() => {
          // Update last query
          this.lastQuery = this.nextQuery;
          // Run query
          const cmd = AppCommands.runSearch(this.finder, this.editor, this.nextQuery);
          this.application.execute(cmd);
        });
      }
    },

    /**
     * Pivots the dialog to the next search result.
     */
    findNext() {
      const cmd = AppCommands.toNextSearchResult(this.finder);
      this.application.execute(cmd);
    },

    /**
     * Pivots the dialog to the previous search result.
     */
    findPrevious() {
      const cmd = AppCommands.toPreviousSearchResult(this.finder);
      this.application.execute(cmd);
    },

    /**
     * Hide the find dialog.
     */
    hideFindDialog() {
      const cmd = AppCommands.hideSearchMenu(this.application);
      this.application.execute(cmd);
    },

  },
  watch: {
    "application.isShowingFindDialog"() {
      if (this.application.isShowingFindDialog) {
        this.focusField();
      } else {
        this.blurField();
      }
    }
  },
  components: {
    CloseIcon,
    UpArrowIcon,
    DownArrowIcon,
  },
});
</script>

<style scoped>
.find-dialog-container {
  position: absolute;
  top: 31px;
  transition: top 0.3s ease-out;
  z-index: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  background-color: #242424;
  border: solid 1px #303030;
  color: #d9d9d9;
  padding: 2px 5px;
}

.hidden {
  /* visibility: hidden; */
  top: -13px;
}

.query {
  color: #d9d9d9;
  background-color: #2e2e2e;
  border: 1px solid #3d3d3d;
  border-radius: 2px;
  height: 20px;
  width: 180px;
  margin: 6px 10px 6px 6px;
  padding: 2px 5px;
}

.query:focus {
  outline: none;
}

.results {
  white-space: nowrap;
  font-size: 10pt;
  margin-right: 1em;
  width: 60px;
}

.control {
  font-size: 14pt;
  /* margin: 0; */
  border-radius: 4px;
  padding: 2px 5px;
}

.control * {
  fill: #8c8c8c;
}

.control.disabled:hover {
  background: none;
}

.control.disabled * {
  fill: #3d3d3d;
}

.control:hover {
  background-color: #383838;
}

.control * {
  position: relative;
  top: 1px;
}
</style>
