import { Cursor, DiagramInterfacePlugin, SubjectTrack } from "@OpenChart/DiagramInterface";
import type { DiagramViewEditor } from "@OpenChart/DiagramEditor";

/** Handles Atomic Red Team links rendered within action blocks. */
export class AtomicRedTeamLinkPlugin extends DiagramInterfacePlugin {

    private readonly editor: DiagramViewEditor;
    private readonly openLink: (url: string) => void;
    private activeUrl: string | undefined;

    constructor(editor: DiagramViewEditor, openLink: (url: string) => void) {
        super();
        this.editor = editor;
        this.openLink = openLink;
        this.activeUrl = undefined;
    }

    public canHandleHover(x: number, y: number): boolean {
        return Boolean(this.getHyperlinkAt(x, y));
    }

    protected handleHoverStart(): void {
        this.editor.interface.emit("cursor-change", Cursor.Pointer);
    }

    public canHandleSelection(x: number, y: number, event: MouseEvent): boolean {
        this.activeUrl = event.button === 0 ? this.getHyperlinkAt(x, y) : undefined;
        return Boolean(this.activeUrl);
    }

    protected handleSelectStart(): boolean {
        if (this.activeUrl) {
            this.openLink(this.activeUrl);
        }
        return true;
    }

    protected handleSelectDrag(_track: SubjectTrack): void {}

    protected handleSelectEnd(): void {
        this.activeUrl = undefined;
    }

    private getHyperlinkAt(x: number, y: number): string | undefined {
        const blocks = this.editor.file.canvas.blocks;
        for (let index = blocks.length - 1; index >= 0; index--) {
            const url = blocks[index].face.getHyperlinkAt(x, y);
            if (url) {
                return url;
            }
        }
        return undefined;
    }
}
