namespace Types {

    export type DesignerStore = {
        session: AppSession,
        schema: IAttackFlowSchema,
        nodeIdCounter: number,
    }

    export interface IAttackFlowSchema {
        lists: Map<string, Array<any>>;
        nodes: Map<string, Types.NodeSchema>;
        edges: Map<string, Types.EdgeSchema>;
    }

    export type AppSession = {
        canvas: CanvasMetadata,
        nodes: Map<string, Types.CanvasNode>,
        edges: Map<string, Types.CanvasEdge>,
    }

    export type CanvasMetadata = {
        cameraX   : number,
        cameraY   : number,
        padding   : number,
        pageSizeX : number,
        pageSizeY : number
    }

}