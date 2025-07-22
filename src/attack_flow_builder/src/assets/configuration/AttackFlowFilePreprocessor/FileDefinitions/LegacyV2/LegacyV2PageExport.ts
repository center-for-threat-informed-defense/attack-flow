import type { LegacyV2CameraLocation } from "./LegacyV2CameraLocation";
import type { LegacyV2DiagramObjectExport } from "./LegacyV2DiagramObjectExport";

/**
 * Legacy Page Export Type
 */
export type LegacyV2PageExport = {

    /**
     * The application's version number.
     */
    version: string;

    /**
     * The page's id.
     */
    id: string;

    /**
     * The page's internal schema.
     * @deprecated
     *  Since version 2.1.0. Schemas now rest solely with the application and
     *  are no longer exported with each file.
     */
    schema?: any;

    /**
     * The page's diagram objects.
     */
    objects: LegacyV2DiagramObjectExport[];

    /**
     * The page's camera location.
     */
    location: LegacyV2CameraLocation;

};
