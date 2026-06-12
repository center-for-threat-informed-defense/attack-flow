import { defineAsyncComponent, markRaw } from "vue";
import type { VisualizationRegistration } from "@/assets/scripts/Application/Visualization";

export const TimelineVisualization: VisualizationRegistration = {
    id: "timeline",
    title: "Timeline",
    component: markRaw(defineAsyncComponent(
        () => import("@/components/Visualizations/TimelineVisualization.vue")
    )),
    exportName: "Timeline",
    getExportRoot: (root: HTMLElement) => root.querySelector("#timeline-vis")
};
