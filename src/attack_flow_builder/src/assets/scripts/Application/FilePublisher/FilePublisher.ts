import type { DiagramModelFile } from "@OpenChart/DiagramModel";

export interface FilePublisher {

    /**
     * Returns the published file in text form.
     * @param file
     *  The file to publish.
     * @returns
     *  The published file in text form.
     */
    publish(file: DiagramModelFile): string;

    /**
     * Returns the publisher's file extension.
     * @returns
     *  The publisher's file extension.
     */
    getFileExtension(): string;

}
