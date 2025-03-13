import { Block, Canvas, Line, type DiagramObjectFactory } from "../OpenChart/DiagramModel";

export class StixToFlow {


    public static toFlow(stix: string, factory: DiagramObjectFactory): Canvas { 
        // TODO: Parse stix
        // TODO: Look up type

        // Create diagram objects
        const canvas = factory.createNewDiagramObject("attack_flow", Canvas);
        // Creating blocks first
        const objectMap = new Map<string, Block>();
        for(let i = 0; i < 100; i++) {
            const block = factory.createNewDiagramObject("", Block);
            canvas.addObject(block);
            objectMap.set("id", block);

        }
        // Traverse from root
        // Build lines
        // Linking bottom of src node to top of target node
        const line = factory.createNewDiagramObject("line", Line);


        const block = factory.createNewDiagramObject("", Block);
        line.source.link(block.anchors.get("0")!);       

        // Link diagram objects


        // Figure out node
        // Level order traversal
        // Link 

        return canvas;
    } 

}