namespace Types {
    
    export interface IBox {
        x0: number,
        y0: number,
        x1: number,
        y1: number,
    }

    export interface ICanvasNode extends IBox {
        id: number;
        type: string;
        subtype: any;
        payload: any;
    }

    export interface ICanvasEdge {
        id: string,
        sourceId: number,
        targetId: number,
        source: IBox,
        target: IBox,
        type: ICanvasEdgeDescriptor | null
    }

    export interface ICanvasEdgeDescriptor {
        type: string,
        payload: any
    }

}