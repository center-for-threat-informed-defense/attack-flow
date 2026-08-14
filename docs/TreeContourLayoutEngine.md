# Tree Contour Layout Engine

This algorithm generates an initial 2D layout for an attack flow when no layout is present. It is primarily intended for top-down flows, but it essentially supports orientations in all four cardinal directions. Node positioning is determined by the directionality of existing latch-anchor relationships rather than an overarching directional force.

This algorithm does not define how a flow should be constructed, only how it is laid out once it is. To support configurable flow orientations, a latch-anchor assignment pass may be implemented to reassign existing line latches to the desired sides of their source and target blocks.

The input may be a directed graph with cycles and nodes with multiple incoming edges. For layout purposes, the graph is transformed into a rooted, tree-like structure plus a set of deferred non-tree edges. Layout is then performed bottom-up using subtree arrangement, contour comparison, and group movement.

The main goals are:

- preserve the meaning of anchor direction
- align sibling groups into readable rows and columns
- resolve conflicts by moving whole groups or subtrees rather than isolated descendants
- compact sibling spacing without allowing overlap

## 1. Layout Model

For layout purposes, the input flow is transformed into:

- a derived layout tree
- a set of deferred non-tree edges

Each node has:

- a measured bounding box
- zero or one primary layout parent
- zero or more layout children
- an attachment side relative to its parent: north, south, east, or west
- optionally, a more specific directional bias such as northeast, southeast, northwest, or southwest

Each subtree has:

- a bounding box enclosing the root node and all descendants in that subtree
- one or more directional contours used for compact sibling packing

The layout tree is used for node placement. Deferred non-tree edges are restored and routed after node placement is complete.

## 2. Root Predicate

Not every node with zero incoming layout edges should necessarily remain a root.

The algorithm therefore defines a root predicate:

- `isLayoutRoot(node) -> boolean`

This predicate determines which nodes are allowed to remain roots in the derived layout tree.

Example:

- action nodes may be allowed roots
- condition or non-action nodes may be disallowed roots

If a node is a root candidate because it has no incoming layout-parent edge, but the root predicate returns false, the algorithm should attempt to transform it into a child by flipping its outgoing tree relationships.

This normalization process continues until:

- all remaining roots satisfy the root predicate, or
- no further flips are possible

If a disallowed root has no children, it may remain as a root as a fallback so that isolated nodes can still be laid out.

## 3. Graph Normalization

Before layout begins, the input graph is normalized into a form suitable for tree-based layout.

1. Identify root candidates.
   Root candidates are nodes with no incoming layout-parent edge.

2. Apply the root predicate.
   Roots that do not satisfy the predicate should be flipped when possible so they become children of their current descendants.

3. Resolve cycles.
   If an edge would create a cycle in the layout tree, that edge is removed from the layout tree and recorded as a deferred non-tree edge.

4. Resolve multiple-parent nodes.
   If a node has multiple incoming edges, one incoming edge is selected as the node’s primary layout parent. Remaining incoming edges are deferred as non-tree edges.

5. Preserve stable ordering.
   Parent-child ordering should be deterministic so repeated layout runs produce the same result. The primary layout parent must be selected using a stable rule so that identical inputs always produce the same derived layout tree.

The result of normalization is a tree-like structure suitable for bottom-up subtree packing.

## 4. Initial Placement

If a flow is loaded without stored node positions, all nodes may initially occupy the same coordinate such as `(0, 0)`. This initial state represents maximum conflict.

The algorithm assigns each child a logical position relative to its parent using anchor side:

- east: `x + 1`
- west: `x - 1`
- north: `y - 1`
- south: `y + 1`

These are logical positions only. Final placement uses measured geometry, contour spacing, and conflict resolution.

Children attached to the same side of a parent form a sibling group:

- north and south groups are horizontal groups
- east and west groups are vertical groups

## 5. Bounding Boxes

Each node has a measured bounding box derived from its rendered width and height.

Each subtree has a bounding box enclosing:

- its root node
- all descendant nodes
- any spacing already introduced to resolve internal conflicts

Bounding boxes are used for broad conflict detection and for higher-level group movement.

However, sibling packing should not rely only on full subtree bounding boxes, since a large or sprawling descendant can otherwise force excessive spacing between siblings. To address this, the algorithm uses contour bands.

## 6. Contour Bands

Each subtree maintains a contour representation that describes how much horizontal or vertical space it occupies at different positions.

For a top-down layout, the primary contour should be understood as a set of horizontal bands.

The idea is:

- divide the subtree into horizontal slices from top to bottom
- for each slice, record the leftmost occupied x-position
- also record the rightmost occupied x-position

This can be visualized as measuring the subtree’s width at many different heights.

These horizontal contour bands are useful because sibling subtrees in a top-down flow usually need to be packed side by side. Instead of treating a subtree as one large rectangle, the algorithm can compare only the parts of two subtrees that occupy the same vertical region.

For example, one subtree may be narrow near its root and much wider deeper down. Another subtree beside it may be wide near the top but narrow lower down. If only full bounding boxes are compared, the two subtrees may be pushed much farther apart than necessary. If contour bands are compared instead, the algorithm can determine the minimum horizontal separation needed at the actual heights where the two subtrees would overlap.

In some cases, especially for east-west sibling groups, it is useful to use the rotated form of the same idea:

- divide the subtree into vertical slices from left to right
- for each slice, record the uppermost and lowermost occupied y-position

This rotated form supports compact packing of vertically stacked sibling groups.

Contour bands may be defined in different ways:

- fixed-size bands
- bands derived from logical row or depth
- bands derived from measured node and subtree geometry

The important point is not the exact band definition, but that sibling packing should compare the actual occupied extent of subtrees across corresponding bands rather than relying only on full subtree bounding boxes.

Each subtree contour is built bottom-up by:

1. adding the node’s own bounding box to the contour
2. shifting each child contour by the child’s local offset
3. merging the shifted child contours into the parent contour

## 7. Conflict Resolution Order

Conflicts are resolved bottom-up.

The algorithm proceeds from:

- leaf nodes
- to sibling groups
- to families of sibling groups
- to larger enclosing subtrees

At each level, previously resolved internal structure should be preserved whenever possible.

This means that once a subtree has been locally arranged, higher-level conflict resolution should move that subtree as a unit rather than disturb its internal arrangement.

## 8. Conflict Types

### 8.1 Parallel Sibling Conflict

A parallel sibling conflict occurs when sibling subtrees attached to the same side of a parent overlap.

Examples:

- two southern children overlap
- two eastern child subtrees overlap
- a grandchild in one sibling subtree collides with another sibling subtree on the same side

This is resolved by pushing sibling subtrees apart along the axis perpendicular to the side on which they are attached.

- north/south groups separate along x
- east/west groups separate along y

When resolving this conflict, spacing should be computed using contour comparison rather than full subtree width or height whenever possible.

For example:

- two south-facing sibling subtrees should be compared by their x-intervals in overlapping y contour bands
- the minimum non-overlapping shift should be applied to separate them

Directional bias should still be respected. For example:

- a southeast-attached subtree should prefer positive x displacement
- a southwest-attached subtree should prefer negative x displacement

### 8.2 Perpendicular Sibling Conflict

A perpendicular sibling conflict occurs when a horizontal sibling group intersects a vertical sibling group around the same parent.

Examples:

- a southern row intersects an eastern column
- a northern row intersects a western column

This is resolved by moving the whole row and/or the whole column away from the parent along their outward axis:

- south groups move in `+y`
- north groups move in `-y`
- east groups move in `+x`
- west groups move in `-x`

Rows and columns should move as units so that internal alignment is preserved.

### 8.3 Extended-Family Conflict

An extended-family conflict occurs when overlap is caused by descendants within two different subtrees rather than by immediate sibling roots.

This should be treated as a conflict between enclosing subtree structures, not as an isolated node-node collision.

Resolution should move the smallest valid enclosing groups that preserve previously established alignment and internal structure.

## 9. Sibling Packing With Contours

Sibling packing should use contour comparison rather than full subtree width or height whenever possible.

For a top-down layout, this usually means:

- compare adjacent sibling subtrees using their horizontal contour bands
- look only at bands where the two subtrees overlap vertically
- determine how much horizontal separation is needed so the occupied x-ranges in those bands no longer overlap
- shift the appropriate sibling subtree or sibling group by only that amount

This allows siblings to remain compact near the parent even when one subtree spreads out farther at deeper generations.

For east-west sibling groups, the same idea may be applied in the rotated direction:

- compare corresponding vertical contour bands
- determine the minimum vertical separation needed to prevent overlap
- move the affected sibling subtree or sibling group accordingly

The purpose of contour-based packing is to make spacing depend on where subtrees actually conflict, rather than on the full envelope of everything contained inside them.

## 10. Movement Rules

The algorithm should prefer moving groups over moving individual descendants.

In general:

- unresolved local nodes may move individually during their own subtree formation
- resolved sibling groups should move as rows or columns
- resolved subtrees should move as units
- deeper descendants should not force unnecessary spacing between immediate siblings if contour comparison shows that no local conflict exists

This preserves readability and keeps the layout visually structured.

## 11. Alignment Invariants

The following invariants should hold:

- nodes in the same resolved horizontal group remain aligned on y
- nodes in the same resolved vertical group remain aligned on x
- the internal arrangement of a resolved subtree is preserved during higher-level conflict resolution
- sibling spacing should be based on contour overlap, not solely on total subtree envelope
- all final node and subtree geometry must be non-overlapping

## 12. Handling Multiple Parents

Nodes with multiple incoming edges are not directly compatible with a strict subtree model.

The algorithm therefore assigns one primary layout parent to such a node. The node is included only in that parent’s layout subtree. Remaining incoming edges are recorded as deferred non-tree edges and routed after node placement.

The choice of primary parent must be deterministic. In other words, the same input flow should always yield the same primary parent assignment when layout is run again.

## 13. Provisional Components

After the tree contour pass has arranged each root subtree, every remaining root of the derived layout tree defines a provisional component.

Each provisional component:

- owns exactly one root subtree
- preserves the internal arrangement produced by the tree contour pass
- has a simple bounding box derived from that subtree
- is treated as a rigid unit during component arrangement

Cross-component edges do not create new components. Instead, they create relationships between existing provisional components.

## 14. Conservative Component Arrangement

The first component-arrangement pass should be deliberately conservative.

Its purpose is to handle the simplest and most clearly interpretable cross-component cases without disturbing the progress already made by the tree contour pass.

The intended emphasis is:

- parent components should be arranged around child components
- the side on which an edge enters the child component determines where the parent component should be placed
- ambiguous component relationships should be skipped rather than partially resolved

The direction rules are:

- if an edge flows into the northern side of a child component, the parent component should be placed above the child component
- if an edge flows into the southern side of a child component, the parent component should be placed below the child component
- if an edge flows into the eastern side of a child component, the parent component should be placed to the east of the child component
- if an edge flows into the western side of a child component, the parent component should be placed to the west of the child component

This pass should use the child-side attachment as the primary directional signal. The local orientation of the already-laid-out child component should be preserved.

### 14.1 Eligible Component Relationships

Not every cross-component relationship should be acted upon.

This conservative pass should only consider a component pair if all cross-component edges from the parent component into the child component imply the same component-side placement.

Examples:

- if all relevant edges from parent component `A` enter the northern side of child component `B`, then `A` may be placed above `B`
- if all relevant edges enter the eastern side, then `A` may be placed to the east of `B`

This pass should skip a component pair entirely if:

- the component pair participates in a cycle
- the parent component has cross-component edges into more than one side of the same child component
- the relationship is otherwise ambiguous

In these skipped cases, the pair should remain at its basic provisional spacing for now.

### 14.2 Cycles

If provisional components participate in a cyclic relationship, they should be left alone relative to one another during this pass.

In other words:

- acyclic component relationships may influence component placement
- cyclic component relationships should not be resolved here

This preserves a conservative and predictable behavior while avoiding premature handling of more complicated cases.

### 14.3 Initial Component Placement

Before applying directional component relationships, provisional components may still be seeded with a simple default spacing rule, such as left-to-right packing.

That seeded arrangement is only an initial state. Eligible acyclic relationships may then move components around one another according to the child-side placement rules above.

Each movement should treat the entire provisional component as a rigid body.

## 15. Component Collision Detection And Resolution

After provisional components have been moved according to eligible directional relationships, the algorithm should perform a collision scan on all provisional components.

Two provisional components are colliding if their bounding boxes overlap.

This collision test should be simple:

- no contour comparison is required
- only the rectangular component bounding boxes need to be checked
- overlap can be detected using direct bounding-box math

If a collision is detected, resolve it using the same general ideas as the base algorithm.

### 15.1 Parallel Component Conflict

A parallel component conflict occurs when multiple provisional components are arranged on the same side of another component and overlap each other.

Examples:

- multiple components above the same child component overlap one another
- multiple components to the east of the same child component overlap one another

This may be resolved similarly to parallel sibling conflict:

- components above or below the same child component should be pushed apart on the x-axis
- components to the east or west of the same child component should be pushed apart on the y-axis

The important rule is that components remain rigid bodies during this movement.

### 15.2 Perpendicular Component Conflict

A perpendicular component conflict occurs when a row of components on one side of a child component intersects a column of components on another side.

This may be resolved similarly to perpendicular sibling conflict:

- northern groups are pushed farther in `-y`
- southern groups are pushed farther in `+y`
- eastern groups are pushed farther in `+x`
- western groups are pushed farther in `-x`

Again, the entire provisional component should move as a rigid unit.

## 16. Finalization

After subtree layout, conservative component arrangement, and component collision resolution:

- logical placements are converted to final canvas coordinates using measured node geometry
- deferred non-tree edges are restored and routed
- the final layout is accepted once node, subtree, and component bounding conflicts have been resolved to the extent allowed by this conservative pass

## 17. Summary

The Tree Contour Layout Engine operates in two layers:

- a local tree contour pass that arranges nodes inside each root subtree
- a conservative component pass that arranges provisional components around child components when the cross-component relationships are simple and acyclic

The component pass is intentionally limited:

- it honors child-side directional relationships in simple cases
- it skips ambiguous multi-side component relationships
- it skips cyclic component relationships
- it uses simple bounding-box collision detection and rigid-body movement
