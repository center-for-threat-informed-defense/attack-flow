import pkg from "~/package.json";
import Configuration from "@/assets/configuration/builder.config";
import { PageCommand } from "./Commands/PageCommand";
import { markRaw, ref, Ref } from "vue";
import {
    DiagramValidator,
    ValidationErrorResult,
    ValidationWarningResult
} from "@/assets/scripts/DiagramValidator";
import { 
    BlockDiagramSchema,
    CameraLocation,
    DiagramFactory,
    DiagramObjectExport,
    DiagramObjectModel,
    PageModel
} from "@/assets/scripts/BlockDiagram";

export class PageEditor {

    /**
     * The page's id.
     */
    public id: string;

    /**
     * The page.
     */
    public page: PageModel;

    /**
     * The editor's update trigger.
     */
    public trigger: Ref<number>;
    
    /**
     * The editor's front-end view parameters.
     */
    public view: EditorViewParameters;

    /**
     * The editor's pointer location.
     */
    public pointer: Ref<PointerLocation>;

    /**
     * The editor's camera location.
     */
    public location: Ref<CameraLocation>;

    /**
     * The editor's undo stack.
     */
    private _undoStack: PageCommand[];

    /**
     * The editor's redo stack.
     */
    private _redoStack: PageCommand[];

    /**
     * The editor's page validator.
     */
    private _validator: DiagramValidator | undefined;


    /**
     * Creates a new {@link PageEditor}.
     * @param page
     *  The page to manage.
     */
    private constructor(page: PageModel);

    /**
     * Creates a new {@link PageEditor}.
     * @param page
     *  The page to manage.
     * @param location
     *  The editor's camera location.
     */
    private constructor(page: PageModel, location: CameraLocation);
    private constructor(page: PageModel, location?: CameraLocation) {
        this.id = page.id;
        this.page = page;
        this.trigger = ref(0);
        this.view = { x: 0, y:0, k: 1, w: 0, h: 0 };
        this.pointer = ref({ x: 0, y: 0 });
        this.location = ref(location ?? { x: 0, y: 0, k: 1 });
        this._undoStack = [];
        this._redoStack = [];
        if(Configuration.validator) {
            this._validator = new Configuration.validator();
            this._validator.run(page);
        }
    }
    

    /**
     * Returns a dummy {@link PageEditor}.
     * @returns
     *  A dummy {@link PageEditor}.
     */
    public static createDummy(): PageEditor {
        return markRaw(new this(PageModel.createDummy()));
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Command Execution  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Executes a page command.
     * @param command
     *  The command.
     * @returns
     *  True if the command was recorded, false otherwise.
     */
    public execute(command: PageCommand): boolean {
        if(command.page !== this.page.id) {
            throw new Error(
                "Command is not configured to operate on this page."
            );
        }
        let record = command.execute();
        if(record) {
            this._redoStack = [];
            this._undoStack.push(command);
        }
        this._validator?.run(this.page);
        this.trigger.value++;
        return record;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Page History  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Undoes the last page command.
     */
    public undo() {
        if(this._undoStack.length) {
            this._undoStack.at(-1)!.undo();
            this._redoStack.push(this._undoStack.pop()!);
        }
    }

    /**
     * Tests if the last command can be undone.
     * @returns
     *  True if the last command can be undone, false otherwise.
     */
    public canUndo(): boolean {
        return 0 < this._undoStack.length;
    }

    /**
     * Redoes the last undone page command.
     */
    public redo() {
        if(this._redoStack.length) {
            this._redoStack.at(-1)!.execute();
            this._undoStack.push(this._redoStack.pop()!);
        }
    }

    /**
     * Tests if the last undone command can be redone.
     * @returns
     *  True if the last undone command can be redone, false otherwise.
     */
    public canRedo(): boolean {
        return 0 < this._redoStack.length;
    }   


    ///////////////////////////////////////////////////////////////////////////
    //  3. Page Validation  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Tests if the page represents a valid diagram per the configured
     * validator. If the application is not configured with a validator, `true`
     * is returned by default.
     * @returns
     *  True if the page is valid, false otherwise.
     */
    public isValid() {
        return this._validator?.inValidState() ?? true;
    }

    /**
     * Returns the page's validation errors per the configured validator.
     * @returns
     *  The page's validation errors.
     */
    public getValidationErrors(): ValidationErrorResult[] {
        return this._validator?.getErrors() ?? [];
    }

    /**
     * Returns the page's validation warnings per the configured validator.
     * @returns
     *  The page's validation errors.
     */
    public getValidationWarnings(): ValidationWarningResult[] {
        return this._validator?.getWarnings() ?? [];
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Page Import & Export  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a new page.
     * @param schema
     *  The page's internal schema.
     * @returns
     *  The page's editor.
     */
    public static async createNew(schema: BlockDiagramSchema): Promise<PageEditor> {
        let factory = await DiagramFactory.create(schema);
        let page = factory.createObject(schema.page_template) as PageModel;
        return markRaw(new PageEditor(page));
    }

    /**
     * Deserializes a page export.
     * @param file
     *  The page export.
     * @returns
     *  The page's editor.
     */
    public static async fromFile(file: string): Promise<PageEditor> {
        
        // Parse document
        let page = JSON.parse(file) as PageExport;

        // Initialize diagram factory
        let factory = await DiagramFactory.create(Configuration.schema);
        
        // Compile export index
        let index = new Map<string, DiagramObjectExport>();
        for(let obj of page.objects) {
            index.set(obj.id, obj);
        }

        // Initialize page model
        let pageExp = index.get(page.id)!
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

        // Recalculate layout
        pageObj.recalculateLayout();

        // Return editor
        return markRaw(new PageEditor(pageObj, page.location));

    }

    /**
     * Exports the page as a text file.
     * @returns
     *  The serialized page.
     */
    public toFile(): string {
        // Calculate camera location
        let v = this.view;
        let location = {
            x: ((v.w / 2) - v.x) / v.k,
            y: ((v.h / 2) - v.y) / v.k,
            k: v.k
        }
        // Compile export
        let doc: PageExport = {
            version: pkg.version,
            id: this.page.id,
            objects: [...this.page.getSubtree()].map(o => o.toExport()),
            location: location
        }
        return JSON.stringify(doc);
    }

    /**
     * TODO:
     * In the future, a document will bundle multiple pages together. One or
     * more pages can be exported into a document bundle and multiple document
     * bundles can be imported at once. Documents "unwrap" and dump their pages
     * into the application. Documents contain no information other than the
     * pages.  
     */

}


///////////////////////////////////////////////////////////////////////////////
//  Editor View Parameters  ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export type EditorViewParameters = {

    /**
     * The editor view's left x-coordinate.
     */
    x: number

    /**
     * The editor view's top y-coordinate.
     */
    y: number

    /**
     * The editor view's scale.
     */
    k: number

    /**
     * The editor view's width.
     */
    w: number

    /**
     * The editor view's height.
     */
    h: number

}


///////////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


type PointerLocation = {

    /**
     * The pointer's x coordinate.
     */
    x: number,

    /**
     * The pointer's y coordinate.
     */
    y: number

}

type PageExport = {

    /**
     * The application's version number.
     */
    version: string
    
    /**
     * The page's id.
     */
    id: string

    /**
     * The page's internal schema.
     * @deprecated
     *  Since version 2.1.0. Schemas now rest solely with the application and
     *  are no longer exported with each file.
     */
    schema?: BlockDiagramSchema

    /**
     * The page's diagram objects.
     */
    objects: DiagramObjectExport[]

    /**
     * The page's camera location.
     */
    location: CameraLocation

}
