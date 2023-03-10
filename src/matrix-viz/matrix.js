/*
 * This file is adapted from the Python attack_flow.matrix module so that we can generate similar Navigator
 * overlay graphics from the browser instead of the command line.
 */
const TACTIC_CLASS_RE = /tactic ([-a-z]+)/;
const TECHNIQUE_CLASS_RE = /(sub)?technique (T[.0-9]+)/;
const TRANSLATE_RE = /^translate\(([^,]+),\s*([^,]+)\)$/;
const OVERLAY_COLOR = "rgba(204, 0, 0, 0.75)";
const ELLIPSE_SIZE_MULTIPLIER = 0.6;
const LINE_BENDINESS = 0.15;
const ARROWHEAD_WIDTH = 7;
const ARROWHEAD_HEIGHT = 5;
const ARROW_OFFSET = 30;
const STROKE_WIDTH = 2;
const SHOW_CONTROL_POINTS = false; // for debugging, set to true

// Map tactic IDs to the CSS class that Navigator emits.
const TACTIC_LOOKUP = {
    // Enterprise
    "TA0043": "reconnaissance",
    "TA0042": "resource-development",
    "TA0001": "initial-access",
    "TA0002": "execution",
    "TA0003": "persistence",
    "TA0004": "privilege-sscalation",
    "TA0005": "defense-evasion",
    "TA0006": "credential-access",
    "TA0007": "discovery",
    "TA0008": "lateral-movement",
    "TA0009": "collection",
    "TA0011": "command-and-control",
    "TA0010": "exfiltration",
    "TA0040": "impact",
    // Mobile:
    "TA0027": "initial-access",
    "TA0041": "execution",
    "TA0028": "persistence",
    "TA0029": "privilege-escalation",
    "TA0030": "defense-evasion",
    "TA0031": "credential-access",
    "TA0032": "discovery",
    "TA0033": "lateral-movement",
    "TA0035": "collection",
    "TA0037": "command-and-control",
    "TA0036": "exfiltration",
    "TA0034": "impact",
    "TA0038": "network-effects",
    "TA0039": "remote-service-effects",
    // ICS:
    "TA0108": "initial-access",
    "TA0104": "execution",
    "TA0110": "persistence",
    "TA0111": "privilege-sscalation",
    "TA0103": "evasion",
    "TA0102": "discovery",
    "TA0109": "lateral-movement",
    "TA0100": "collection",
    "TA0101": "command-and-control",
    "TA0107": "inhibit-response-function",
    "TA0106": "impair-process-control",
    "TA0105": "impact",
}

/**
 * Render an SVG with the flow drawn on top of a given ATT&CK Navigator layer.
 * @param {*} svgXml
 * @param {*} flowBundle
 */
function render(svgXml, flowStix) {
    const domParser = new DOMParser();
    const svgDoc = domParser.parseFromString(svgXml, "application/xml");

    // Build a lookup table from technique ID -> translation coordinates for that technique's <g> element.
    const techniqueGeometries = {};
    _enumerateTechniqueGeometries(techniqueGeometries, svgDoc.children[0]);

    // Create a new <g> to hold all of the Attack Flow overlay elements.
    const attackFlowOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
    attackFlowOverlay.setAttribute("class", "attack-flow-overlay");
    attackFlowOverlay.appendChild(_getArrowheadMarker());
    svgDoc.children[0].appendChild(attackFlowOverlay);

    // Load the Attack Flow STIX bundle and convert it to an action graph.
    const [nodes, edges] = _convertBundleToGraph(flowStix);
    const [actionNodes, actionEdges] = _induceActionGraph(nodes, edges);

    // Draw ellipses around the (sub-)techniques.
    for (const actionNode of Object.values(actionNodes)) {
        const tid = actionNode["technique_id"];
        const translation = _lookupGeometry(actionNode, techniqueGeometries);
        if (translation) {
            const techniqueOverlay = _createTechniqueOverlay(tid, translation);
            attackFlowOverlay.appendChild(techniqueOverlay);
        }
    }

    // Draw arrows from each technique to its children.
    for (const [sourceId, children] of Object.entries(actionEdges)) {
        const sourceNode = actionNodes[sourceId];
        const sourceTid = sourceNode["technique_id"];
        const sourceGeometry = _lookupGeometry(sourceNode, techniqueGeometries);

        for (const child of children) {
            const targetNode = actionNodes[child];
            const targetTid = targetNode["technique_id"];
            const targetGeometry = _lookupGeometry(targetNode, techniqueGeometries);
            if (!(sourceGeometry && targetGeometry)) {
                // This could happen if a specified technique does not exist in this matrix, e.g. using mobile
                // techniques on an enterprise matrix.
                continue;
            }
            const arrowOverlay = _createRelationshipOverlay(
                sourceTid,
                targetTid,
                sourceGeometry,
                targetGeometry,
                SHOW_CONTROL_POINTS);
            attackFlowOverlay.appendChild(arrowOverlay);
        }
    }

    return svgDoc.documentElement.outerHTML;
}

/**
 * Convert an Attack Flow STIX bundle to a graph representation.
 *
 * Returns an array containing [nodes, edges]. Nodes is a map from nodeId->node.
 * Edges is a map where each key is a parent node ID and each value is a set of
 * child node IDs.
 *
 * @param {*} bundleSrc
 * @returns [nodes, edges]
 */
function _convertBundleToGraph(bundleSrc) {
    const bundle = JSON.parse(bundleSrc);
    const nodes = {};
    const edges = {};

    // Create a node for each object.
    for (const node of bundle.objects) {
        if (node.type !== "relationship") {
            nodes[node.id] = node;
            edges[node.id] = new Set();
        }
    }

    // Add children from each node's [resolvable] direct refs.
    for (const node of Object.values(nodes)) {
        for (const [property, value] of Object.entries(node)) {
            if (property.substring(property.length - 4) == "_ref") {
                if (value in nodes) {
                    edges[node.id].add(value);
                }
            } else if (property.substring(property.length - 5) == "_refs") {
                for (const ref of value) {
                    if (ref in nodes) {
                        edges[node.id].add(ref);
                    }
                }
            }
        }
    }

    // Add children from [resolvable] relationships.
    for (const rel of bundle.objects) {
        if (rel.type === "relationship") {
            const src = nodes[rel["source_ref"]];
            const target = nodes[rel["target_ref"]];
            if (src && target) {
                edges[src.id].add(target.id);
            }
        }
    }

    return [nodes, edges];
}

/**
 * Given an Attack Flow graph, return the induced graph containing only attack-action nodes.
 *
 * Note that we further eliminate attack-action nodes that do no contain a technique ID.
 *
 * @param {*} nodes
 * @param {*} edges
 * @returns [nodes, edges]
 */
function _induceActionGraph(nodes, edges) {
    const actionNodes = {};
    const actionEdges = {};
    const stack = [];
    const includeNode = (node) => node.type === "attack-action" &&
        node["technique_id"] !== undefined;

    // Initialize the graph using the nodes and edges of just the attack-action objects.
    for (const node of Object.values(nodes)) {
        if (includeNode(node)) {
            actionNodes[node.id] = node;
            actionEdges[node.id] = new Set(edges[node.id]);
            for (const childId of actionEdges[node.id]) {
                const child = nodes[childId];
                if (!includeNode(child)) {
                    stack.push([node.id, childId]);
                }
            }
        }
    }

    // The stack tracks edges from action nodes to non-action nodes. As we pop up each
    // item off the stack, we copy the grandchildren to the parent and remove the child,
    // then push any new of those grandchild that are not actions back onto the stack.
    let stackItem;
    while (stackItem = stack.pop()) {
        const [parentId, childId] = stackItem;
        const grandchildren = edges[childId];

        for (const grandchildId of grandchildren) {
            actionEdges[parentId].add(grandchildId);
            const grandchild = nodes[grandchildId];
            if (!includeNode(grandchild)) {
                stack.push([parentId, grandchildId]);
            }
        }
        actionEdges[parentId].delete(childId);
    }

    return [actionNodes, actionEdges];
}

/**
 * Iterate over an XML tree and create objects that represent the geometry for each <g> element for a
 * technique.
 *
 * SVG doesn't have any concept of depth or z-index. It draws all items in document order. So in order to draw
 * an overlay, the overlay must come after all elements that it intersects. The straightforward way to do this
 * is to append the element to the end of the document, but then it won't be translated properly since it's no
 * longer nested inside the same <g> as the target element. So this method traverses the tree and keeps track
 * of the sum of translations for each element, then writes a new technique <g> back to techniqueGeometries
 * with the technique ID as key and its translation as values.
 * @param {*} techniqueGeometries - this object is edited in place!
 * @param {*} node
 * @param {*} parentX
 * @param {*} parentY
 */
function _enumerateTechniqueGeometries(techniqueGeometries, node, parentX = 0, parentY = 0, tactic = null) {
    for (const child of node.children) {
        let childX = parentX;
        let childY = parentY;
        let tempTactic = tactic;

        if (transform = child.getAttribute("transform")) {
            if (match = transform.match(TRANSLATE_RE)) {
                childX += parseFloat(match[1]);
                childY += parseFloat(match[2]);
            } else {
                throw new Exception(`Unknown SVG transform: "${transform}" (was this SVG created by ATT&CK Navigator?)`);
            }
        }

        const childClass = child.getAttribute("class");
        if (childClass && (match = childClass.match(TACTIC_CLASS_RE))) {
            // If we traverse a tactic node (which is a <g>) then pass the tactic name down to the recursive
            // calls.
            tempTactic = match[1];
        } else if (childClass && (match = childClass.match(TECHNIQUE_CLASS_RE))) {
            const techniqueId = match[2];
            try {
                const rect = child.querySelector("rect");
                const width = parseFloat(rect.getAttribute("width"));
                const height = parseFloat(rect.getAttribute("height"));
                // Store geometries twice: once under TechniqueID and once more under a compound key
                // Tactic-TechniqueID. The renderer will use Tactic if available and fall back to just
                // TechniqueID.
                const geom = { x: childX, y: childY, width, height };
                techniqueGeometries[techniqueId] = geom;
                if (tempTactic) {
                    techniqueGeometries[`${tempTactic}-${techniqueId}`] = geom;
                }
            } catch (e) {
                console.log(`Could not find a <rect> with width and height attributes for technique ${techniqueId}`);
            }
        }

        _enumerateTechniqueGeometries(techniqueGeometries, child, childX, childY, tempTactic);
    }
}

/**
 * Look up the geometry for a given node (i.e. where it is located in the graphic). If the node contains a
 * tactic ID, then we attempt to look up the node within that tactic column, otherwise we return an arbitrary
 * geometry matching that node's technique ID.
 * @param {*} node
 * @param {*} techniqueGeometries
 */
function _lookupGeometry(node, techniqueGeometries) {
    const techniqueId = node["technique_id"];
    const tacticId = node["tactic_id"];
    const tactic = TACTIC_LOOKUP[tacticId];
    let geometry;

    // Try looking up by tactic + technique ID first.
    if (tactic) {
        geometry = techniqueGeometries[`${tactic}-${techniqueId}`];
    }

    // Fall back to looking up by technique ID alone.
    if (!geometry) {
        geometry = techniqueGeometries[techniqueId];
    }

    // Finally, check if its a subtechnique and its parent technique can be looked up.
    if (!geometry) {
        if (techniqueId.includes(".")) {
            // If the TID is not found and it's a subtechnique, then check if the parent TID exists.
            const parentTid = techniqueId.split(".")[0];

            // Look up by tactic + technique ID first.
            if (tactic) {
                geometry = techniqueGeometries[`${tactic}-${parentTid}`];
            }

            // Fall back to looking up by technique ID alone.
            if (!geometry) {
                geometry = techniqueGeometries[parentTid];
            }

            if (geometry) {
                console.warn(`Did not find subtechnique "${techniqueId}" in the SVG; substituting its parent technique "${parentTid}".`)
                // Hack: update the technique ID so we can draw the arrows pointing at it later.
                node["technique_id"] = parentTid;
            } else {
                console.error(`Did not find subtechnique "${techniqueId}" or its parent technique "${parentTid}" in the SVG.`);
            }
        } else {
            console.error(`Did not find TID=${techniqueId} in the SVG.`);
        }
    }

    return geometry;
}

/**
 * Create an ellipse object that goes around the specified technique.
 * @param {*} techniqueId
 * @param {*} techniqueGeometry
 * @returns
 */
function _createTechniqueOverlay(techniqueId, techniqueGeometry) {
    const { x, y, width, height } = techniqueGeometry;
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
    overlay.classList.add("overlay", techniqueId);
    overlay.setAttribute("transform", `translate(${x}, ${y})`);

    const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse.setAttribute("rx", (width * ELLIPSE_SIZE_MULTIPLIER).toString());
    ellipse.setAttribute("ry", (height * ELLIPSE_SIZE_MULTIPLIER).toString());
    ellipse.setAttribute("cx", (width / 2).toString());
    ellipse.setAttribute("cy", (height / 2).toString());
    ellipse.setAttribute("fill", "none");
    ellipse.setAttribute("stroke", OVERLAY_COLOR);
    ellipse.setAttribute("stroke-width", STROKE_WIDTH);
    overlay.appendChild(ellipse);

    return overlay;
}

/**
 * Draw an arrow from one technique to another.
 * @param {*} sourceTid
 * @param {*} targetTid
 * @param {*} sourceGeometry
 * @param {*} targetGeometry
 * @param {*} showControlPoints
 */
function _createRelationshipOverlay(sourceTid, targetTid, sourceGeometry, targetGeometry, showControlPoints) {
    // Create a container element for the arrow.
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
    overlay.classList.add("overlay", `${sourceTid}-${targetTid}`);
    const translateX = sourceGeometry.x + sourceGeometry.width / 2;
    const translateY = sourceGeometry.y + sourceGeometry.height / 2;
    overlay.setAttribute("transform", `translate(${translateX}, ${translateY})`);

    // Compute the coordinates for the path.
    const startRX = sourceGeometry.width * ELLIPSE_SIZE_MULTIPLIER;
    const startRY = sourceGeometry.height * ELLIPSE_SIZE_MULTIPLIER;
    let startX = ARROW_OFFSET;
    let startY = Math.sqrt(startRY ** 2 * (1 - startX ** 2 / startRX ** 2));

    const targetRX = targetGeometry.width * ELLIPSE_SIZE_MULTIPLIER;
    const targetRY = targetGeometry.height * ELLIPSE_SIZE_MULTIPLIER;
    const targetDX = ARROW_OFFSET;
    const targetDY = Math.sqrt(targetRY ** 2 * (1 - targetDX ** 2 / targetRX ** 2));
    let targetX = targetGeometry.x - sourceGeometry.x;
    let targetY = targetGeometry.y - sourceGeometry.y;

    // Make room for the arrow head. The slope is the same as control_dy / control_dx so that the arrow points
    // in the same direction as the line end.
    distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
    const controlDX = distance * 0.1;
    const controlDY = distance * 0.2;
    arrowDX = Math.sqrt((ARROWHEAD_WIDTH * 2) ** 2 / 5)
    arrowDY = arrowDX * 2
    let control1X, control1Y, control2X, control2Y;

    if (targetGeometry.x < sourceGeometry.x) {
        startX = -startX
        targetX += targetDX + arrowDX
        control1X = startX - controlDX
        control2X = targetX + controlDX
    } else {
        targetX -= targetDX + arrowDX
        control1X = startX + controlDX
        control2X = targetX - controlDX
    }
    if (targetGeometry.y < sourceGeometry.y) {
        startY = -startY
        targetY += targetDY + arrowDY
        control1Y = startY - controlDY
        control2Y = targetY + controlDY
    } else {
        targetY -= targetDY + arrowDY
        control1Y = startY + controlDY
        control2Y = targetY - controlDY
    }

    // Show control points, if requested for debugging.
    if (showControlPoints) {
        startPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        startPoint.setAttribute("cx", startX);
        startPoint.setAttribute("cy", startY);
        startPoint.setAttribute("r", 2);
        startPoint.style.fill = "green";
        overlay.appendChild(startPoint);

        targetPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        targetPoint.setAttribute("cx", targetX);
        targetPoint.setAttribute("cy", targetY);
        targetPoint.setAttribute("r", 2);
        targetPoint.style.fill = "blue";
        overlay.appendChild(targetPoint);

        controlPoint1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        controlPoint1.setAttribute("cx", control1X);
        controlPoint1.setAttribute("cy", control1Y);
        controlPoint1.setAttribute("r", 2);
        controlPoint1.style.fill = "red";
        overlay.appendChild(controlPoint1);

        controlPoint2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        controlPoint2.setAttribute("cx", control2X);
        controlPoint2.setAttribute("cy", control2Y);
        controlPoint2.setAttribute("r", 2);
        controlPoint2.style.fill = "orange";
        overlay.appendChild(controlPoint2);
    }

    // Create the path.
    path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${startX} ${startY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${targetX} ${targetY}`);
    path.setAttribute("marker-end", "url(#attack-flow-arrowhead)");
    path.setAttribute("stroke", OVERLAY_COLOR);
    path.setAttribute("stroke-width", STROKE_WIDTH);
    path.setAttribute("fill", "none");
    overlay.append(path)

    return overlay;
}

/**
 * Create an arrowhead element that can be re-used for each path
 * @returns
 */
function _getArrowheadMarker() {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "attack-flow-arrowhead");
    marker.setAttribute("markerWidth", ARROWHEAD_WIDTH);
    marker.setAttribute("markerHeight", ARROWHEAD_HEIGHT);
    marker.setAttribute("refX", "0");
    marker.setAttribute("refY", ARROWHEAD_HEIGHT / 2);
    marker.setAttribute("orient", "auto");

    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const halfHeight = ARROWHEAD_HEIGHT / 2;
    poly.setAttribute("points", `0 0, ${ARROWHEAD_WIDTH} ${halfHeight}, 0 ${ARROWHEAD_HEIGHT}`);
    poly.style.fill = OVERLAY_COLOR;
    marker.appendChild(poly);

    return marker
}
