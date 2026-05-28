import { defineAsyncComponent, markRaw } from "vue";
import type { VisualizationRegistration } from "@/assets/scripts/Application/Visualization";

export const TacticTableVisualization: VisualizationRegistration = {
    id: "tactic_table",
    title: "Tactic Table",
    component: markRaw(defineAsyncComponent(
        () => import("@/components/Visualizations/TacticTable.vue")
    )),
    getExportRoot: (root: HTMLElement) => root.querySelector("#tactic-table-vis")
};
