import { DiagramObjectType } from "../DiagramObjectFactory";
import {
    Anchor, Block, Canvas, DiagramObject,
    Group, Handle, Latch, Line
} from "../DiagramObject";
import type { JsonEntries } from "../DiagramObject";
import type { TypeToExport } from "./TypeToExport";
import type {
    AnchorExport, BlockExport, DiagramObjectExport,
    GenericObjectExport, GroupExport, LineExport
} from "./DiagramObjectExport";
import type {
    AnchorTemplate, BlockTemplate, CanvasTemplate, Constructor, DiagramObjectFactory,
    DiagramObjectTemplate, GroupTemplate, LineTemplate
} from "../DiagramObjectFactory";

export class DiagramObjectSerializer {

    /**
     * Exports a set of diagram objects.
     * @param diagram
     *  The diagram objects.
     * @returns
     *  The diagram exports.
     */
    public static exportObjects(
        diagram: DiagramObject[]
    ): DiagramObjectExport[] {
        const exportMap = new Map<string, DiagramObjectExport>();
        for (const object of diagram) {
            this.yieldExportFromDiagramObject(object, exportMap);
        }
        return [...exportMap.values()];
    }

    /**
     * Imports a set of diagram objects.
     * @param factory
     *  The object factory to use.
     * @param diagram
     *  The diagram exports.
     * @returns
     *  The root diagram objects.
     */
    public static importObjects(
        factory: DiagramObjectFactory,
        diagram: DiagramObjectExport[]
    ): DiagramObject[] {
        const importMap = new Map<string, DiagramObject>();
        const exportMap = new Map(diagram.map(o => [o.instance, o]));
        for (const object of diagram) {
            this.yieldImportFromDiagramObject(
                object.instance, "export", factory, exportMap, importMap
            );
        }
        return [...importMap.values()].filter(o => o.parent === null);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Export Functions  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports a {@link DiagramObject} to the specified export map.
     * @param obj
     *  The object to export.
     * @param exportMap
     *  The current export map.
     */
    private static yieldExportFromDiagramObject(
        obj: DiagramObject,
        exportMap: Map<string, DiagramObjectExport> = new Map()
    ) {
        // If traversed, bail
        if (exportMap.has(obj.instance)) {
            return;
        }
        // Yield object
        if (obj instanceof Anchor) {
            this.yieldExportFromAnchor(obj, exportMap);
        } else if (obj instanceof Block) {
            this.yieldExportFromBlock(obj, exportMap);
        } else if (obj instanceof Canvas) {
            this.yieldExportFromGroup(obj, exportMap);
        } else if (obj instanceof Group) {
            this.yieldExportFromGroup(obj, exportMap);
        } else if (obj instanceof Line) {
            this.yieldExportFromLine(obj, exportMap);
        } else {
            this.yieldExportFromGenericObject(obj, exportMap);
        }
    }

    /**
     * Exports an {@link Anchor} to the specified export map.
     * @param anchor
     *  The anchor to export.
     * @param exportMap
     *  The current export map.
     */
    private static yieldExportFromAnchor(
        anchor: Anchor,
        exportMap: Map<string, DiagramObjectExport>
    ) {
        // Yield object
        exportMap.set(anchor.instance, {
            ...this.toGenericObjectExport(anchor),
            latches: anchor.latches.map(l => l.instance)
        });
    }

    /**
     * Exports a {@link Block} to the specified export map.
     * @param block
     *  The block to export.
     * @param exportMap
     *  The current export map.
     */
    private static yieldExportFromBlock(
        block: Block,
        exportMap: Map<string, DiagramObjectExport>
    ) {
        const anchors = [...block.anchors.entries()];
        // Yield object
        exportMap.set(block.instance, {
            ...this.toGenericObjectExport(block),
            anchors: Object.fromEntries(anchors.map(([p, o]) => [p, o.instance]))
        });
        // Yield children
        for (const object of anchors) {
            this.yieldExportFromDiagramObject(object[1], exportMap);
        }
    }

    /**
     * Exports a {@link Group} to the specified export map.
     * @param group
     *  The group to export.
     * @param exportMap
     *  The current export map.
     */
    private static yieldExportFromGroup(
        group: Group,
        exportMap: Map<string, DiagramObjectExport>
    ) {
        // Yield object
        exportMap.set(group.instance, {
            ...this.toGenericObjectExport(group),
            objects: [...group.objects].map(o => o.instance)
        });
        // Yield children
        for (const object of group.objects) {
            this.yieldExportFromDiagramObject(object, exportMap);
        }
    }

    /**
     * Exports a {@link Line} to the specified export map.
     * @param line
     *  The line to export.
     * @param exportMap
     *  The current export map.
     */
    private static yieldExportFromLine(
        line: Line,
        exportMap: Map<string, DiagramObjectExport>
    ) {
        // Yield object
        exportMap.set(line.instance, {
            ...this.toGenericObjectExport(line),
            source: line.rawSourceLatch?.instance ?? undefined,
            target: line.rawTargetLatch?.instance ?? undefined,
            handles: line.handles.map(o => o.instance)
        });
        // Yield children
        if (line.rawSourceLatch) {
            this.yieldExportFromDiagramObject(line.source, exportMap);
        }
        if (line.rawTargetLatch) {
            this.yieldExportFromDiagramObject(line.target, exportMap);
        }
        for (const object of line.handles) {
            this.yieldExportFromDiagramObject(object, exportMap);
        }
    }

    /**
     * Exports a {@link DiagramObject} to the specified export map.
     * @param object
     *  The object to export.
     * @param exportMap
     *  The current export map.
     */
    private static yieldExportFromGenericObject(
        object: DiagramObject,
        exportMap: Map<string, DiagramObjectExport>
    ) {
        exportMap.set(object.instance, this.toGenericObjectExport(object));
    }

    /**
     * Converts a {@link DiagramObject} to a {@link GenericObjectExport}.
     * @param obj
     *  The diagram object.
     * @returns
     *  The diagram export.
     */
    private static toGenericObjectExport(obj: DiagramObject): GenericObjectExport {
        let properties: undefined | JsonEntries = obj.properties.toJson();
        if (!properties?.length) {
            properties = undefined;
        }
        return { id: obj.id, instance: obj.instance, properties };
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Import Functions  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Imports a {@link DiagramObjectExport} into the specified import map.
     * @param id
     *  The object's id.
     * @param from
     *  Whether `id` refers to an `export` id or a `template` id.
     * @param factory
     *  The diagram's object factory.
     * @param exportMap
     *  The diagram's export map.
     * @param importMap
     *  The current import map.
     * @param type
     *  The expected {@link DiagramObject} sub-type.
     *  (Default: `DiagramObject`)
     */
    private static yieldImportFromDiagramObject<T extends DiagramObject>(
        id: string,
        from: "export" | "template",
        factory: DiagramObjectFactory,
        exportMap: Map<string, DiagramObjectExport>,
        importMap: Map<string, DiagramObject>,
        type?: Constructor<T>
    ): T {
        // Resolve configuration
        let templateId, objImport, objExport;
        if (from === "template") {
            objExport = undefined;
            objImport = undefined;
            templateId = id;
        } else if (exportMap.has(id)) {
            objExport = exportMap.get(id)!;
            objImport = importMap.get(id);
            templateId = objExport.id;
        } else {
            throw new Error(`Object '${id}' missing from export.`);
        }
        // Yield object
        const template = factory.resolveTemplate(templateId);
        switch (template.type) {
            case DiagramObjectType.Anchor:
                this.assertExportType(objExport, template.type);
                objImport ??= this.yieldImportFromAnchor(
                    template, factory, exportMap, importMap, objExport
                );
                break;
            case DiagramObjectType.Block:
                this.assertExportType(objExport, template.type);
                objImport ??= this.yieldImportFromBlock(
                    template, factory, exportMap, importMap, objExport
                );
                break;
            case DiagramObjectType.Group:
            case DiagramObjectType.Canvas:
                this.assertExportType(objExport, template.type);
                objImport ??= this.yieldImportFromGroup(
                    template, factory, exportMap, importMap, objExport
                );
                break;
            case DiagramObjectType.Line:
                this.assertExportType(objExport, template.type);
                objImport ??= this.yieldImportFromLine(
                    template, factory, exportMap, importMap, objExport
                );
                break;
            default:
                objImport ??= this.yieldImportFromGenericObject(
                    template, factory, importMap, objExport
                );
                break;
        }
        // Assert type
        if (!type || objImport instanceof type) {
            return objImport as T;
        } else {
            throw new Error(`Expected '${templateId}' to be a ${type.name}.`);
        }
    }

    /**
     * Yields an {@link Anchor} to the specified import map.
     * @param template
     *  The anchor's template.
     * @param factory
     *  The diagram's object factory.
     * @param exportMap
     *  The diagram's export map.
     * @param importMap
     *  The current import map.
     * @param obj
     *  If specified, the {@link Anchor} will be derived from the export.
     *  `template` must match the export's template.
     */
    private static yieldImportFromAnchor(
        template: AnchorTemplate,
        factory: DiagramObjectFactory,
        exportMap: Map<string, DiagramObjectExport>,
        importMap: Map<string, DiagramObject>,
        obj?: AnchorExport
    ): Anchor {
        // Create anchor
        let anchor: Anchor;
        if (obj) {
            anchor = factory.createBaseDiagramObject(
                obj.id, obj.instance, obj.properties, Anchor
            );
        } else {
            anchor = factory.createBaseDiagramObject(
                template, undefined, undefined, Anchor
            );
        }
        // Yield anchor
        importMap.set(anchor.instance, anchor);
        // Yield latches
        for (const id of obj?.latches ?? []) {
            const latch = this.yieldImportFromDiagramObject(
                id, "export", factory, exportMap, importMap, Latch
            );
            anchor.link(latch);
        }
        return anchor;
    }

    /**
     * Yields a {@link Block} to the specified import map.
     * @param template
     *  The block's template.
     * @param factory
     *  The diagram's object factory.
     * @param exportMap
     *  The diagram's export map.
     * @param importMap
     *  The current import map.
     * @param obj
     *  If specified, the {@link Block} will be derived from the export.
     *  `template` must match the export's template.
     */
    private static yieldImportFromBlock(
        template: BlockTemplate,
        factory: DiagramObjectFactory,
        exportMap: Map<string, DiagramObjectExport>,
        importMap: Map<string, DiagramObject>,
        obj?: BlockExport
    ): Block {
        // Create block
        let block: Block;
        let anchors: { [key: string]: string };
        if (obj) {
            block = factory.createBaseDiagramObject(
                obj.id, obj.instance, obj.properties, Block
            );
            anchors = obj.anchors;
        } else {
            block = factory.createBaseDiagramObject(
                template, undefined, undefined, Block
            );
            anchors = {};
        }
        // Yield block
        importMap.set(block.instance, block);
        // Yield anchors
        for (const position in template.anchors) {
            const method = this.pickImportMethod(
                anchors[position], template.anchors[position]
            );
            const anchor = this.yieldImportFromDiagramObject(
                ...method, factory, exportMap, importMap, Anchor
            );
            block.addAnchor(position, anchor);
        }
        return block;
    }

    /**
     * Yields a {@link Group} to the specified import map.
     * @param template
     *  The group's template.
     * @param factory
     *  The diagram's object factory.
     * @param exportMap
     *  The diagram's export map.
     * @param importMap
     *  The current import map.
     * @param obj
     *  If specified, the {@link Group} will be derived from the export.
     *  `template` must match the export's template.
     */
    private static yieldImportFromGroup(
        template: GroupTemplate | CanvasTemplate,
        factory: DiagramObjectFactory,
        exportMap: Map<string, DiagramObjectExport>,
        importMap: Map<string, DiagramObject>,
        obj?: GroupExport
    ): Group {
        // Create group
        let group: Group;
        if (obj) {
            group = factory.createBaseDiagramObject(
                obj.id, obj.instance, obj.properties, Group
            );
        } else {
            group = factory.createBaseDiagramObject(
                template, undefined, undefined, Group
            );
        }
        // Yield block
        importMap.set(group.instance, group);
        // Yield children
        for (const id of obj?.objects ?? []) {
            const child = this.yieldImportFromDiagramObject(
                id, "export", factory, exportMap, importMap
            );
            group.addObject(child);
        }
        return group;
    }

    /**
     * Yields a {@link Line} to the specified import map.
     * @param template
     *  The line's template.
     * @param factory
     *  The diagram's object factory.
     * @param exportMap
     *  The diagram's export map.
     * @param importMap
     *  The current import map.
     * @param obj
     *  If specified, the {@link Line} will be derived from the export.
     *  `template` must match the export's template.
     */
    private static yieldImportFromLine(
        template: LineTemplate,
        factory: DiagramObjectFactory,
        exportMap: Map<string, DiagramObjectExport>,
        importMap: Map<string, DiagramObject>,
        obj?: LineExport
    ): Line {
        const latch = template.latch_template;
        // Create anchor
        let line: Line;
        if (obj) {
            line = factory.createBaseDiagramObject(
                obj.id, obj.instance, obj.properties, Line
            );
        } else {
            line = factory.createBaseDiagramObject(
                template, undefined, undefined, Line
            );
        }
        // Yield line
        importMap.set(line.instance, line);
        // Yield source
        const srcMethod = this.pickImportMethod(obj?.source, latch.source);
        line.source = this.yieldImportFromDiagramObject(
            ...srcMethod, factory, exportMap, importMap, Latch
        );
        // Yield target
        const trgMethod = this.pickImportMethod(obj?.target, latch.target);
        line.target = this.yieldImportFromDiagramObject(
            ...trgMethod, factory, exportMap, importMap, Latch
        );
        // Yield handles
        for (const id of obj?.handles ?? []) {
            const handle = this.yieldImportFromDiagramObject(
                id, "export", factory, exportMap, importMap, Handle
            );
            line.addHandle(handle);
        }
        return line;
    }

    /**
     * Yields a {@link DiagramObject} to the specified import map.
     * @param template
     *  The line's template.
     * @param factory
     *  The diagram's object factory.
     * @param importMap
     *  The current import map.
     * @param obj
     *  If specified, the {@link DiagramObject} will be derived from the
     *  export. `template` must match the export's template.
     */
    private static yieldImportFromGenericObject(
        template: DiagramObjectTemplate,
        factory: DiagramObjectFactory,
        importMap: Map<string, DiagramObject>,
        obj?: DiagramObjectExport
    ): DiagramObject {
        // Create object
        let object: DiagramObject;
        if (obj) {
            object = factory.createBaseDiagramObject(
                obj.id, obj.instance, obj.properties
            );
        } else {
            object = factory.createBaseDiagramObject(
                template
            );
        }
        // Yield object
        importMap.set(object.instance, object);
        // Return object
        return object;
    }

    /**
     * Asserts that an export can be cast to the specified object type.
     * @remarks
     *  This function is not comprehensive. It performs a simple sanity check.
     *  It's not designed to handle corrupt exports.
     * @param obj
     *  The object export.
     * @param type
     *  The export's expected {@link DiagramObjectType}.
     */
    private static assertExportType<T extends keyof TypeToExport>(
        obj: DiagramObjectExport | undefined, type: T
    ): asserts obj is TypeToExport[T] | undefined {
        if (!obj) {
            return;
        }
        switch (type) {
            case DiagramObjectType.Anchor:
                if ("latches" in obj) {
                    return;
                }
                break;
            case DiagramObjectType.Block:
                if ("anchors" in obj) {
                    return;
                }
                break;
            case DiagramObjectType.Group:
            case DiagramObjectType.Canvas:
                if ("objects" in obj) {
                    return;
                }
                break;
            case DiagramObjectType.Line:
                if ("handles" in obj) {
                    return;
                }
                break;
            default:
                return;
        }
        throw new Error(`Cannot cast export to '${type}'.`);
    }

    /**
     * Picks an object's import method.
     * @param exportId
     *  An object's export id.
     * @param templateId
     *  An object's template id.
     * @returns
     *  The chosen id and import method.
     */
    private static pickImportMethod(
        exportId: string | undefined, templateId: string
    ): [string, "export" | "template"] {
        if (exportId) {
            return [exportId, "export"];
        } else {
            return [templateId, "template"];
        }
    }

}
