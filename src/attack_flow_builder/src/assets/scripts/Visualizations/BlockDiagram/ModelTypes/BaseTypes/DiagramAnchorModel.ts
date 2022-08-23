
import { AnchorTemplate } from "../../DiagramFactory/DiagramSchemaTypes";
import { DiagramFactory } from "../../DiagramFactory/DiagramFactory";
import { DiagramObjectModel } from "./DiagramObjectModel";
import { DiagramAnchorExport } from "../../DiagramFactory/DiagramExportTypes";

export abstract class DiagramAnchorModel extends DiagramObjectModel {

    /**
     * The anchor's radius.
     */
    public radius: number;

    /**
     * The anchor's position.
     */
    public position: number;  // TODO: switch to enum


    /**
     * Creates a new {@link DiagramAnchorModel}.
     * @param factory
     *  The object's diagram factory.
     * @param template
     *  The object's template.
     * @param attrs
     *  The object's attributes.
     * @param parent
     *  The object's parent.
     * @param values
     *  A serialized {@link DiagramAnchorModel}. 
     */
    constructor(
        factory: DiagramFactory, 
        template: AnchorTemplate, 
        attrs: number, 
        parent?: DiagramObjectModel,
        values?: DiagramAnchorExport
    ) {
        super(factory, template, attrs, parent, values);
        this.radius = template.radius;
        this.position = values?.position ?? 0;
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the topmost object at the given coordinate.
     * @param x
     *  The x coordinate.
     * @param y
     *  The y coordinate.
     * @returns
     *  The topmost object at the given coordinate, null if there isn't one.
     */
    public override getObjectAt(x: number, y: number): DiagramObjectModel | null {
        if(
            this.boundingBox.xMin <= x && x <= this.boundingBox.xMax &&
            this.boundingBox.yMin <= y && y <= this.boundingBox.yMax
        ) {
            return this;
        } else {
            return null;
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Moves the object relative to its current position. 
     * @param x
     *  The change in x.
     * @param y 
     *  The change in y.
     */
    public override moveBy(x: number, y: number) {
        // Move self
        this.boundingBox.xMin += x;
        this.boundingBox.xMid += x;
        this.boundingBox.xMax += x;
        this.boundingBox.yMin += y;
        this.boundingBox.yMid += y;
        this.boundingBox.yMax += y;
        // Move anchored children
        for(let obj of this.children) {
            if(!obj.isAnchored()) {
                console.warn(`Model object '${ 
                    obj.id 
                }' joined to anchor '${ 
                    this.id
                }' without 'Movement.Anchored' attribute.`);
                continue;
            }
            let deltaX = this.boundingBox.xMid - obj.boundingBox.xMid;
            let deltaY = this.boundingBox.yMid - obj.boundingBox.yMid;
            obj.moveBy(deltaX, deltaY);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Updates the object's layout and bounding box.
     */
    public override updateLayout() {
        let bb = this.boundingBox;
        // Update bounding box
        bb.xMin = bb.xMid - this.radius;
        bb.yMin = bb.yMid - this.radius;
        bb.xMax = bb.xMid + this.radius;
        bb.yMax = bb.yMid + this.radius;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  4. Serialization  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Serializes the {@link DiagramAnchorModel} for export.
     * @returns
     *  The serialized {@link DiagramAnchorModel} object.
     */
    public override serialize(): DiagramAnchorExport {
        return {
            ...super.serialize(),
            position: this.position
        }
    }

}
