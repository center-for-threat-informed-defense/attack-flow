import { Cursor } from "../Attributes";
import { RasterCache } from "../DiagramElement/RasterCache";
import { DiagramFactory } from "../DiagramFactory";
import { LineRightAngleHorizontalView } from "../DiagramViewTypes/LineRightAngleHorizontalView";
import { getLineHitbox, isInsideRegion } from "../Utilities";
import {
    DiagramLineModel,
    DiagramObjectModel,
    LayoutUpdateReason,
    LineEndingPointModel
} from ".";
import type {
    DiagramObjectValues,
    LineRightAngleHorizontalTemplate
} from "../DiagramFactory";

export class LineRightAngleHorizontalModel extends DiagramLineModel {

    /**
     * The template the object was configured with.
     */
    public override readonly template: LineRightAngleHorizontalTemplate;

    /**
     * The line's hitboxes.
     *  [0] = The horizontal segment's hitbox.
     *  [1] = The vertical segment's hitbox.
     */
    public readonly hitboxes: number[][];

    /**
     * Creates a new {@link LineRightAngleHorizontalModel}.
     * @param factory
     *  The line's diagram factory.
     * @param template
     *  The line's template.
     * @param values
     *  The line's values.
     */
    constructor(
        factory: DiagramFactory,
        template: LineRightAngleHorizontalTemplate,
        values?: DiagramObjectValues
    ) {
        super(factory, template, values);
        this.hitboxes = [[], []];
        this.setCursor(Cursor.Move);
        // Template configuration
        this.setSemanticRole(template.role);
        this.template = template;
        // Define children
        if (!this.children.length) {
            const x = this.boundingBox.xMid;
            const y = this.boundingBox.yMid;
            // Define Caps and Handles
            const src = template.line_ending_template.source;
            const trg = template.line_ending_template.target;
            this.addChild(factory.createObject(src) as LineEndingPointModel, 0, false);
            this.addChild(factory.createObject(trg) as LineEndingPointModel, 1, false);
            // Define position
            for (const obj of this.children) {
                obj.moveTo(x, y);
            }
            this.children[0].moveBy(-100, 0);
            this.children[1].moveBy(0, 100);
        }
        // Update layout
        this.updateLayout(LayoutUpdateReason.Initialization);
    }

    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    public override getObjectAt(x: number, y: number): DiagramObjectModel | undefined {
        if (this.isAnchored()) {
            const obj = super.getObjectAt(x, y);
            if (obj) {
                return obj;
            }
            for (let i = 0; i < this.hitboxes.length; i++) {
                if (!isInsideRegion(x, y, this.hitboxes[i])) {
                    continue;
                }
                if (i === 1) {
                    return this.children[i];
                } else {
                    return this;
                }
            }
        } else {
            if (this.isSelected()) {
                const obj = super.getObjectAt(x, y);
                if (obj) {
                    return obj;
                }
            }
            for (const hitbox of this.hitboxes) {
                if (isInsideRegion(x, y, hitbox)) {
                    return this;
                }
            }
        }
        return undefined;
    }

    ///////////////////////////////////////////////////////////////////////////
    //  2. Movement  //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    public moveChild(id: string, dx: number, dy: number, updateParent: boolean = true) {
        const obj = this.children.find(o => o.id === id)!;
        if (!obj) {
            return;
        }
        if (obj instanceof LineEndingPointModel) {
            obj.moveBy(dx, dy, updateParent, true);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //  3. Layout & View  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    public override updateLayout(reasons: number, updateParent: boolean = true) {
        const [e1, e2] = this.children.map(o => o.boundingBox);
        const w = this.hitboxWidth;
        this.hitboxes[0] = getLineHitbox(e1.xMid, e1.yMid, e2.xMid, e1.yMid, w);
        this.hitboxes[1] = getLineHitbox(e2.xMid, e1.yMid, e2.xMid, e2.yMid, w);
        super.updateLayout(reasons, updateParent);
    }

    public createView(cache: RasterCache): LineRightAngleHorizontalView {
        return new LineRightAngleHorizontalView(this, cache);
    }
}
