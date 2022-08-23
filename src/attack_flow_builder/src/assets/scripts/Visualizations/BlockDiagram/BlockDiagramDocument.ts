import pkg from "~/package.json";
import { PageModel } from "./ModelTypes/PageModel";
import { DiagramFactory } from "./DiagramFactory/DiagramFactory";
import { BlockDiagramSchema } from "./DiagramFactory/DiagramSchemaTypes";
import { DiagramObjectModel } from "./ModelTypes/BaseTypes/DiagramObjectModel";
import { BlockDiagramDocumentExport } from "./DiagramFactory/DiagramExportTypes";

export class BlockDiagramDocument {

    /**
     * The document's name.
     */
    public name: string;

    /**
     * The document's diagram factory.
     */
    public factory: DiagramFactory;

    /**
     * The document's block diagram.
     */
    public page: PageModel;

    /**
     * The API's version number.
     */
    public apiVersion: string;


    /**
     * Creates a new {@link BlockDiagramDocument}.
     * @param name
     *  The document's name.
     * @param factory
     *  The document's diagram factory. 
     * @param page
     *  The document's block diagram.
     * @param apiVersion
     *  The API's version number.
     */
    private constructor(name: string, factory: DiagramFactory, page: PageModel, apiVersion: string) {
        this.name = name;
        this.factory = factory;
        this.page = page;
        this.apiVersion = apiVersion;
    }


    /**
     * Creates a new {@link BlockDiagramDocument}.
     * @param name
     *  The document's name.
     * @param schema
     *  The document's internal schema.
     * @returns
     *  A {@link BlockDiagramDocument}.
     */
    public static create(name: string, schema: BlockDiagramSchema) {
        let apiVersion = pkg.version;
        let factory = new DiagramFactory(schema);
        let page = factory.createObject(schema.page_template) as PageModel;
        return new this(name, factory, page, apiVersion);
    }
   
    /**
     * Creates a new {@link BlockDiagramDocument} from a serialized block 
     * diagram document.
     * @param document
     *  The serialized block diagram document.
     * @returns
     *  A {@link BlockDiagramDocument}.
     */
    public static deserialize(document: BlockDiagramDocumentExport): BlockDiagramDocument {
        let factory = new DiagramFactory(document.schema);
        // Deserialize objects
        let objs = new Map<string, DiagramObjectModel>();
        for(let obj of document.objects) {
            objs.set(obj.id, factory.createObject(obj));
        }
        // Link objects
        for(let obj of document.objects) {
            let o = objs.get(obj.id)!;
            for(let id of obj.children) {
                // TODO: Need to set parent
                o.children.push(objs.get(id)!);
            }
        }
        let page = objs.get(document.page)! as PageModel;
        // Update layout
        page.updateLayout();
        // Return document
        return new this(document.name, factory, page, document.api_version);
    }

    /**
     * Serializes the {@link BlockDiagramDocument}.
     * @returns
     *  The serialized {@link BlockDiagramDocument}.
     */
    public serialize(): BlockDiagramDocumentExport {
        return {
            api_version: this.apiVersion,
            name: this.name,
            schema: this.factory.getSchema(),
            page: this.page.id,
            objects: [...this.page.getSubtree()].map(o => o.serialize())
        }
    }

    /**
     * Returns a dummy {@link BlockDiagramDocument}.
     * @returns 
     *  A dummy {@link BlockDiagramDocument}.
     */
    public static createDummy(): BlockDiagramDocument {
        return new this(
            "", 
            DiagramFactory.createDummy(),
            PageModel.createDummy(),
            "0.0.0"
        );
    }

}
