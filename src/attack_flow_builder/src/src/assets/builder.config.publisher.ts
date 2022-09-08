import { DiagramPublisher } from "./scripts/DiagramPublisher/DiagramPublisher";
import { DiagramObjectModel, SemanticAnalyzer } from "./scripts/BlockDiagram";

class AttackFlowPublisher extends DiagramPublisher {
    
    /**
     * Returns the published diagram in text form.
     * @param diagram
     *  The diagram to publish.
     * @returns
     *  The published diagram in text form.
     */
    public override publish(diagram: DiagramObjectModel): string {
        let graph = SemanticAnalyzer.toGraph(diagram);
        
        // Do some publishing...
        console.log("DID IT!")

        return "";
    }
    
}

export default AttackFlowPublisher;
