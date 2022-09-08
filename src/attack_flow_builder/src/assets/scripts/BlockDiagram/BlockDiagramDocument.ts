import pkg from "~/package.json";
import { PageEditor } from "./PageEditor";
import {
    DiagramObjectModel,
    PageModel
} from "./DiagramModelTypes";
import {
    BlockDiagramDocumentExport,
    BlockDiagramSchema,
    DiagramFactory,
    DiagramObjectExport
} from "./DiagramFactory";

export class BlockDiagramDocument {

    /**
     * The document's name.
     */
    public name: string;

    /**
     * The document's diagram factory.
     */
    public readonly factory: DiagramFactory;

    /**
     * The document's page.
     */
    public readonly page: PageModel;

    /**
     * The document's page editor.
     */
    public readonly editor: PageEditor;

    /**
     * The API's version number.
     */
    public readonly apiVersion: string;


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
        this.editor = new PageEditor(page);
        this.apiVersion = apiVersion;
    }

    
    /**
     * Returns a dummy {@link BlockDiagramDocument}.
     * @returns 
     *  A dummy {@link BlockDiagramDocument}.
     */
    public static createDummy(): BlockDiagramDocument {
        return new this(
            "@__builtin__dummy_document", 
            DiagramFactory.createDummy(),
            PageModel.createDummy(),
            "0.0.0"
        );
    }

    /**
     * Creates a new {@link BlockDiagramDocument}.
     * @param name
     *  The document's name.
     * @param schema
     *  The document's internal schema.
     * @returns
     *  The {@link BlockDiagramDocument}.
     */
    public static async create(
        name: string,
        schema: BlockDiagramSchema
    ): Promise<BlockDiagramDocument> {
        let factory = await DiagramFactory.create(schema);
        let page = factory.createObject(schema.page_template) as PageModel;
        return new this(name, factory, page, pkg.version);
    }
   
    /**
     * Creates a new {@link BlockDiagramDocument} from a serialized block 
     * diagram document.
     * @param document
     *  The serialized block diagram document.
     * @returns
     *  The {@link BlockDiagramDocument}.
     */
    public static async deserialize(
        document: string
    ): Promise<BlockDiagramDocument>;

    /**
     * Creates a new {@link BlockDiagramDocument} from a 
     * {@link BlockDiagramDocumentExport}.
     * @param document
     *  The block diagram document export.
     * @returns
     *  The {@link BlockDiagramDocument}.
     */
    public static async deserialize(
        document: BlockDiagramDocumentExport
    ): Promise<BlockDiagramDocument>;
    public static async deserialize(
        document: BlockDiagramDocumentExport | string
    ): Promise<BlockDiagramDocument> {
        
        // Convert document to object
        if(document.constructor.name === String.name) {
            document = JSON.parse(document as string) as BlockDiagramDocumentExport;
        }
        document = document as BlockDiagramDocumentExport;

        // Initialize diagram factory
        let factory = await DiagramFactory.create(document.schema);
        
        // Compile export index
        let index = new Map<string, DiagramObjectExport>();
        for(let obj of document.objects) {
            index.set(obj.id, obj);
        }

        // Create page
        let pageExp = index.get(document.page)!
        let pageObj = (function deserialize(
            exp: DiagramObjectExport,
            expIndex: Map<string, DiagramObjectExport>,
            objIndex: Map<string, DiagramObjectModel>,
            factory: DiagramFactory
        ): DiagramObjectModel {
            
            // Create object
            if(!objIndex.has(exp.id)) {
                let children: DiagramObjectModel[] = []
                for(let id of exp.children) {
                    children.push(deserialize(
                        index.get(id)!,
                        expIndex,
                        objIndex,
                        factory
                    ));
                }
                let obj = factory.createObject({ ...exp, children });
                objIndex.set(obj.id, obj);
            }
            
            // Return object
            return objIndex.get(exp.id)!;

        })(pageExp, index, new Map(), factory) as PageModel;

        // Return document
        return new this(document.name, factory, pageObj, document.api_version);
    }

    /**
     * Exports the {@link BlockDiagramDocument}.
     * @returns
     *  The {@link BlockDiagramDocumentExport}.
     */
    public toExport(): BlockDiagramDocumentExport {
        return {
            api_version: this.apiVersion,
            name: this.name,
            schema: this.factory.getSchema(),
            page: this.page.id,
            objects: [...this.page.getSubtree()].map(o => o.toExport())
        }
    }

}
