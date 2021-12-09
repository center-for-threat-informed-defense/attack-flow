namespace Types { 
    
    export type NodeSchema = {
        color      : string; 
        outline    : string;
        subtype    : NodeField | null;
        fields     : Map<string, NodeField>;
        fieldsText : string;
    }

    export type EdgeSchema = {
        color      : string;
        fields     : Map<string, NodeField>;
        fieldsText : string;
    }
    
    type FieldTypes = "number" | "string" | "boolean" | "dropdown" | "object"

    export interface NodeFieldBase<T extends FieldTypes> {
        type    : T;
        default : any;
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

    export type NodeField = ObjectField | DropDownField | NodeFieldBase<FieldTypes> 

}