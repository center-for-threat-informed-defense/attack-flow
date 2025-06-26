import type { DiagramModelFile } from "@OpenChart/DiagramModel";

export class FilePublisher {

    /**
     * Returns the published file in text form.
     * @param file
     *  The file to publish.
     * @returns
     *  The published file in text form.
     */
    public publish(file: DiagramModelFile): string {
        return "";
    }

    /**
     * Returns the publisher's file extension.
     * @returns
     *  The publisher's file extension.
     */
    public getFileExtension() {
        return "txt";
    }

}
