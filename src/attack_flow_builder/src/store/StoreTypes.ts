import { PageModel } from "@/assets/scripts/Visualizations/BlockDiagram/ModelTypes/PageModel"
import { BlockDiagramDocument } from "@/assets/scripts/Visualizations/BlockDiagram/BlockDiagramDocument"
import { DiagramObjectModel } from "@/assets/scripts/Visualizations/BlockDiagram/ModelTypes/BaseTypes/DiagramObjectModel"


///////////////////////////////////////////////////////////////////////////////
//  1. Stores  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Central Module Store
 */
export type ModuleStore = {
    ActiveSessionStore: ActivePageStore
}

/**
 * Active Document Store
 */
export type ActiveDocumentStore = {
    document: BlockDiagramDocument
}

/**
 * Active Page Store
 */
export type ActivePageStore = {
    page: PageModel,
    triggerLayoutUpdate: number,
    triggerAttributeUpdate: number,
}
