import { RasterCache } from "../RasterCache";
import { DiagramFactory } from "../DiagramFactory/DiagramFactory";
import { DiagramObjectModel } from "./BaseTypes/DiagramObjectModel";
import { DictionaryBlockView } from "../ViewTypes/DictionaryBlockView";
import { DictionaryBlockExport } from "../DiagramFactory/DiagramExportTypes";
import { DictionaryBlockTemplate } from "../DiagramFactory/DiagramSchemaTypes";

export class DictionaryBlockModel extends DiagramObjectModel {

    /**
     * The block's color.
     */
    public color: string;

    /**
     * The block's fields.
     */
    public fields: Map<string, any>;

    
    /**
     * Creates a new {@link DictionaryBlockModel}.
     * @param factory
     *  The object's diagram factory.
     * @param template
     *  The object's template.
     * @param parent
     *  The object's parent.
     * @param values
     *  A serialized {@link DictionaryBlockModel}.
     */
    constructor(
        factory: DiagramFactory, 
        template: DictionaryBlockTemplate, 
        parent?: DiagramObjectModel,
        values?: DictionaryBlockExport
    ) {
        super(factory, template, 0, parent, values);
        // Template configuration
        this.color = template.color;
        this.template = template.name;
        this.fields = new Map();
        for(let id in template.fields) {
            this.fields.set(id, template.fields[id].value);
        }
        // Value configuration
        for(let id in values?.fields) {
            this.fields.set(id, values?.fields[id])
        }
        // Anchor configuration
        let hasNoAnchors = !values || !values.children.length;
        if(hasNoAnchors) {
            // let anchor = this.factory.getTemplate(template.anchor_template) as AnchorPointTemplate;
            // if(anchor) {
            //     TODO: Init anchors
            //     this.subelements.push(this.factory.createObject(anchor))
            // }
        }
        // TODO: Move this to layout compute logic
        this.boundingBox.xMid = values?.x ?? 0;
        this.boundingBox.yMid = values?.y ?? 0;
    }
    

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
        let dx = x - this.boundingBox.xMid;
        let dy = y - this.boundingBox.yMid;
        let r = 10;
        return dx * dx + dy * dy < r * r ? this : null;
    }

    /**
     * Updates the object's layout and bounding box.
     */
    public override updateLayout() {
        let r = 10;
        let bb = this.boundingBox;
        // Update bounding box
        bb.xMin = bb.xMid - r;
        bb.yMin = bb.yMid - r;
        bb.xMax = bb.xMid + r;
        bb.yMax = bb.yMid + r;
    }

    /**
     * Returns this object wrapped inside a view object.
     *  @param cache
     *   The view's raster cache.
     *  @returns
     *   This object wrapped inside a view object.
     */
    public override createView(cache: RasterCache): DictionaryBlockView {
        return new DictionaryBlockView(this, cache);
    }

    /**
     * Serializes the {@link DictionaryBlockModel} for export.
     * @returns
     *  The serialized {@link DictionaryBlockModel} object.
     */
    public override serialize(): DictionaryBlockExport {
        return {
            ...super.serialize(),
            fields: Object.fromEntries(this.fields.entries())
        }
    }
    
    // /**
    //  * Returns a hash that uniquely identifies the object's content.
    //  * @returns
    //  *  A hash that uniquely identifies the object's content.
    //  */
    // public getContentHash(): string {
    //     throw new Error("Method not implemented.");
    // }

}
