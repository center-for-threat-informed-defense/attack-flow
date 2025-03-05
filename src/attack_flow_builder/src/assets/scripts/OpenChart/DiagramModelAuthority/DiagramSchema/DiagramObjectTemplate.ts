import type { RootPropertyDescriptor } from "./PropertyDescriptor";
import type { DiagramObjectType as TemplateType } from "./DiagramObjectType";


///////////////////////////////////////////////////////////////////////////////
//  1. Base Object Template  //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * The base object template upon which all others are based.
 */
export type BaseDiagramObjectTemplate<T extends TemplateType> = {

    /**
     * The template's name.
     */
    name: string;

    /**
     * The object's namespace.
     */
    namespace?: string[];

    /**
     * The object's type.
     */
    type: T;

    /**
     * The object's semantic role.
     */
    role?: number;

    /**
     * The object's properties.
     */
    properties?: RootPropertyDescriptor;

};


///////////////////////////////////////////////////////////////////////////////
//  2. Object Templates  //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Anchor Template
 */
export type AnchorTemplate = BaseDiagramObjectTemplate<TemplateType.Anchor>;

/**
 * Block Template
 */
export type BlockTemplate = BaseDiagramObjectTemplate<TemplateType.Block> & {

    /**
     * The anchor template the block should use.
     */
    anchors: {
        [key: string]: string;
    };

};

/**
 * Group Template
 */
export type GroupTemplate = BaseDiagramObjectTemplate<TemplateType.Group>;

/**
 * Handle Template.
 */
export type HandleTemplate = BaseDiagramObjectTemplate<TemplateType.Handle>;

/**
 * Latch Template.
 */
export type LatchTemplate = BaseDiagramObjectTemplate<TemplateType.Latch>;

/**
 * Line Template
 */
export type LineTemplate = BaseDiagramObjectTemplate<TemplateType.Line> & {

    /**
     * The handle template to line should use.
     */
    handle_template: string;

    /**
     * The latch template the line should use.
     */
    latch_template: {

        /**
         * The source latch template.
         */
        source: string;

        /**
         * The target latch template.
         */
        target: string;

    };

};


///////////////////////////////////////////////////////////////////////////////
//  3. Diagram Object Template  ///////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Diagram Object Template
 */
export type DiagramObjectTemplate
    = AnchorTemplate
    | BlockTemplate
    | HandleTemplate
    | LatchTemplate
    | LineTemplate
    | GroupTemplate;
