namespace Types { 
    
    export interface INodeSchema {
        color      : string; 
        outline    : string;
        subtype    : INodeField;
        fields     : Map<string, INodeField>;
        fieldsText : string;
    }

    export interface IEdgeSchema {
        color      : string,
        fields     : Map<string, INodeField>;
    }
    
    export interface INodeField {
        type    : string;
        default : any;
    }
    
    export interface IDropDownField extends INodeField {
        type    : "Dropdown";
        list    : string;
        textKey : string,
        default : Number;
        options : Array<any>;
    }
    
    export interface IObjectField extends INodeField {
        type    : "Object";
        object  : Object;
        default : null;
    }

}