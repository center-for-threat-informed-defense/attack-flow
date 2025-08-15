import { LayoutBox, LayoutNode } from "../LayoutElement";
import { GenericLayoutTraverser } from "../NodeTraversalAlgorithms";
import type { IdGenerator } from "../IdGenerator";
import type { NodeTraversalAlgorithm } from "../NodeTraversalAlgorithms";

export class SegmentLinker {

    /**
     * The linker's traversal algorithm.
     */
    public readonly traverse: NodeTraversalAlgorithm;

    /**
     * The attributes to assign to each root layout box.
     */
    public readonly rootAttrs: number;

    /**
     * The attributes to assign to each branch layout box.
     */
    public readonly branchAttrs: number;

    /**
     * The linker's id generator.
     */
    public readonly idGenerator: IdGenerator;


    /**
     * Creates a new {@link SegmentLinker}.
     * @param traverse
     *  The traversal algorithm to use.
     * @param rootAttrs
     *  The attributes to assign to each root layout box.
     * @param branchAttrs
     *  The attributes to assign to each branch layout box.
     * @param idGenerator
     *  The id generator.
     */
    constructor(
        traverse: NodeTraversalAlgorithm,
        rootAttrs: number,
        branchAttrs: number,
        idGenerator: IdGenerator
    ) {
        this.traverse = traverse;
        this.rootAttrs = rootAttrs;
        this.branchAttrs = branchAttrs;
        this.idGenerator = idGenerator;
    }


    /**
     * Joins a lattice of floating and dangling branches into one layout box.
     * @param boxes
     *  The layout segments.
     */
    public joinLattice(boxes: LayoutBox[]) {
        do {
            this.joinFloatingBranches(boxes);
            // this.joinDanglingBranches(boxes);
        } while(this.chainSegments(boxes));
    } 

    /**
     * Attempts to join floating branches together.
     * @param boxes
     *  The layout segments.
     * @returns
     *  True if branches were joined together, false otherwise.
     */
    public joinFloatingBranches(boxes: LayoutBox[]): boolean {
        let hasJoined = false;
        
        // Find floating branches
        
        // Extract lattice layers
        const traverse = new GenericLayoutTraverser(this.traverse);
        const layers = traverse.extractTopLatticeLayers(boxes);

        // const traverse = new GenericLayoutTraverser(this.traverse);
        // const join = [];
        // for(const box of boxes) {
        //     const branches = traverse.prevBox(box);
        //     if(branches.length <= 1) {
        //         continue;
        //     }
        //     if(!branches.every(b => traverse.prevBox(b).length === 0)) {
        //         continue;
        //     }
        //     join.push(branches);
        // }

        // Join branches together
        const ids = this.idGenerator;
        for(const layer of layers) {
            if(layer.length < 2) {
                continue;
            }
            // Build root
            const rootBox = new LayoutBox(ids.next(), this.rootAttrs);
            const branchBox = new LayoutBox(ids.next(), this.branchAttrs);
            for(let branch of layer) {
                // Add branch
                branchBox.add(new LayoutBox(ids.next(), this.rootAttrs, branch));
                // Remove branch from list
                boxes.splice(boxes.indexOf(branch), 1);
            }
            rootBox.add(branchBox);
            // Add root to list
            boxes.splice(boxes.length, 0, rootBox);
            // Trip flag
            hasJoined = true;
        }

        // Join branches together
        // const ids = this.idGenerator;
        // for(const branches of join) {
        //     // Build root
        //     const rootBox = new LayoutBox(ids.next(), this.rootAttrs);
        //     const branchBox = new LayoutBox(ids.next(), this.branchAttrs);
        //     for(let branch of branches) {
        //         // Add branch
        //         branchBox.add(new LayoutBox(ids.next(), this.rootAttrs, branch));
        //         // Remove branch from list
        //         boxes.splice(boxes.indexOf(branch), 1);
        //     }
        //     rootBox.add(branchBox);
        //     // Add root to list
        //     boxes.splice(boxes.length, 0, rootBox);
        //     // Trip flag
        //     hasJoined = true;
        // }
        return hasJoined;
    }

    /**
     * Attempts to join dangling branches together.
     * @param boxes
     *  The layout segments.
     * @returns
     *  True if branches were joined together, false otherwise.
     */
    public joinDanglingBranches(boxes: LayoutBox[]): boolean {
        // let hasJoined = false;
        
        // Find dangling branches
        // const traverse = new GenericLayoutTraverser(this.traverse);
        // const join = new Map<LayoutBox, LayoutBox[]>();
        // for(const box of boxes) {
        //     const branches = traverse.prevBox(box);
        //     if(branches.length !== 1) {
        //         continue;
        //     }
        //     const branch = branches[0];
        //     if(!join.has(branch)) {
        //         join.set(branch, []);
        //     }
        //     join.get(branch)!.push(box);
        // }

        // Find dangling branches
        const traverse = new GenericLayoutTraverser(this.traverse);
        const join = []
        for(const box of boxes) {
            const branches = traverse.nextBox(box);
            if(branches.length !== 0) {
                continue;
            }
            join.push(box);
        }

        // console.log(join);

        // // Join branches together
        // const ids = this.idGenerator;
        // for(const [source, branches] of join) {
        //     if(branches.length < 2) {
        //         continue;
        //     }
        //     // Build root
        //     const rootBox = new LayoutBox(ids.next(), this.rootAttrs, source);
        //     const branchBox = new LayoutBox(ids.next(), this.branchAttrs);
        //     for(let branch of branches) {
        //         // Add branch
        //         branchBox.add(new LayoutBox(ids.next(), this.rootAttrs, branch));
        //         // Remove branch from list
        //         boxes.splice(boxes.indexOf(branch), 1);
        //     }
        //     rootBox.add(branchBox);
        //     // Remove source from list
        //     boxes.splice(boxes.indexOf(source), 1);
        //     // Add root box to list
        //     boxes.splice(boxes.length, 0, rootBox);
        //     // Trip flag
        //     hasJoined = true;
        // }

        if(join.length < 2) {
            return false;
        }

        // Join branches together
        const ids = this.idGenerator;
        const rootBox = new LayoutBox(ids.next(), this.rootAttrs);
        const branchBox = new LayoutBox(ids.next(), this.branchAttrs);
        for(const branch of join) {
            // Add branch
            branchBox.add(new LayoutBox(ids.next(), this.rootAttrs, branch));
            // Remove branch from list
            boxes.splice(boxes.indexOf(branch), 1);
        //     rootBox.add(branchBox);
        //     // Remove source from list
        //     boxes.splice(boxes.indexOf(source), 1);
        //     // Trip flag
        //     hasJoined = true;
        }
        // Add root box to list
        boxes.splice(boxes.length, 0, rootBox);
        rootBox.add(branchBox);

        return true;
    }

    /**
     * Attempts to chain segments together.
     * @param boxes
     *  The layout segments.
     * @returns
     *  True if tree segments were chained, false otherwise.
     */
    public chainSegments(boxes: LayoutBox[]): boolean {
        let hasChained = false;
        // Merge boxes
        const tailBoxes = new Set<string>();
        const traverse = new GenericLayoutTraverser(this.traverse);
        for(const rootBox of boxes) {
            // Check if root has something to merge into
            const nodes = traverse.prevNodes(rootBox);
            if(nodes.length === 0) {
                continue;
            }
            // Check if previous nodes share a parent layout
            let sharedBox = SegmentLinker.findSharedBox(nodes);
            if(!sharedBox) {
                continue;
            }
            // Check if root is allowed to merge into the parent layout
            const sharedRoot = sharedBox.root;
            if(sharedRoot.attrs !== this.rootAttrs) {
                continue;
            }
            // Choose next immediate shared box if layouts don't match
            if(sharedBox.attrs !== this.rootAttrs) {
                sharedBox = sharedBox.parent!;
            }
            // Remove box
            boxes.splice(boxes.indexOf(rootBox), 1);
            // Add root box to shared box's tail box
            const ids = this.idGenerator;
            const last = sharedBox.last;
            if(!(last instanceof LayoutBox && tailBoxes.has(last.id))) {
                const attrs = this.branchAttrs;
                const tailBox = new LayoutBox(ids.next(), attrs, rootBox);
                sharedBox.add(tailBox);
                tailBoxes.add(tailBox.id);
            } else {
                last.add(rootBox);
            }
            hasChained = true;
        }
        return hasChained;
    }
    
    /**
     * Returns the most immediate layout box shared by `nodes`.
     * @param nodes
     *  The nodes.
     * @returns
     *  The shared layout box, if there was one.
     */
    public static findSharedBox(nodes: LayoutNode[]): LayoutBox | null {
        if(nodes.length === 1) {
            return nodes[0].parent;
        }
        // Resolve shared fully-qualified name
        const delim = LayoutBox.NamespaceDelimiter;
        const spaces = nodes.map(n => n.parent?.fqn.split(delim) ?? []);
        const length = Math.min(...spaces.map(a => a.length));
        const shared: string[] = [];
        for(let i = 0; i < length; i++) {
            let id: string | null = spaces[0][i]; 
            for(let j = 1; j < spaces.length; j++) {
                if(id === null) {
                    break;
                }
                if(id !== spaces[j][i]) {
                    id = null;
                }
            }
            if(id === null) {
                break;
            }
            shared.push(id);
        }
        const fqn = shared.join(delim) || null
        if(!fqn) {
            return null;
        }
        // Resolve shared box
        let b = nodes[0].parent!;
        while(b.fqn !== fqn) {
            b = b.parent!;
        }
        return b;
    }

}
