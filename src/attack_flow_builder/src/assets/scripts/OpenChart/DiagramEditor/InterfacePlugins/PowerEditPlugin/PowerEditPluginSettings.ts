import type { DiagramObjectViewFactory } from "@OpenChart/DiagramView";

export type PowerEditPluginSettings = {

    /**
     * The plugin's object factory.
     */
    factory: DiagramObjectViewFactory;

    /**
     * The plugin's line template.
     */
    lineTemplate: string;

    /**
     * The plugin's multiselect hotkey.
     */
    multiselectHotkey: string;

};
