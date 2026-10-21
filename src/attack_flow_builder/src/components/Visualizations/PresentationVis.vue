<template>
  <div
    ref="shell"
    class="diagram-shell"
  >
    <div class="diagram-controls">
      <label class="diagram-control-label">
        Theme

        <select
          v-model="currentThemeOption"
          name="presentation-theme"
        >
          <option
            v-for="opt of themeOptions"
            :value="opt.value"
            :key="opt.value"
          >{{ opt.text }}</option>
        </select>
      </label>
      <label class="diagram-control-label">
        <input
          type="checkbox"
          v-model="showTags"
        >
        Tags
      </label>
      <label
        class="diagram-scale-control"
        for="presentation-scale"
      >
        <span class="diagram-scale-label">Scale</span>
        <input
          id="presentation-scale"
          v-model.number="diagramScale"
          class="diagram-scale-slider"
          type="range"
          min="80"
          max="140"
          step="5"
        >
        <span class="diagram-scale-value">{{ diagramScale }}%</span>
      </label>
    </div>
    <div
      v-if="diagramState.error"
      class="diagram-state"
    >
      {{ diagramState.error }}
    </div>
    <svg
      v-else-if="diagramState.layout"
      class="diagram-svg"
      :viewBox="`0 0 ${diagramState.layout.width} ${diagramState.layout.height}`"
      preserveAspectRatio="xMinYMin meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        v-for="edge of diagramState.layout.edges"
        :key="edge.id"
        :d="edge.path"
        fill="none"
        :stroke="currentPresentationTheme.edgeColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <polygon
        v-for="edge of diagramState.layout.edges"
        :key="`${edge.id}-arrow`"
        :points="edge.arrowPoints"
        :fill="currentPresentationTheme.arrowColor"
      />

      <g
        v-for="node of diagramState.layout.nodes"
        :key="node.id"
        :transform="`translate(${node.x}, ${node.y})`"
      >
        <template v-if="node.type == 'action'">
          <rect
            :width="node.width"
            :height="node.height"
            :rx="nodeBorderRadius"
            :ry="nodeBorderRadius"
            :fill="currentPresentationTheme.actionFill"
            :stroke="currentPresentationTheme.actionStroke"
            stroke-width="2"
          />
        </template>
        <template v-else-if="node.type == 'condition'">
          <rect
            :width="node.width"
            :height="node.height"
            :rx="nodeBorderRadius"
            :ry="nodeBorderRadius"
            :fill="currentPresentationTheme.conditionFill"
            :stroke="currentPresentationTheme.conditionStroke"
            stroke-width="2"
          />
        </template>
        <ellipse
          v-else
          :cx="node.width / 2"
          :cy="node.height / 2"
          :rx="node.width / 2"
          :ry="node.height / 2"
          :fill="currentPresentationTheme.operatorFill"
          :stroke="currentPresentationTheme.operatorStroke"
          stroke-width="2"
        />

        <template v-if="showTags && node.tags.length">
          <!-- Create the properties section of the block. -->
          <path
            :d="`
                    M 0 ${node.propertiesTopY} 
                    L ${node.width} ${node.propertiesTopY} 
                    L ${node.width} ${node.height - nodeBorderRadius} 
                    Q ${node.width} ${node.height} ${node.width - nodeBorderRadius} ${node.height} 
                    L ${nodeBorderRadius} ${node.height} 
                    Q 0 ${node.height} 0 ${node.height - nodeBorderRadius} 
                    Z
                `"
            :fill="currentPresentationTheme.propertiesFill"
            :stroke="node.type === 'action' ? currentPresentationTheme.actionPropertiesStroke : currentPresentationTheme.conditionPropertiesStroke"
            stroke-width="2"
          />
        </template>

        <template v-if="showTags">
          <template
            v-for="tag in node.tags"
            :key="tag.id"
          >
            <rect
              :width="tag.width"
              :height="tagHeight"
              rx="5"
              ry="5"
              :x="tag.x"
              :y="tag.y"
              :fill="tag.color"
              stroke="black"
              stroke-width="1"
            />
            <text
              :x="tag.x + tagHorizontalPadding"
              :y="tag.textY"
              :fill="getTagTextColor(tag.color)"
              :font-size="tagFontSize"
              :font-family="diagramFontFamily"
            >
              {{ tag.name }}
            </text>
          </template>
        </template>
        

        <text
          :x="node.width / 2"
          :y="node.textY"
          text-anchor="middle"
          :fill="currentPresentationTheme.textColor"
          :font-family="diagramFontFamily"
          :font-size="labelFontSize"
          font-weight="600"
          dominant-baseline="middle"
          pointer-events="none"
        >
          <tspan
            v-for="(line, index) of node.lines"
            :key="`${node.id}-${index}`"
            :x="node.width / 2"
            :dy="index === 0 ? 0 : lineHeight"
          >
            {{ line }}
          </tspan>
        </text>
        <template v-if="node.type === 'condition'">
          <circle
            :cx="getConditionBadgeX(node)"
            :cy="getConditionBadgeY(node.height, true)"
            :r="conditionBadgeRadius"
            :fill="currentPresentationTheme.conditionBadgeFill"
            :stroke="currentPresentationTheme.conditionStroke"
            stroke-width="2"
          />
          <circle
            :cx="getConditionBadgeX(node)"
            :cy="getConditionBadgeY(node.height, false)"
            :r="conditionBadgeRadius"
            :fill="currentPresentationTheme.conditionBadgeFill"
            :stroke="currentPresentationTheme.conditionStroke"
            stroke-width="2"
          />
          <text
            :x="getConditionBadgeX(node)"
            :y="getConditionBadgeY(node.height, true)"
            text-anchor="middle"
            dominant-baseline="middle"
            :fill="currentPresentationTheme.conditionBadgeFontColor"
            :font-family="diagramFontFamily"
            font-size="11"
            font-weight="700"
            pointer-events="none"
          >
            T
          </text>
          <text
            :x="getConditionBadgeX(node)"
            :y="getConditionBadgeY(node.height, false)"
            text-anchor="middle"
            dominant-baseline="middle"
            :fill="currentPresentationTheme.conditionBadgeFontColor"
            :font-family="diagramFontFamily"
            font-size="11"
            font-weight="700"
            pointer-events="none"
          >
            F
          </text>
        </template>
      </g>
    </svg>
    <div
      v-else
      class="diagram-state"
    >
      No presentation graph available.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import { useApplicationStore } from '@/stores/ApplicationStore';
import { BlockView, LineView } from '@/assets/scripts/OpenChart/DiagramView';
import { buildGraph } from '@/assets/scripts/OpenChart/DiagramView/DiagramLayoutEngine/LayoutHelpers';
import { resolveSelectedTags, type ResolvedTag, getTagTextColor } from '@/assets/scripts/OpenChart/DiagramView/DiagramObjectView/Faces/Blocks/TagRendering';
import { BrowserFont } from '@/assets/scripts/OpenChart/Utilities/FontStore/BrowserFont';
import {type PresentationTheme, darkGrayscaleTheme, lightGrayscaleTheme, lightColorfulTheme, darkColorfulTheme } from './PresentationThemes';

const allowedBlockTypesArray = ['action', 'condition', 'AND_operator', 'OR_operator'] as const;
const allowedBlockTypesSet = new Set<string>(allowedBlockTypesArray);
type AllowedBlockType = typeof allowedBlockTypesArray[number];
type ConditionBranch = boolean | null;
type RowDirection = "ltr" | "rtl";

/** Outer left/right inset for the rendered SVG content. */
const horizontalPadding = 40;
/** Outer top/bottom inset for the rendered SVG content. */
const verticalPadding = 24;
/** Smallest width the diagram will target before wrapping decisions. */
const minDiagramWidth = 420;
/** Horizontal space between adjacent node columns inside a row. */
const columnGap = 56;
/** Vertical space between wrapped horizontal rows of columns. */
const rowGap = 60;
/** Vertical space between fully independent components. */
const componentGap = 40;
/** Vertical spacing between nodes stacked within the same column. */
const nodeGap = 24;
/** Short straight segment used when an edge exits or enters a node. */
const edgeStub = 18;
/** Spacing between parallel edges that wrap between different rows. */
const crossRowEdgeGap = 10;
/** Extra horizontal room reserved for edges that wrap around a row. */
const wrapGutter = 34;
/** Extra canvas room so edge strokes and arrowheads do not clip at the SVG edge. */
const renderEdgePadding = 8;
/** Width held back during wrapping so the last column does not sit flush against the right viewport edge. */
const responsiveRightReserve = 18;
/** Maximum horizontal bridge length for merging two nearby vertical routing lanes into one. */
const laneMergeThreshold = 20;
/** Tolerance used when comparing edge coordinates during cleanup. */
const edgeCoordinateEpsilon = 0.01;
/** Font family used for text elements. */
const diagramFontFamily = "Inter, Arial, sans-serif";
/** Font size used for block labels. */
const labelFontSize = 14;
/** Horizontal padding added around measured rectangular block labels. */
const labelPaddingX = 10;
/** Vertical padding added around measured rectangular block labels. */
const labelPaddingY = 10;
/** Border radius of non-operator nodes. */
const nodeBorderRadius = 14;
/** Extra width reserved inside condition blocks so labels clear the branch badges. */
const conditionBadgePaddingRight = 16;
/** Radius of the true/false badges shown on condition blocks. */
const conditionBadgeRadius = 11;
/** Vertical badge offset from the condition block center, expressed as a fraction of the block height. */
const conditionBadgeOffset = 0.2;
/** Line spacing used for wrapped node labels. */
const lineHeight = 18;
/** Maximum number of rendered lines before a label is truncated. */
const maxLabelLines = 4;
/** Font size of tags. */
const tagFontSize = 12;
/** Padding applied to tags to give more internal space to text. */
const tagHorizontalPadding = 10;
/** Horizontal space between tags. */
const tagHorizontalSpace = 5;
/** Vertical space between rows of tags. */
const tagVerticalSpace = 5;
/** Height of tags. */
const tagHeight = 20;
/** Horizontal padding within properties area. */
const propertiesHorizontalPadding = 10;
/** Vertical padding within properties area. */
const propertiesVerticalPadding = 10;

/** BrowserFont instance for tags. */
const tagFont = new BrowserFont({ size: `${tagFontSize}px`, family: diagramFontFamily });
/** BrowserFont instance for block labels. */
const labelFont = new BrowserFont({ size: `${labelFontSize}px`, family: diagramFontFamily });

/** ResolvedTag, plus fields useful for layout (e.g width and position). */
interface TagWithLayout extends ResolvedTag {
    width: number;
    x: number;
    y: number;
    textY: number;
}

/** Graph node data used by the presentation visualization. */
interface PresentationNode {
    id: string;
    type: AllowedBlockType;
    name: string;
    tags: TagWithLayout[];
    parentIds: string[];
    childIds: string[];
}

/** Directed connection between two presentation nodes. */
interface PresentationEdge {
    id: string;
    sourceId: string;
    targetId: string;
    branch: ConditionBranch;
}

/** Full graph model passed into the SVG layout pipeline. */
interface PresentationGraph {
    nodes: PresentationNode[];
    edges: PresentationEdge[];
}

/** Presentation node with measured label lines and box dimensions. */
interface SizedNode extends PresentationNode {
    lines: string[];
    width: number;
    height: number;
    propertiesTopY : number;
}

/** One vertical column of nodes that share the same graph level. */
interface ColumnLayout {
    level: number;
    nodes: SizedNode[];
    width: number;
    height: number;
}

/** One wrapped horizontal row of columns in the diagram layout. */
interface RowLayout {
    index: number;
    direction: RowDirection;
    columns: ColumnLayout[];
    left: number;
    right: number;
    top: number;
    height: number;
}

/** Fully positioned node data ready for SVG rendering. */
interface RenderedNode extends SizedNode {
    x: number;
    y: number;
    row: number;
    rowDirection: RowDirection;
    level: number;
    lines: string[];
    textY: number;
}

/** Serialized SVG edge data used directly by the template. */
interface RenderedEdge {
    id: string;
    path: string;
    arrowPoints: string;
}

/** Raw routed edge geometry before conversion to SVG strings. */
interface EdgeGeometry {
    id: string;
    points: Array<{ x: number; y: number }>;
}

/** Complete SVG render payload consumed by the template. */
interface SvgLayout {
    width: number;
    height: number;
    nodes: RenderedNode[];
    edges: RenderedEdge[];
}

/** Intermediate layout result for a single disconnected graph component. */
interface ComponentLayout {
    width: number;
    height: number;
    nodes: RenderedNode[];
    edges: EdgeGeometry[];
}

type ThemeId = "current" | "light_colorful" | "dark_colorful" | "light_grayscale" | "dark_grayscale";

const themeOptions : {
    value: ThemeId,
    text: string
}[] = [
    { value: "current", text: "Current" },
    { value: "light_grayscale", text: "Light Grayscale" },
    { value: "dark_grayscale", text: "Dark Grayscale" },
    { value: "light_colorful", text: "Light Colorful" },
    { value: "dark_colorful", text: "Dark Colorful" }
]

const currentThemeOption = ref<ThemeId>('current');

const currentPresentationTheme = computed<PresentationTheme>(() => {
    switch (currentThemeOption.value) {
        case "light_colorful":
            return lightColorfulTheme;
        case "dark_colorful":
            return darkColorfulTheme;
        case "dark_grayscale":
            return darkGrayscaleTheme;
        case "light_grayscale":
            return lightGrayscaleTheme;
        case "current": {
            const appTheme = app.activeEditor.file.factory.theme.id;

            if (appTheme === "dark_theme") return darkGrayscaleTheme;
            return lightGrayscaleTheme;
        }
    }
    return lightGrayscaleTheme; // makes linter happy :)
});

const app = useApplicationStore();
const shell = useTemplateRef('shell');
const containerWidth = ref(minDiagramWidth);
const diagramScale = ref(100);
const showTags = ref(true);
let resizeObserver: ResizeObserver | null = null;

const scaleFactor = computed(() => diagramScale.value / 100);
const effectiveLayoutWidth = computed(() =>
    Math.max(minDiagramWidth, Math.round(containerWidth.value / scaleFactor.value))
);

const diagramState = computed(() => {
    const graph = createPresentationGraph();

    if (graph.nodes.length === 0) {
        return {
            layout: null as SvgLayout | null,
            error: ""
        };
    }

    try {
        return {
            layout: buildSvgLayout(graph, effectiveLayoutWidth.value),
            error: ""
        };
    } catch (error) {
        return {
            layout: null as SvgLayout | null,
            error: error instanceof Error ? error.message : "Unable to render presentation graph."
        };
    }
});

/**
 * Build a stable lookup key for an edge between two blocks.
 * @param source Source block.
 * @param target Target block.
 * @returns Stable edge key for the source-target pair.
 */
function getBlockEdgeKey(source: BlockView, target: BlockView): string {
    return `${source.instance}->${target.instance}`;
}

/**
 * Combine two possible branch labels for the same collapsed edge.
 * @param existing Previously recorded branch value.
 * @param incoming Newly discovered branch value.
 * @returns The merged branch value, or `null` if the branches conflict.
 */
function mergeConditionBranch(
    existing: ConditionBranch | undefined,
    incoming: ConditionBranch
): ConditionBranch {
    if (existing === undefined || existing === incoming) {
        return incoming;
    }

    return null;
}

/**
 * Walk through disallowed nodes until the next allowed descendants are found.
 * @param graphNode Starting node to inspect.
 * @param graph Full adjacency graph.
 * @param branch Branch metadata to preserve while traversing.
 * @param result Mutable map collecting reachable allowed descendants and their branch values.
 * @param visited Nodes already visited during this traversal.
 * @returns Nothing. Results are accumulated into `result`.
 */
function collectCollapsedChildren(
    graphNode: BlockView,
    graph: Map<BlockView, Set<BlockView>>,
    branch: ConditionBranch,
    result: Map<BlockView, ConditionBranch>,
    visited: Set<BlockView> = new Set()
) {
    if (visited.has(graphNode)) {
        return;
    }
    visited.add(graphNode);

    if (allowedBlockTypesSet.has(graphNode.id)) {
        result.set(graphNode, mergeConditionBranch(result.get(graphNode), branch));
        return;
    }

    const children = graph.get(graphNode);
    if (!children) {
        return;
    }

    for (const child of children) {
        collectCollapsedChildren(child, graph, branch, result, visited);
    }
}

/**
 * Collapse disallowed nodes while preserving the first-hop branch metadata from allowed sources.
 * @param graph Full adjacency graph.
 * @param directBranches Direct branch metadata for original edges.
 * @returns Collapsed adjacency graph keyed by allowed source blocks and allowed target blocks.
 */
function collapseDisallowedRelationships(
    graph: Map<BlockView, Set<BlockView>>,
    directBranches: Map<string, ConditionBranch>
): Map<BlockView, Map<BlockView, ConditionBranch>> {
    const result = new Map<BlockView, Map<BlockView, ConditionBranch>>();

    for (const block of graph.keys()) {
        if (!allowedBlockTypesSet.has(block.id)) {
            continue;
        }

        const collapsedChildren = new Map<BlockView, ConditionBranch>();
        const directChildren = graph.get(block);
        if (directChildren) {
            for (const child of directChildren) {
                const branch = directBranches.get(getBlockEdgeKey(block, child)) ?? null;
                collectCollapsedChildren(child, graph, branch, collapsedChildren);
            }
        }

        result.set(block, collapsedChildren);
    }

    return result;
}

/**
 * Calculate tag layout for a SizedNode instance in place.
 * @param sizedNode A layout node which has a defined size.
 */
function calculateTagsLayout(sizedNode: SizedNode): void {
    const resolvedTags = sizedNode.tags;
    const tagsWithLayout : TagWithLayout[] = [];

    let currY = sizedNode.propertiesTopY + propertiesVerticalPadding;
    for (const [index, tag] of resolvedTags.entries()) {
        const fontMeasurements = tagFont.measure(tag.name);
        const fontWidth = fontMeasurements.width;
        const fontHeight = fontMeasurements.ascent + fontMeasurements.descent
        const tagWidth = fontWidth + tagHorizontalPadding * 2;
        let tagX = propertiesHorizontalPadding ;

        if (index > 0) {
            const lastIndex = index - 1;
            tagX = tagsWithLayout[lastIndex].x + tagsWithLayout[lastIndex].width + tagHorizontalSpace;
        }

        // Wrap the tag to the next line if row exceeds the width of the container.
        // Don't wrap if is the only tag in the row.
        if (tagX + tagWidth > sizedNode.width - propertiesHorizontalPadding &&
            (index > 0 && tagsWithLayout[index - 1].y == currY)
        ) {
            tagX = propertiesHorizontalPadding;
            currY += tagHeight + tagVerticalSpace;
        }

        tagsWithLayout.push({
            ...tag,
            width: tagWidth,
            x: tagX,
            y: currY,
            textY: currY + tagHeight / 2 + fontHeight / 2
        });
    }

    sizedNode.tags = tagsWithLayout;
}

/**
 * Get the total height of tag rows for a SizedNode.
 * @param sizedNode A SizedNode instance whose tag layouts have already been calculated.
 */
function getTagsHeight(sizedNode: SizedNode): number {
    const uniqueYs = new Set(sizedNode.tags.map(t => t.y)); // Each unique Y value represents a row of tags.
    return uniqueYs.size * tagHeight + Math.max(0, uniqueYs.size - 1) * tagVerticalSpace;
}

/**
 * Build a presentation-only graph from the current canvas blocks and connections.
 * @returns Presentation graph containing allowed nodes and collapsed edges.
 */
function createPresentationGraph(): PresentationGraph {
    const allNodes = new Set<BlockView>(app.activeEditor.file.canvas.blocks);
    const allLines = new Set<LineView>(app.activeEditor.file.canvas.lines);
    const { graph } = buildGraph(allNodes, allLines);
    const directBranches = new Map<string, ConditionBranch>();
    for (const line of app.activeEditor.file.canvas.lines) {
        const sourceBlock = line.source.anchor?.parent;
        const targetBlock = line.target.anchor?.parent;
        if (!(sourceBlock instanceof BlockView) || !(targetBlock instanceof BlockView)) {
            continue;
        }

        const edgeKey = getBlockEdgeKey(sourceBlock, targetBlock);
        const branch = getConditionBranch(line.source.anchor?.instance ?? null, sourceBlock);
        directBranches.set(edgeKey, mergeConditionBranch(directBranches.get(edgeKey), branch));
    }

    const collapsedGraph = collapseDisallowedRelationships(graph, directBranches);

    const nodes = new Map<string, PresentationNode>();
    const edges = new Map<string, PresentationEdge>();

    for (const block of collapsedGraph.keys()) {
        nodes.set(block.instance, {
            id: block.instance,
            type: block.id as AllowedBlockType,
            name: getBlockName(block),
            // Initialize tag layout fields for later calculation.
            tags: resolveSelectedTags(block).map(tag => { return {...tag, width: 0, x: 0, y: 0, textY: 0}}),
            parentIds: [],
            childIds: []
        });
    }

    for (const [sourceBlock, collapsedChildren] of collapsedGraph) {
        const sourceNode = nodes.get(sourceBlock.instance);
        if (!sourceNode) {
            continue;
        }

        for (const [targetBlock, branch] of collapsedChildren) {
            const targetNode = nodes.get(targetBlock.instance);
            if (!targetNode) {
                continue;
            }

            const edgeId = `${sourceNode.id}->${targetNode.id}`;
            if (edges.has(edgeId)) {
                continue;
            }

            edges.set(edgeId, {
                id: edgeId,
                sourceId: sourceNode.id,
                targetId: targetNode.id,
                branch
            });

            if (!sourceNode.childIds.includes(targetNode.id)) {
                sourceNode.childIds.push(targetNode.id);
            }
            if (!targetNode.parentIds.includes(sourceNode.id)) {
                targetNode.parentIds.push(sourceNode.id);
            }
        }
    }

    return {
        nodes: [...nodes.values()].sort(comparePresentationNodes),
        edges: [...edges.values()]
    };
}

/**
 * Resolve whether a line leaves a condition block on the true branch, false branch, or neither.
 * @param anchorInstance Source anchor instance from the line.
 * @param block Source block for the line.
 * @returns `true`, `false`, or `null` depending on the condition branch used.
 */
function getConditionBranch(anchorInstance: string | null, block: BlockView): ConditionBranch {
    if (block.id !== "condition" || !anchorInstance) {
        return null;
    }

    for (const [anchorKey, anchor] of block.anchors) {
        if (anchor.instance !== anchorInstance) {
            continue;
        }
        if (anchorKey === "branch:True") {
            return true;
        }
        if (anchorKey === "branch:False") {
            return false;
        }
    }

    return null;
}

/**
 * Measure, wrap, route, and normalize the graph into a renderable SVG layout.
 * @param graph Presentation graph to lay out.
 * @param width Target layout width.
 * @returns Final SVG layout data ready for rendering.
 */
function buildSvgLayout(graph: PresentationGraph, width: number): SvgLayout {
    const components = getComponents(graph);
    const componentLayouts = components.map(component => buildConnectedComponentLayout(component, width));
    const stackedNodes: RenderedNode[] = [];
    const stackedEdges: EdgeGeometry[] = [];
    let totalHeight = 0;
    let totalWidth = Math.max(width, minDiagramWidth);

    componentLayouts.forEach((layout, index) => {
        const offsetY = totalHeight;
        stackedNodes.push(...layout.nodes.map(node => ({
            ...node,
            y: node.y + offsetY
        })));
        stackedEdges.push(...layout.edges.map(edge => ({
            ...edge,
            points: edge.points.map(point => ({
                x: point.x,
                y: point.y + offsetY
            }))
        })));

        totalWidth = Math.max(totalWidth, layout.width);
        totalHeight += layout.height;
        if (index < componentLayouts.length - 1) {
            totalHeight += componentGap;
        }
    });

    return {
        width: totalWidth,
        height: totalHeight,
        nodes: stackedNodes,
        edges: serializeEdges(stackedEdges)
    };
}

/**
 * Return the graph as separately renderable components.
 * @param graph Presentation graph to split.
 * @returns List of disconnected graph components.
 */
function getComponents(graph: PresentationGraph): PresentationGraph[] {
    const nodeById = new Map(graph.nodes.map(node => [node.id, node]));
    const visited = new Set<string>();
    const components: PresentationGraph[] = [];

    for (const startNode of [...graph.nodes].sort(comparePresentationNodes)) {
        if (visited.has(startNode.id)) {
            continue;
        }

        const componentNodeIds = new Set<string>();
        const queue = [startNode.id];
        visited.add(startNode.id);

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            componentNodeIds.add(nodeId);
            const node = nodeById.get(nodeId);
            if (!node) {
                continue;
            }

            for (const neighborId of [...node.parentIds, ...node.childIds]) {
                if (visited.has(neighborId) || !nodeById.has(neighborId)) {
                    continue;
                }
                visited.add(neighborId);
                queue.push(neighborId);
            }
        }

        components.push({
            nodes: [...componentNodeIds]
                .map(id => nodeById.get(id)!)
                .sort(comparePresentationNodes),
            edges: graph.edges.filter(edge => componentNodeIds.has(edge.sourceId) && componentNodeIds.has(edge.targetId))
        });
    }

    return components;
}

/**
 * Lay out one graph component using the existing horizontal flow and row wrapping rules.
 * @param graph Graph component to lay out.
 * @param width Target layout width.
 * @returns Intermediate layout result for the component.
 */
function buildConnectedComponentLayout(graph: PresentationGraph, width: number): ComponentLayout {
    const sizedNodes = sizeNodes(graph.nodes, width);
    const nodeMap = new Map(sizedNodes.map(node => [node.id, node]));
    const levels = assignLevels(sizedNodes);
    const orderedColumns = buildColumns(sizedNodes, levels, nodeMap);
    const availableWidth = Math.max(
        width - (horizontalPadding * 2) - responsiveRightReserve,
        minDiagramWidth - (horizontalPadding * 2) - responsiveRightReserve
    );
    const rows = wrapColumnsIntoRows(orderedColumns, availableWidth, horizontalPadding);
    const initialNodes = positionNodes(rows);
    const initialNodeMap = new Map(initialNodes.map(node => [node.id, node]));
    const initialEdges = routeEdges(graph.edges, initialNodeMap, rows);
    const { shiftedNodes, shiftedEdges, maxX, maxY } = normalizeLayout(initialNodes, initialEdges);
    const totalWidth = Math.max(width, maxX + horizontalPadding + renderEdgePadding);
    const totalHeight = maxY + verticalPadding + renderEdgePadding;

    return {
        width: totalWidth,
        height: totalHeight,
        nodes: shiftedNodes,
        edges: shiftedEdges
    };
}

/**
 * Estimate node dimensions from block labels and block type.
 * @param nodes Nodes to measure.
 * @param container Width budget used to estimate label wrapping.
 * @returns Sized node data with wrapped labels and dimensions.
 */
function sizeNodes(nodes: PresentationNode[], container: number): SizedNode[] {
    const labelBudget = Math.max(16, Math.floor((container - 120) / 26));

    return nodes.map(node => {
        let sizedNode : SizedNode;

        if (node.type === "AND_operator" || node.type === "OR_operator") {
            const lines = [node.type === "AND_operator" ? "AND" : "OR"];
            sizedNode = {
                ...node,
                lines,
                width: 84,
                height: 84,
                propertiesTopY: 84,
            };
        } else  {
            const maxCharsPerLine = Math.max(12, Math.min(30, labelBudget));
            const lines = wrapLabel(node.name, maxCharsPerLine);
            const widestLine = Math.max(...lines.map(line => estimateLineWidth(line)), 48);

            if (node.type === "condition") {
                const height = Math.max(104, lines.length * lineHeight + (labelPaddingY * 2));
                sizedNode = {
                    ...node,
                    lines,
                    width: Math.max(156, widestLine + (labelPaddingX * 2) + conditionBadgePaddingRight),
                    height,
                    propertiesTopY: height,
                };
            } else {
                const height = Math.max(76, lines.length * lineHeight + (labelPaddingY * 2))
                sizedNode = {
                    ...node,
                    lines,
                    width: Math.max(164, widestLine + (labelPaddingX * 2)),
                    height,
                    propertiesTopY: height,
                };
            }

            if (showTags.value && sizedNode.tags.length) {
                // Call calculateTagsLayout after width has been calculated above.
                calculateTagsLayout(sizedNode);
                const tagsHeight = getTagsHeight(sizedNode);
                // Calculate properties height after tags layout has been calculated and add
                // to total height.
                const propertiesHeight = tagsHeight + propertiesVerticalPadding * 2;
                sizedNode.height += propertiesHeight;
            }
            
        }

        return sizedNode;
    });
}

/**
 * Assign each node to a left-to-right column based on graph depth.
 * @param nodes Sized nodes to levelize.
 * @returns Map of node id to assigned level.
 */
function assignLevels(nodes: SizedNode[]): Map<string, number> {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const inDegree = new Map(nodes.map(node => [node.id, node.parentIds.length]));
    const levels = new Map<string, number>();
    const queue = [...nodes]
        .filter(node => node.parentIds.length === 0)
        .sort(comparePresentationNodes);

    while (queue.length > 0) {
        const node = queue.shift()!;
        const nodeLevel = levels.get(node.id) ?? 0;

        for (const childId of node.childIds) {
            const child = nodeMap.get(childId);
            if (!child) {
                continue;
            }

            levels.set(child.id, Math.max(levels.get(child.id) ?? 0, nodeLevel + 1));
            const nextDegree = (inDegree.get(child.id) ?? 0) - 1;
            inDegree.set(child.id, nextDegree);
            if (nextDegree === 0) {
                queue.push(child);
            }
        }

        queue.sort(comparePresentationNodes);
    }

    const assignedIds = new Set(levels.keys());
    for (const node of nodes) {
        if (!assignedIds.has(node.id) && node.parentIds.length === 0) {
            levels.set(node.id, 0);
        }
    }

    for (const node of nodes) {
        if (!levels.has(node.id)) {
            const parentLevels = node.parentIds.map(id => levels.get(id) ?? 0);
            levels.set(node.id, parentLevels.length > 0 ? Math.max(...parentLevels) + 1 : 0);
        }
    }

    return levels;
}

/**
 * Group nodes by level and order them into render columns.
 * @param nodes Sized nodes to place into columns.
 * @param levels Map of node ids to levels.
 * @param nodeMap Lookup map for node metadata.
 * @returns Ordered column layouts.
 */
function buildColumns(
    nodes: SizedNode[],
    levels: Map<string, number>,
    nodeMap: Map<string, SizedNode>
): ColumnLayout[] {
    const grouped = new Map<number, SizedNode[]>();

    for (const node of nodes) {
        const level = levels.get(node.id) ?? 0;
        if (!grouped.has(level)) {
            grouped.set(level, []);
        }
        grouped.get(level)!.push(node);
    }

    const orderByNodeId = new Map<string, number>();
    const columns: ColumnLayout[] = [];
    const sortedLevels = [...grouped.keys()].sort((left, right) => left - right);

    for (const level of sortedLevels) {
        const levelNodes = grouped.get(level)!;
        levelNodes.sort((left, right) => {
            const leftScore = averageParentOrder(left, orderByNodeId, nodeMap);
            const rightScore = averageParentOrder(right, orderByNodeId, nodeMap);
            return leftScore - rightScore || comparePresentationNodes(left, right);
        });

        levelNodes.forEach((node, index) => {
            orderByNodeId.set(node.id, index);
        });

        columns.push({
            level,
            nodes: levelNodes,
            width: Math.max(...levelNodes.map(node => node.width)),
            height: levelNodes.reduce((total, node, index) => total + node.height + (index > 0 ? nodeGap : 0), 0)
        });
    }

    return columns;
}

/**
 * Score a node by the average order of its already-placed parents.
 * @param node Node to score.
 * @param orderByNodeId Map of prior node ordering.
 * @param nodeMap Lookup map for node metadata.
 * @returns Average parent order score, or `Infinity` when there are no parents to compare.
 */
function averageParentOrder(
    node: SizedNode,
    orderByNodeId: Map<string, number>,
    nodeMap: Map<string, SizedNode>
): number {
    const parentOrders = node.parentIds
        .filter(id => nodeMap.has(id))
        .map(id => orderByNodeId.get(id))
        .filter((value): value is number => value !== undefined);

    if (parentOrders.length === 0) {
        return Number.POSITIVE_INFINITY;
    }

    return parentOrders.reduce((sum, value) => sum + value, 0) / parentOrders.length;
}

/**
 * Wrap columns into horizontal rows that fit within the available width.
 * @param columns Ordered columns to wrap.
 * @param availableWidth Width budget for a single row.
 * @param leftInset Left inset for each row.
 * @returns Wrapped row layouts.
 */
function wrapColumnsIntoRows(columns: ColumnLayout[], availableWidth: number, leftInset: number): RowLayout[] {
    const rows: RowLayout[] = [];
    let currentColumns: ColumnLayout[] = [];
    let currentWidth = 0;

    for (const column of columns) {
        const nextWidth = currentColumns.length === 0
            ? column.width
            : currentWidth + columnGap + column.width;

        if (currentColumns.length > 0 && nextWidth > availableWidth) {
            rows.push(createRowLayout(rows.length, currentColumns, availableWidth, leftInset));
            currentColumns = [];
            currentWidth = 0;
        }

        currentColumns.push(column);
        currentWidth = currentColumns.length === 1 ? column.width : currentWidth + columnGap + column.width;
    }

    if (currentColumns.length > 0) {
        rows.push(createRowLayout(rows.length, currentColumns, availableWidth, leftInset));
    }

    let currentTop = verticalPadding;
    for (const row of rows) {
        row.top = currentTop;
        currentTop += row.height + rowGap;
    }

    return rows;
}

/**
 * Create the initial metadata object for a wrapped row of columns.
 * @param index Row index.
 * @param columns Columns assigned to the row.
 * @param availableWidth Width budget available for row content.
 * @param leftInset Left inset for the row container.
 * @returns Row layout shell before final positioning.
 */
function createRowLayout(
    index: number,
    columns: ColumnLayout[],
    availableWidth: number,
    leftInset: number
): RowLayout {
    const contentWidth = columns.reduce(
        (total, column, columnIndex) => total + column.width + (columnIndex > 0 ? columnGap : 0),
        0
    );
    const direction = getRowDirection(index);
    const left = direction === "ltr"
        ? leftInset
        : leftInset + Math.max(0, availableWidth - contentWidth);

    return {
        index,
        direction,
        columns,
        left,
        right: left + contentWidth,
        top: verticalPadding,
        height: Math.max(...columns.map(column => column.height))
    };
}

/**
 * Convert wrapped rows and columns into concrete node positions.
 * @param rows Wrapped row layouts to position.
 * @returns Rendered nodes with absolute coordinates.
 */
function positionNodes(rows: RowLayout[]): RenderedNode[] {
    const rendered: RenderedNode[] = [];

    for (const row of rows) {
        let currentX = row.direction === "ltr" ? row.left : row.right;

        for (const column of row.columns) {
            const columnTop = row.top + ((row.height - column.height) / 2);
            const columnLeft = row.direction === "ltr"
                ? currentX
                : currentX - column.width;
            let currentY = columnTop;

            for (const node of column.nodes) {
                const nodeX = columnLeft + ((column.width - node.width) / 2);
                rendered.push({
                    ...node,
                    x: nodeX,
                    y: currentY,
                    row: row.index,
                    rowDirection: row.direction,
                    level: column.level,
                    lines: node.lines,
                    textY: computeTextY(node)
                });
                currentY += node.height + nodeGap;
            }

            currentX += row.direction === "ltr"
                ? column.width + columnGap
                : -(column.width + columnGap);
        }
    }

    return rendered;
}

/**
 * Build routed edge geometry for every visible graph connection.
 * @param edges Presentation edges to route.
 * @param nodeMap Lookup map for rendered node positions.
 * @param rows Wrapped row layouts used for routing decisions.
 * @returns Raw edge geometries for all routable edges.
 */
function routeEdges(
    edges: PresentationEdge[],
    nodeMap: Map<string, RenderedNode>,
    rows: RowLayout[]
): EdgeGeometry[] {
    const parallelEdgeCounts = new Map<string, number>();

    return edges.flatMap(edge => {
        const source = nodeMap.get(edge.sourceId);
        const target = nodeMap.get(edge.targetId);
        if (!source || !target) {
            return [];
        }

        const edgeGroupKey = `${Math.min(source.row, target.row)}:${Math.max(source.row, target.row)}`;
        const parallelEdgeIndex = parallelEdgeCounts.get(edgeGroupKey) ?? 0;
        parallelEdgeCounts.set(edgeGroupKey, parallelEdgeIndex + 1);

        return [{
            id: edge.id,
            points: simplifyOrthogonalPoints(buildEdgeGeometry(edge, source, target, rows, parallelEdgeIndex))
        }];
    });
}

/**
 * Build the polyline points for one edge between two rendered nodes.
 * @param edge Edge metadata, including any true/false branch assignment.
 * @param source Source node.
 * @param target Target node.
 * @param rows Wrapped row layout metadata.
 * @param parallelEdgeIndex Small integer used to separate cross-row edges so they do not stack on exactly the same route.
 * @returns Ordered SVG points for the rendered edge path.
 */
function buildEdgeGeometry(
    edge: PresentationEdge,
    source: RenderedNode,
    target: RenderedNode,
    rows: RowLayout[],
    parallelEdgeIndex: number
): Array<{ x: number; y: number }> {
    const sourceRow = rows[source.row]!;
    const targetRow = rows[target.row]!;
    const sourceAnchor = getSourceAnchorPoint(source, sourceRow.direction, edge.branch);
    const targetAnchor = getTargetAnchorPoint(target, targetRow.direction);
    const sourceX = sourceAnchor.x;
    const sourceY = sourceAnchor.y;
    const targetX = targetAnchor.x;
    const targetY = targetAnchor.y;
    const sourceStubX = sourceX + (getExitDirection(sourceRow.direction) * edgeStub);
    const targetStubX = targetX - (getEntryDirection(targetRow.direction) * edgeStub);
    let points: Array<{ x: number; y: number }>;

    if (source.row === target.row && isForwardInRow(source, target, sourceRow.direction)) {
        const midX = sourceRow.direction === "ltr"
            ? Math.max(sourceStubX, (sourceX + targetX) / 2)
            : Math.min(sourceStubX, (sourceX + targetX) / 2);
        points = [
            { x: sourceX, y: sourceY },
            { x: sourceStubX, y: sourceY },
            { x: midX, y: sourceY },
            { x: midX, y: targetY },
            { x: targetStubX, y: targetY },
            { x: targetX, y: targetY }
        ];
    } else if (source.row === target.row) {
        const routeY = sourceRow.top - (rowGap / 2) - (parallelEdgeIndex * crossRowEdgeGap);
        const seamX = getWrapSeamX(sourceRow, targetRow, parallelEdgeIndex);

        points = [
            { x: sourceX, y: sourceY },
            { x: sourceStubX, y: sourceY },
            { x: seamX, y: sourceY },
            { x: seamX, y: routeY },
            { x: targetStubX, y: routeY },
            { x: targetStubX, y: targetY },
            { x: targetX, y: targetY }
        ];
    } else {
        const upperRow = Math.min(source.row, target.row);
        const lowerRow = Math.max(source.row, target.row);
        const exitRow = rows[upperRow]!;
        const entryRow = rows[lowerRow]!;
        const parallelEdgeOffset = parallelEdgeIndex * crossRowEdgeGap;
        const routeY = entryRow.top - (rowGap / 2) + parallelEdgeOffset;
        const seamX = getWrapSeamX(exitRow, entryRow, parallelEdgeIndex);

        points = [
            { x: sourceX, y: sourceY },
            { x: sourceStubX, y: sourceY },
            { x: seamX, y: sourceY },
            { x: seamX, y: routeY },
            { x: targetStubX, y: routeY },
            { x: targetStubX, y: targetY },
            { x: targetX, y: targetY }
        ];
    }

    return points;
}

/**
 * Resolve the source anchor point for an edge, including true/false badges on condition blocks.
 * @param source Source node.
 * @param branch Branch metadata for the edge.
 * @returns Absolute source anchor coordinates.
 */
function getSourceAnchorPoint(
    source: RenderedNode,
    rowDirection: RowDirection,
    branch: ConditionBranch
): { x: number; y: number } {
    if (source.type === "condition") {
        if (branch === true) {
            return {
                x: rowDirection === "ltr"
                    ? source.x + source.width + conditionBadgeRadius
                    : source.x - conditionBadgeRadius,
                y: source.y + getConditionBadgeY(source.height, true)
            };
        }

        if (branch === false) {
            return {
                x: rowDirection === "ltr"
                    ? source.x + source.width + conditionBadgeRadius
                    : source.x - conditionBadgeRadius,
                y: source.y + getConditionBadgeY(source.height, false)
            };
        }
    }

    return {
        x: rowDirection === "ltr" ? source.x + source.width : source.x,
        y: source.y + (source.height / 2)
    };
}

/**
 * Resolve the target anchor point for an edge based on the row flow direction.
 * @param target Target node.
 * @param rowDirection Flow direction of the target row.
 * @returns Absolute target anchor coordinates.
 */
function getTargetAnchorPoint(
    target: RenderedNode,
    rowDirection: RowDirection
): { x: number; y: number } {
    return {
        x: rowDirection === "ltr" ? target.x : target.x + target.width,
        y: target.y + (target.height / 2)
    };
}

/**
 * Return the horizontal flow direction used by a wrapped row.
 * @param rowIndex Row index in the wrapped layout.
 * @returns `ltr` for even rows and `rtl` for odd rows.
 */
function getRowDirection(rowIndex: number): RowDirection {
    return rowIndex % 2 === 0 ? "ltr" : "rtl";
}

/**
 * Determine whether an edge moves forward within its row.
 * @param source Source node.
 * @param target Target node.
 * @param rowDirection Flow direction of the shared row.
 * @returns Whether the edge follows the underlying topological progression.
 */
function isForwardInRow(
    source: RenderedNode,
    target: RenderedNode,
    rowDirection: RowDirection
): boolean {
    void rowDirection;
    return source.level <= target.level;
}

/**
 * Resolve the unit horizontal direction used when an edge exits a node.
 * @param rowDirection Flow direction of the source row.
 * @returns `1` for rightward exit and `-1` for leftward exit.
 */
function getExitDirection(rowDirection: RowDirection): number {
    return rowDirection === "ltr" ? 1 : -1;
}

/**
 * Resolve the unit horizontal direction used when an edge enters a node.
 * @param rowDirection Flow direction of the target row.
 * @returns `1` for rightward-facing entry and `-1` for leftward-facing entry.
 */
function getEntryDirection(rowDirection: RowDirection): number {
    return rowDirection === "ltr" ? 1 : -1;
}

/**
 * Return the shared outer routing x coordinate used for a wrapped transition.
 * @param sourceRow Source-side row for the transition.
 * @param targetRow Target-side row for the transition.
 * @param parallelEdgeIndex Small index used to separate parallel routes.
 * @returns Absolute x coordinate for the shared wrap seam.
 */
function getWrapSeamX(
    sourceRow: RowLayout,
    targetRow: RowLayout,
    parallelEdgeIndex: number
): number {
    const offset = parallelEdgeIndex * crossRowEdgeGap;
    const seamOnRight = sourceRow.index === targetRow.index
        ? sourceRow.direction === "ltr"
        : sourceRow.direction === "ltr" && targetRow.direction === "rtl";

    const rightEdge = Math.max(sourceRow.right, targetRow.right);
    const leftEdge = Math.min(sourceRow.left, targetRow.left);

    return seamOnRight
        ? rightEdge + wrapGutter + offset
        : leftEdge - wrapGutter - offset;
}

/**
 * Compute the vertical centerline of the true or false badge within a condition block.
 * @param height Condition block height.
 * @param branch `true` for the upper badge, `false` for the lower badge.
 * @returns Badge centerline y position relative to the block.
 */
function getConditionBadgeY(height: number, branch: boolean): number {
    const centerY = height / 2;
    const offset = height * conditionBadgeOffset;
    return branch ? centerY - offset : centerY + offset;
}

/**
 * Compute the horizontal centerline of a condition badge within the node.
 * @param node Condition node being rendered.
 * @returns Badge centerline x position relative to the node.
 */
function getConditionBadgeX(node: RenderedNode): number {
    return node.rowDirection === "ltr" ? node.width : 0;
}

/**
 * Shift the layout right when needed so the rendered content keeps a safe left inset.
 * @param nodes Rendered nodes before normalization.
 * @param edges Routed edge geometry before normalization.
 * @returns Shifted nodes, shifted edges, and final bounds metadata.
 */
function normalizeLayout(
    nodes: RenderedNode[],
    edges: EdgeGeometry[]
): {
    shiftedNodes: RenderedNode[];
    shiftedEdges: EdgeGeometry[];
    minX: number;
    maxX: number;
    maxY: number;
} {
    const nodeMinX = Math.min(...nodes.map(node => node.x), horizontalPadding);
    const nodeMaxX = Math.max(...nodes.map(node => node.x + node.width), horizontalPadding);
    const nodeMaxY = Math.max(...nodes.map(node => node.y + node.height), verticalPadding);
    const edgeXs = edges.flatMap(edge => edge.points.map(point => point.x));
    const edgeYs = edges.flatMap(edge => edge.points.map(point => point.y));
    const rawMinX = Math.min(nodeMinX, ...(edgeXs.length > 0 ? edgeXs : [horizontalPadding]));
    const rawMaxX = Math.max(nodeMaxX, ...(edgeXs.length > 0 ? edgeXs : [horizontalPadding]));
    const rawMaxY = Math.max(nodeMaxY, ...(edgeYs.length > 0 ? edgeYs : [verticalPadding]));
    const minimumRenderableX = horizontalPadding + renderEdgePadding;
    const shiftX = rawMinX < minimumRenderableX ? minimumRenderableX - rawMinX : 0;

    const shiftedNodes = nodes.map(node => ({
        ...node,
        x: node.x + shiftX
    }));

    const shiftedEdges = edges.map(edge => ({
        ...edge,
        points: edge.points.map(point => ({
            x: point.x + shiftX,
            y: point.y
        }))
    }));

    return {
        shiftedNodes,
        shiftedEdges,
        minX: rawMinX + shiftX,
        maxX: rawMaxX + shiftX,
        maxY: rawMaxY
    };
}

/**
 * Convert raw edge geometry into SVG path and arrowhead strings.
 * @param edges Raw edge geometry.
 * @returns Serialized SVG edge data.
 */
function serializeEdges(edges: EdgeGeometry[]): RenderedEdge[] {
    return edges.map(edge => ({
        id: edge.id,
        path: pathFromPoints(edge.points),
        arrowPoints: buildArrowHead(edge.points[edge.points.length - 2]!, edge.points[edge.points.length - 1]!)
    }));
}

/**
 * Convert an ordered list of points into an SVG path string.
 * @param points Ordered polyline points.
 * @returns SVG path data string.
 */
function pathFromPoints(points: Array<{ x: number; y: number }>): string {
    return points.reduce((path, point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${path}${index === 0 ? "" : " "}${command} ${point.x} ${point.y}`;
    }, "");
}

/**
 * Build the SVG polygon string for an arrowhead.
 * @param from The point just before the arrow tip on the line segment. Defines the direction the arrow comes from.
 * @param to The location of the tip of the arrowhead.
 * @returns Polygon-ready string with arrowhead coordinates.
 */
function buildArrowHead(
    from: { x: number; y: number },
    to: { x: number; y: number }
): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const arrowLength = 10;
    const arrowWidth = 5;
    const baseX = to.x - (ux * arrowLength);
    const baseY = to.y - (uy * arrowLength);
    const perpX = -uy;
    const perpY = ux;
    const leftX = baseX + (perpX * arrowWidth);
    const leftY = baseY + (perpY * arrowWidth);
    const rightX = baseX - (perpX * arrowWidth);
    const rightY = baseY - (perpY * arrowWidth);

    return `${to.x},${to.y} ${leftX},${leftY} ${rightX},${rightY}`;
}

/**
 * Remove redundant points and tiny bridged vertical lane splits from an orthogonal edge path.
 * @param points Raw orthogonal polyline points.
 * @returns Simplified orthogonal point list.
 */
function simplifyOrthogonalPoints(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    let simplified = removeDuplicatePoints(points);
    simplified = removeCollinearPoints(simplified);
    simplified = mergeVerticalLanes(simplified);
    simplified = removeDuplicatePoints(simplified);
    simplified = removeCollinearPoints(simplified);
    return simplified;
}

/**
 * Determine whether two coordinate values should be treated as equal during edge cleanup.
 * @param left First numeric value.
 * @param right Second numeric value.
 * @returns Whether the values are equal within the configured tolerance.
 */
function nearlyEqual(left: number, right: number): boolean {
    return Math.abs(left - right) <= edgeCoordinateEpsilon;
}

/**
 * Determine whether a segment should be treated as horizontal during cleanup.
 * @param from Segment start point.
 * @param to Segment end point.
 * @returns Whether the segment is horizontally aligned within tolerance.
 */
function isHorizontalSegment(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    return nearlyEqual(from.y, to.y);
}

/**
 * Determine whether a segment should be treated as vertical during cleanup.
 * @param from Segment start point.
 * @param to Segment end point.
 * @returns Whether the segment is vertically aligned within tolerance.
 */
function isVerticalSegment(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    return nearlyEqual(from.x, to.x);
}

/**
 * Remove consecutive duplicate points from a polyline.
 * @param points Input polyline points.
 * @returns Polyline without consecutive duplicates.
 */
function removeDuplicatePoints(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    if (points.length <= 1) {
        return points;
    }

    const deduped = [points[0]!];
    for (let index = 1; index < points.length; index += 1) {
        const point = points[index]!;
        const previous = deduped[deduped.length - 1]!;
        if (nearlyEqual(point.x, previous.x) && nearlyEqual(point.y, previous.y)) {
            continue;
        }
        deduped.push(point);
    }
    return deduped;
}

/**
 * Remove middle points that lie on the same horizontal or vertical segment.
 * @param points Input orthogonal polyline points.
 * @returns Polyline without redundant collinear middle points.
 */
function removeCollinearPoints(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    if (points.length <= 2) {
        return points;
    }

    const simplified = [points[0]!];
    for (let index = 1; index < points.length - 1; index += 1) {
        const previous = simplified[simplified.length - 1]!;
        const current = points[index]!;
        const next = points[index + 1]!;
        const sameX = nearlyEqual(previous.x, current.x) && nearlyEqual(current.x, next.x);
        const sameY = nearlyEqual(previous.y, current.y) && nearlyEqual(current.y, next.y);
        if (sameX || sameY) {
            continue;
        }
        simplified.push(current);
    }
    simplified.push(points[points.length - 1]!);
    return simplified;
}

/**
 * Merge two nearby vertical routing lanes when they are joined by a short horizontal bridge
 * and bounded by horizontal segments on both sides.
 * @param points Input orthogonal polyline points.
 * @returns Polyline with eligible vertical lane splits collapsed onto a single averaged lane.
 */
function mergeVerticalLanes(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    if (points.length <= 5) {
        return points;
    }

    const simplified = [...points];
    let changed = true;

    while (changed) {
        changed = false;

        for (let index = 0; index <= simplified.length - 6; index += 1) {
            const a = simplified[index]!;
            const b = simplified[index + 1]!;
            const c = simplified[index + 2]!;
            const d = simplified[index + 3]!;
            const e = simplified[index + 4]!;
            const f = simplified[index + 5]!;

            const abHorizontal = isHorizontalSegment(a, b);
            const bcVertical = isVerticalSegment(b, c);
            const cdHorizontal = isHorizontalSegment(c, d);
            const deVertical = isVerticalSegment(d, e);
            const efHorizontal = isHorizontalSegment(e, f);

            if (!(abHorizontal && bcVertical && cdHorizontal && deVertical && efHorizontal)) {
                continue;
            }

            const bridgeLength = Math.abs(d.x - c.x);

            if (bridgeLength >= laneMergeThreshold) {
                continue;
            }

            const firstVerticalLength = Math.abs(c.y - b.y);
            const secondVerticalLength = Math.abs(e.y - d.y);
            if (firstVerticalLength <= edgeCoordinateEpsilon || secondVerticalLength <= edgeCoordinateEpsilon) {
                continue;
            }

            const firstDirection = Math.sign(c.y - b.y);
            const secondDirection = Math.sign(e.y - d.y);
            if (firstDirection === 0 || secondDirection === 0 || firstDirection !== secondDirection) {
                continue;
            }

            const mergedX = (c.x + d.x) / 2;
            simplified.splice(
                index + 1,
                4,
                { x: mergedX, y: b.y },
                { x: mergedX, y: e.y }
            );
            changed = true;
            break;
        }
    }

    return simplified;
}

/**
 * Wrap a node label into a limited number of display lines.
 * @param label Label text to wrap.
 * @param maxCharsPerLine Approximate character budget per line.
 * @returns Wrapped and possibly truncated label lines.
 */
function wrapLabel(label: string, maxCharsPerLine: number): string[] {
    const words = label.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
        return [label];
    }

    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length <= maxCharsPerLine || currentLine.length === 0) {
            currentLine = candidate;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }

        if (lines.length === maxLabelLines - 1 && currentLine.length > maxCharsPerLine) {
            break;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    if (lines.length > maxLabelLines) {
        lines.length = maxLabelLines;
    }

    const lastIndex = lines.length - 1;
    if (words.join(" ").length > lines.join(" ").length && lastIndex >= 0) {
        lines[lastIndex] = `${trimToLength(lines[lastIndex]!, Math.max(4, maxCharsPerLine - 1))}…`;
    }

    return lines;
}

/**
 * Trim text to a maximum length without leaving trailing whitespace.
 * @param text Source text.
 * @param length Maximum output length.
 * @returns Trimmed text.
 */
function trimToLength(text: string, length: number): string {
    return text.length <= length ? text : text.slice(0, Math.max(0, length)).trim();
}

/**
 * Approximate the rendered width of a single line of label text.
 * @param line Label line to measure.
 * @returns Estimated line width in pixels.
 */
function estimateLineWidth(line: string): number {
    return labelFont.measureWidth(line);
}

/**
 * Compute the baseline position needed to vertically center a multiline label.
 * @param node Sized node containing wrapped text.
 * @returns Baseline y coordinate relative to the node.
 */
function computeTextY(node: SizedNode): number {
    const totalTextHeight = (node.lines.length - 1) * lineHeight;
    return (((node.height - (node.height - node.propertiesTopY)) - totalTextHeight) / 2) + 5;
}

/**
 * Read the most useful display label from a block, with condition blocks preferring description.
 * @param block Block to label.
 * @returns Display name for the block.
 */
function getBlockName(block: BlockView): string {
    const propertyId = block.id === "condition" ? "description" : "name";
    const property = block.properties.get(propertyId);
    if (property?.isDefined()) {
        const value = property.toString().trim();
        if (value.length > 0 && value !== "None") {
            return value;
        }
    }

    return humanizeBlockType(block.id);
}

/**
 * Convert an internal block type id into a human-readable fallback label.
 * @param type Internal block type id.
 * @returns Human-readable fallback label.
 */
function humanizeBlockType(type: string): string {
    switch (type) {
        case "AND_operator":
            return "AND";
        case "OR_operator":
            return "OR";
        default:
            return type.replaceAll("_", " ");
    }
}

/**
 * Provide a stable sort order for presentation nodes.
 * @param left Left node-like value to compare.
 * @param right Right node-like value to compare.
 * @returns Negative, zero, or positive sort result.
 */
function comparePresentationNodes(left: Pick<PresentationNode, "id" | "name">, right: Pick<PresentationNode, "id" | "name">): number {
    return left.name.localeCompare(right.name) || left.id.localeCompare(right.id);
}

/**
 * Sync the tracked container width with the current shell element width.
 */
function updateContainerWidth() {
    containerWidth.value = Math.max(shell.value?.clientWidth ?? minDiagramWidth, minDiagramWidth);
}

onMounted(() => {
    updateContainerWidth();
    resizeObserver = new ResizeObserver(() => {
        updateContainerWidth();
    });
    if (shell.value) {
        resizeObserver.observe(shell.value);
    }
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
});
</script>

<style scoped>
.diagram-shell {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
    overflow: visible;
    position: relative;
}

.diagram-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 8px 8px;
    gap: 18px;
    background-color: var(--af-bg-color-tertiary);
    border: 1px solid var(--af-border-color-tertiary);
    position: sticky;
    top: 0;
}

.diagram-scale-control {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: var(--af-text-color-primary);
    font-size: 13px;
}

.diagram-scale-label,
.diagram-scale-value {
    white-space: nowrap;
}

.diagram-scale-value {
    display: inline-block;
    width: 3.5em;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.diagram-scale-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 160px;
    height: 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--af-text-color-secondary) 24%, transparent);
    cursor: pointer;
}

.diagram-scale-slider::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--af-text-color-secondary) 24%, transparent);
}

.diagram-scale-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -5px;
    border: 2px solid var(--af-background-color-primary);
    border-radius: 50%;
    background: var(--af-accent-color, #4f86ff);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
}

.diagram-scale-slider::-moz-range-track {
    height: 6px;
    border: none;
    border-radius: 999px;
    background: color-mix(in srgb, var(--af-text-color-secondary) 24%, transparent);
}

.diagram-scale-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: 2px solid var(--af-background-color-primary);
    border-radius: 50%;
    background: var(--af-accent-color, #4f86ff);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
}

.diagram-scale-slider:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--af-accent-color, #4f86ff) 60%, white);
    outline-offset: 4px;
}

.diagram-svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
}

.diagram-state {
    display: grid;
    place-items: center;
    min-height: 100%;
    padding: 24px;
    color: var(--af-text-color-secondary);
    font-size: 14px;
    box-sizing: border-box;
}

.diagram-control-label {
    display: flex;
    font-size: 13px;
    align-items: center;
    gap: 5px;
    color: var(--af-text-color-primary);
}

select {
    background: var(--af-bg-color-secondary);
    border: 1px solid var(--af-border-color-tertiary);
    border-radius: 3px;
    color: var(--af-text-color-primary);
    padding: 5px;
}

select:hover {
    cursor: pointer;
}

</style>
