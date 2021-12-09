namespace Types {
    
    export type IBox = {
        x0: number,
        y0: number,
        x1: number,
        y1: number,
    }

    export type CanvasNode = IBox & {
        id: string;
        type: string;
        subtype: any;
        payload: any;
    }

    export type CanvasEdge = {
        id: string,
        sourceId: string,
        targetId: string,
        source: IBox,
        target: IBox,
        type: string | null;
        payload: any;
    }

}