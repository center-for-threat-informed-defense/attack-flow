<template>
    <div class="find-dialog-container" :class="{
        hidden:
            !isShowingFindDialog
    }">
        <input type="text" class="query" placeholder="Find" v-model="query" @keyup="runQuery" ref="query">
        <div class="results">
            <span v-if="totalResults === 0">No results</span>
            <span v-if="totalResults !== 0">{{ currentResultIndex + 1 }} of {{ totalResults }}</span>
        </div>
        <div class="control" @pointerdown="findPrevious()" :class="{
            disabled:
                totalResults === 0
        }">
            <UpArrow />
        </div>
        <div class="control" @pointerdown="findNext()" :class="{
            disabled:
                totalResults === 0
        }">
            <DownArrow />
        </div>
        <div class="control" @pointerdown="hideFindDialog()">
            <Close color="#8c8c8c" />
        </div>
    </div>
</template>

<script lang="ts">
import * as Store from "@/store/StoreTypes";
// Dependencies
import { defineComponent } from "vue";
import { mapGetters, mapMutations, mapState } from "vuex";
import * as App from "@/store/Commands/AppCommands";
import * as Page from "@/store/Commands/PageCommands";
import Debouncer from "@/assets/scripts/BlockDiagram/Utilities/Debouncer";
// Components
import Close from "@/components/Icons/Close.vue";
import DownArrow from "@/components/Icons/DownArrow.vue";
import UpArrow from "@/components/Icons/UpArrow.vue";

export default defineComponent({
    name: "FindDialog",
    data() {
        return {
            query: "",
            lastQuery: "",
            debouncer: new Debouncer(0.4),
            totalResults: 0,
            currentResultIndex: 0,
            currentDiagramObject: null as any,
        }
    },
    computed: {
        ...mapState("ApplicationStore", {
            ctx(state: Store.ApplicationStore): Store.ApplicationStore {
                return state;
            },
            editor(state: Store.ApplicationStore): Store.PageEditor {
                return state.activePage;
            }
        }),

        ...mapGetters("ApplicationStore", ["isShowingFindDialog", "currentFindResult"]),
    },
    components: {
        Close,
        DownArrow,
        UpArrow,
    },
    watch: {
        isShowingFindDialog: {
            handler(isShowingFindDialog, oldValue) {
                if (isShowingFindDialog) {
                    this.focus();
                } else {
                    this.blur();
                }
            }
        },
        currentFindResult: {
            handler(newResult, oldResult) {
                if (newResult !== null) {
                    this.currentResultIndex = newResult.index;
                    this.totalResults = newResult.totalResults;
                    if (this.currentDiagramObject !== newResult.diagramObject) {
                        this.currentDiagramObject = newResult.diagramObject;
                        this.execute(new Page.UnselectDescendants(this.editor.page));
                        this.execute(new Page.SelectObject(this.currentDiagramObject));
                        this.execute(new Page.MoveCameraToSelection(this.ctx, this.editor.page))
                    }
                } else {
                    this.totalResults = 0;
                }
            }
        }
    },
    methods: {
        /**
         * Application Store mutations
         */
        ...mapMutations("ApplicationStore", ["execute"]),

        /**
         * Focus the input field and highlight existing text
         */
        focus() {
            const queryInput = this.$refs.query as HTMLInputElement;
            queryInput.focus();
            queryInput.select();
        },

        /**
         * Blur the input field.
         */
        blur() {
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
                    this.execute(new App.MoveToPreviousFindResult(this.ctx));
                } else {
                    this.execute(new App.MoveToNextFindResult(this.ctx));
                }
            } else if (this.query !== this.lastQuery) {
                this.debouncer.call(() => {
                    this.lastQuery = this.query;
                    this.ctx.finder.runQuery(this.ctx.activePage, this.query);
                });
            }
        },

        /**
         * Focus the next item in the result set.
         */
        findNext() {
            this.execute(new App.MoveToNextFindResult(this.ctx));
        },

        /**
         * Focus the previous item in the result set.
         */
        findPrevious() {
            this.execute(new App.MoveToPreviousFindResult(this.ctx));
        },

        /**
         * Hide the find dialog.
         */
        hideFindDialog() {
            this.execute(new App.HideFindDialog(this.ctx));
        },
    }
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
