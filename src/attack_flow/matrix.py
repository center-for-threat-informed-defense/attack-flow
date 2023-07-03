"""
Code for drawing an Attack Flow action graph on top of an ATT&CK Navigator SVG.

This is quite brittle since it depends on the internal structure of the Navigator SVG. For future proofing we
might want to read the Navigator layer and generate our own rendering of the matrix, but in the interest of
time this simpler approach will suffice.

This code has been ported to JavaScript for use on the Attack Flow website. That version of the code contains
some improvements, such as the ability to incorporate tactic information when selecting a cell on the matrix.
"""

from collections import namedtuple
import logging
import math
import re
from xml.etree import ElementTree

from defusedxml.ElementTree import parse as defusedxml_parse

import attack_flow.graph


logger = logging.getLogger(__name__)
TECHNIQUE_CLASS_RE = re.compile(r"(sub)?technique (T[.0-9]+)")
TRANSLATE_RE = re.compile(r"^translate\(([^,]+),\s*([^,]+)\)$")
OVERLAY_COLOR = "rgba(204, 0, 0, 0.75)"
ELLIPSE_SIZE_MULTIPLIER = 0.6
LINE_BENDINESS = 0.15
ARROWHEAD_WIDTH = 7
ARROWHEAD_HEIGHT = 5
ARROW_OFFSET = 30
STROKE_WIDTH = 2
_TechniqueGeometry = namedtuple("_TechniqueGeometry", ["x", "y", "width", "height"])


def render(matrix_file, flow_bundle, out_file, show_control_points=False):
    """
    Render a flow on top of an ATT&CK matrix SVG.

    :param file matrix_file: A file-like object containing the SVG content.
    :param stix2.Bundle flow_bundle: The flow as a STIX bundle.
    :param file out_file: A file-like object to write the result to.
    :param show_control_points: For debugging, display the control points for the
        arrows' curves.
    """
    ElementTree.register_namespace("", "http://www.w3.org/2000/svg")
    tree = defusedxml_parse(matrix_file)

    # Build a lookup table from technique ID -> translation coordinates for that
    # technique's <g> element.
    technique_geometries = dict()
    _enumerate_technique_geometries(technique_geometries, tree.getroot())

    # Create a new <g> to hold all of the Attack Flow overlay elements.
    attack_flow_overlay = ElementTree.Element("g", {"class": "attack-flow-overlay"})
    attack_flow_overlay.append(_get_arrowhead_marker())
    tree.getroot().append(attack_flow_overlay)

    # Create the Attack Flow overlay elements.
    full_graph = attack_flow.graph.bundle_to_networkx(flow_bundle)
    graph = attack_flow.graph.induce_action_graph(full_graph)

    for node, data in graph.nodes(data=True):
        try:
            tid = data["technique_id"]
        except KeyError:
            logger.warning("Node (%s) does not have a technique ID.", node)
            continue
        if translation := technique_geometries.get(tid):
            technique_overlay = _create_technique_overlay(tid, translation)
            attack_flow_overlay.append(technique_overlay)
        else:
            if "." in tid:
                tid2, _ = tid.split(".")
                if translation := technique_geometries.get(tid2):
                    logger.warning(
                        "Did not find subtechnique %s; replacing with parent technique %s.",
                        tid,
                        tid2,
                    )
                    data["technique_id"] = tid2
                    technique_overlay = _create_technique_overlay(tid2, translation)
                    attack_flow_overlay.append(technique_overlay)
                else:
                    logger.warning(
                        "Did not find subtechnique %s or parent technique %s in input SVG.",
                        tid,
                        tid2,
                    )
            else:
                logger.warning(f"Did not find technique ID {tid} in input SVG.")

    for src_id, target_id in graph.edges:
        src_data = graph.nodes[src_id]
        target_data = graph.nodes[target_id]
        try:
            src_tid = src_data["technique_id"]
            target_tid = target_data["technique_id"]
            src_geom = technique_geometries[src_tid]
            target_geom = technique_geometries[target_tid]
        except KeyError:
            # Note that missing technique IDs are logged above.
            continue
        arrow_overlay = _create_relationship_overlay(
            src_tid, src_geom, target_tid, target_geom, show_control_points
        )
        attack_flow_overlay.append(arrow_overlay)

    # Write the SVG to output.
    tree.write(out_file, xml_declaration=True)


def _enumerate_technique_geometries(technique_geometries, node, parent_x=0, parent_y=0):
    """
    Iterate over an XML tree and create _TechniqueGeometry objects that represent each
    <g> element for a technique.

    SVG doesn't have any concept of depth or z-index. It draws all items in document
    order. So in order to draw an overlay, the overlay must come after all elements that
    it intersects. The straightforward way to do this is to append the element to the
    end of the document, but then it won't be translated properly since it's no longer
    nested inside the same <g> as the target element. So this method traverses the tree
    and keeps track of the sum of translations for each element, then writes a new
    technique <g> back to `technique_geometries` with the technique ID as key and its
    translation as values.

    :param ElementTree node:
    :rtype: _TechniqueGeometry
    """
    for child in node:
        child_x, child_y = parent_x, parent_y
        if transform := child.get("transform"):
            if match := TRANSLATE_RE.match(transform):
                child_x += float(match.group(1))
                child_y += float(match.group(2))
            else:
                raise ValueError(
                    f'Unknown SVG transform: "{transform}" (was this SVG created by ATT&CK Navigator?)'
                )
        if match := TECHNIQUE_CLASS_RE.match(child.get("class", "")):
            technique_id = match.group(2)
            try:
                rect = child.find("{http://www.w3.org/2000/svg}rect")
                width = float(rect.attrib["width"])
                height = float(rect.attrib["height"])
            except (KeyError, TypeError):
                raise ValueError(
                    f"Cannot find a <rect> with width and height attributes. The SVG may be a different format than this script requires. (The regex match was: {match})"
                )
            technique_geometries[technique_id] = _TechniqueGeometry(
                child_x, child_y, width, height
            )
        _enumerate_technique_geometries(technique_geometries, child, child_x, child_y)


def _create_technique_overlay(technique_id, technique_geometry):
    """
    Create the overlay object (a red ellipse).

    :param str technique_id:
    :param _TechniqueGeometry technique_geometry:
    :returns: a new <g> element
    """
    x, y, width, height = technique_geometry
    overlay_element = ElementTree.Element(
        "g", {"class": f"overlay {technique_id}", "transform": f"translate({x}, {y})"}
    )
    ellipse_el = ElementTree.Element(
        "ellipse",
        {
            "rx": str(width * ELLIPSE_SIZE_MULTIPLIER),
            "ry": str(height * ELLIPSE_SIZE_MULTIPLIER),
            "cx": str(width / 2),
            "cy": str(height / 2),
            "style": f"fill: none; stroke: {OVERLAY_COLOR}; stroke-width: {STROKE_WIDTH};",
        },
    )
    overlay_element.append(ellipse_el)
    return overlay_element


def _create_relationship_overlay(
    source_tid, source_geom, target_tid, target_geom, show_control_points
):
    """
    Create the overlay object (a red line with an arrowhead)

    :param str source_tid: source technique ID
    :param _TechniqueGeometry source_geom:
    :param str target_tid: target technique ID
    :param _TechniqueGeometry target_geom:
    :returns: a new <g> element
    """
    overlay_element = ElementTree.Element(
        "g",
        {
            "class": f"overlay {source_tid}-{target_tid}",
            "transform": f"translate({source_geom.x + source_geom.width / 2}, {source_geom.y + source_geom.height / 2})",
        },
    )

    # Compute the coordinates for the path.
    start_rx = source_geom.width * ELLIPSE_SIZE_MULTIPLIER
    start_ry = source_geom.height * ELLIPSE_SIZE_MULTIPLIER
    start_x = ARROW_OFFSET
    start_y = math.sqrt(start_ry**2 * (1 - start_x**2 / start_rx**2))

    target_rx = target_geom.width * ELLIPSE_SIZE_MULTIPLIER
    target_ry = target_geom.height * ELLIPSE_SIZE_MULTIPLIER
    target_dx = ARROW_OFFSET
    target_dy = math.sqrt(target_ry**2 * (1 - target_dx**2 / target_rx**2))
    target_x = target_geom.x - source_geom.x
    target_y = target_geom.y - source_geom.y

    distance = math.sqrt((target_x - start_x) ** 2 + (target_y - start_y) ** 2)
    control_dx = distance * 0.1
    control_dy = distance * 0.2
    # Make room for the arrow head. The slope is the same as control_dy / control_dx
    # so that the arrow points in the same direction as the line end.
    arrow_dx = math.sqrt((ARROWHEAD_WIDTH * 2) ** 2 / 5)
    arrow_dy = arrow_dx * 2

    if target_geom.x < source_geom.x:
        start_x = -start_x
        target_x += target_dx + arrow_dx
        control1_x = start_x - control_dx
        control2_x = target_x + control_dx
    else:
        target_x -= target_dx + arrow_dx
        control1_x = start_x + control_dx
        control2_x = target_x - control_dx

    if target_geom.y < source_geom.y:
        start_y = -start_y
        target_y += target_dy + arrow_dy
        control1_y = start_y - control_dy
        control2_y = target_y + control_dy
    else:
        target_y -= target_dy + arrow_dy
        control1_y = start_y + control_dy
        control2_y = target_y - control_dy

    if show_control_points:
        overlay_element.append(
            ElementTree.Element(
                "circle",
                {
                    "cx": str(start_x),
                    "cy": str(start_y),
                    "r": "1",
                    "style": "fill: green;",
                },
            )
        )

        overlay_element.append(
            ElementTree.Element(
                "circle",
                {
                    "cx": str(target_x),
                    "cy": str(target_y),
                    "r": "1",
                    "style": "fill: blue;",
                },
            )
        )

        overlay_element.append(
            ElementTree.Element(
                "circle",
                {
                    "cx": str(control1_x),
                    "cy": str(control1_y),
                    "r": "1",
                    "style": "fill: red;",
                },
            )
        )

        overlay_element.append(
            ElementTree.Element(
                "circle",
                {
                    "cx": str(control2_x),
                    "cy": str(control2_y),
                    "r": "1",
                    "style": "fill: orange;",
                },
            )
        )

    # Create the path.
    path_el = ElementTree.Element(
        "path",
        {
            "d": f"M {start_x} {start_y} C {control1_x} {control1_y} {control2_x} {control2_y} {target_x} {target_y}",
            "style": f"stroke: {OVERLAY_COLOR}; stroke-width: {STROKE_WIDTH}; fill: none;",
            "marker-end": "url(#attack-flow-arrowhead)",
        },
    )
    overlay_element.append(path_el)
    return overlay_element


def _get_arrowhead_marker():
    """
    Create a <marker> for drawing arrowheads on lines.

    :rtype: etree.Element
    """
    marker = ElementTree.Element(
        "marker",
        {
            "id": "attack-flow-arrowhead",
            "markerWidth": str(ARROWHEAD_WIDTH),
            "markerHeight": str(ARROWHEAD_HEIGHT),
            "refX": "0",
            "refY": str(ARROWHEAD_HEIGHT / 2),
            "orient": "auto",
        },
    )
    marker.append(
        ElementTree.Element(
            "polygon",
            {
                "points": f"0 0, {ARROWHEAD_WIDTH} {ARROWHEAD_HEIGHT / 2}, 0 {ARROWHEAD_HEIGHT}",
                "fill": OVERLAY_COLOR,
            },
        )
    )

    return marker
