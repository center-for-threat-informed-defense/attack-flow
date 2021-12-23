///////////////////////////////////////////////////////////////////////////////
//  1. Stores  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type ModuleStore = {
    SessionStore: SessionStore,
    SchemaStore: SchemaStore,
    NotificationsStore: NotificationsStore
}

export type SessionStore = {
    session: AppSession,
    nodeIdCounter: number,
    layoutTrigger: number
}

export type AppSession = {
    canvas: CanvasMetadata,
    nodes: Map<string, CanvasNode>,
    edges: Map<string, CanvasEdge>,
    schema: any
}

export type CanvasMetadata = {
    cameraX   : number,
    cameraY   : number,
    padding   : number,
    pageSizeX : number,
    pageSizeY : number
}

export type SchemaStore = {
    listSchemas: Map<string, Array<any>>;
    nodeSchemas: Map<string, NodeSchema>;
    edgeSchemas: Map<string, EdgeSchema>;
    edgeRules: Map<string, Map<string, string>>,
}

export type NotificationsStore = {
    id: number
    notifications: Map<number, Notification>
}


///////////////////////////////////////////////////////////////////////////////
//  2. Schema Types  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type NodeSchema = {
    type       : string;
    color      : string; 
    outline    : string;
    subtype    : NodeField | null;
    fields     : Map<string, NodeField>;
}

export type EdgeSchema = {
    type       : string;
    color      : string;
    outline    : string;
    hasArrow   : boolean;
    hasDash    : boolean;
    fields     : Map<string, NodeField>;
}

export type EdgeRule = {
    source : string,
    target : string,
    type: string
}

type FieldTypes = "number" | "string" | "boolean" | "datetime" | "dropdown" | "object"

export interface NodeFieldBase<T extends FieldTypes> {
    type    : T;
    default : any;
}

export interface StringField extends NodeFieldBase<"string"> {
    required?: boolean
}

export interface DateTimeField extends NodeFieldBase<"datetime"> {
    required?: boolean
}

export interface NumberField extends NodeFieldBase<"number"> {
    range?: { min: 0, max: 0 }
}

export interface DropDownField extends NodeFieldBase<"dropdown"> {
    list    : string;
    textKey : string,
    default : Number;
    options : Array<any>;
}

export interface ObjectField extends NodeFieldBase<"object"> {
    object  : Object;
    default : null;
}

export type NodeField = NumberField | StringField | NodeFieldBase<"boolean"> | DateTimeField | DropDownField | ObjectField 


///////////////////////////////////////////////////////////////////////////////
//  3. Session Types  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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


///////////////////////////////////////////////////////////////////////////////
//  4. Notification Types  ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export type NotificationType = "info" | "error"

export type Notification = {
    type: NotificationType
    title: string,
    description: string,
    time?: number
}
