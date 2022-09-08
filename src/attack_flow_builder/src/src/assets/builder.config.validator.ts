import { DiagramValidator } from "./scripts/DiagramValidator/DiagramValidator";
import { DiagramObjectModel, SemanticAnalyzer } from "./scripts/BlockDiagram";

class AttackFlowValidator extends DiagramValidator {

    /**
     * Validates a diagram.
     * @param diagram
     *  The diagram to validate.
     */
    protected override validate(diagram: DiagramObjectModel): void {
        let graph = SemanticAnalyzer.toGraph(diagram);
        
        // Do some validating...
        for(let edge of graph.edges) {
            if(edge.prev.length === 1 && edge.next.length === 1) {
                continue;
            } else {
                this.addError(edge, "Everything should be connected");
            }
        }
        
    }
    
}

export default AttackFlowValidator;
