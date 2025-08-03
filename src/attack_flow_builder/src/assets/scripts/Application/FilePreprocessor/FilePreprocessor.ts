import type { LegacyV2PageExport } from "@/assets/configuration/AttackFlowFilePreprocessor/FileDefinitions/LegacyV2";
import type { DiagramViewExport } from "../../OpenChart/DiagramView";

export interface FilePreprocessor {

    /**
     * Preprocess a save file.
     * @remarks
     *  This function can be used to migrate or modify files before they're
     *  loaded into the application.
     * @returns
     *  The processed {@link DiagramViewExport}.
     */
    process(file: LegacyV2PageExport | DiagramViewExport): DiagramViewExport;

}
