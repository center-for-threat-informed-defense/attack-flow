"""
STIX 2.1 models for Attack Flow extensions.

This file duplicates the JSON schema to some extent, which is undesirable, but I'm not
sure how best to refactor: generate JSON schema from this code, or generate this code
from the JSON scheme?
"""
from stix2 import CustomObject, parse
from stix2.properties import ListProperty, ReferenceProperty, StringProperty

ATTACK_FLOW_EXTENSION_ID = "extension-definition--fb9c968a-745b-4ade-9b25-c324172197f4"

# SDO types to ignore when making visualizations.
VIZ_IGNORE_SDOS = ("attack-flow", "extension-definition")

# Common properties to ignore when making visualizations.
VIZ_IGNORE_COMMON_PROPERTIES = (
    "created",
    "external_references",
    "id",
    "modified",
    "revoked",
    "spec_version",
    "type",
)


@CustomObject(
    "attack-flow",
    [
        ("name", StringProperty(required=True)),
        ("description", StringProperty()),
        ("scope", StringProperty()),
        (
            "start_refs",
            ListProperty(
                ReferenceProperty(valid_types=["attack-action", "attack-condition"])
            ),
        ),
    ],
)
class AttackFlow:
    pass


@CustomObject(
    "attack-asset",
    [
        ("name", StringProperty(required=True)),
        ("description", StringProperty()),
        (
            "object_ref",
            ReferenceProperty(invalid_types=[]),
        ),
    ],
)
class AttackAsset:
    pass


@CustomObject(
    "attack-action",
    [
        ("technique_id", StringProperty()),
        ("name", StringProperty(required=True)),
        ("technique_ref", ReferenceProperty(valid_types="attack-pattern")),
        ("description", StringProperty()),
        (
            "asset_refs",
            ListProperty(ReferenceProperty(valid_types="attack-asset")),
        ),
        (
            "effect_refs",
            ListProperty(
                ReferenceProperty(
                    valid_types=["attack-action", "attack-condition", "attack-operator"]
                )
            ),
        ),
    ],
)
class AttackAction:
    pass


@CustomObject(
    "attack-condition",
    [
        ("description", StringProperty(required=True)),
        (
            "on_true_refs",
            ListProperty(
                ReferenceProperty(
                    valid_types=["attack-action", "attack-condition", "attack-operator"]
                )
            ),
        ),
        (
            "on_false_refs",
            ListProperty(
                ReferenceProperty(
                    valid_types=["attack-action", "attack-condition", "attack-operator"]
                )
            ),
        ),
    ],
)
class AttackCondition:
    pass


@CustomObject(
    "attack-operator",
    [
        ("operator", StringProperty(required=True)),
        (
            "effect_refs",
            ListProperty(
                ReferenceProperty(
                    valid_types=["attack-action", "attack-condition", "attack-operator"]
                )
            ),
        ),
    ],
)
class AttackOperator:
    pass


def load_attack_flow_bundle(path):
    """
    Load an Attack Flow STIX bundle from a given path.

    :param pathlib.Path path:
    :rtype: stix2.Bundle
    """
    with path.open() as f:
        bundle = parse(f, allow_custom=True)
    return bundle


def get_flow_object(flow_bundle):
    """
    Given an Attack Flow STIX bundle, extract the ``attack-flow`` object.

    :param flow_bundle stix.Bundle:
    :rtype: AttackFlow
    """
    for obj in flow_bundle.objects:
        if obj.type == "attack-flow":
            return obj


_CONFIDENCE_NUM_TO_LABEL = [
    (0, 0, "Speculation"),
    (1, 20, "Very Doubtful"),
    (21, 40, "Doubtful"),
    (41, 60, "Even Odds"),
    (61, 80, "Probable"),
    (81, 99, "Very Probable"),
    (100, 100, "Certainty"),
]


def confidence_num_to_label(num):
    for low, high, label in _CONFIDENCE_NUM_TO_LABEL:
        if low <= num <= high:
            return label
    raise ValueError("Confidence number must be between 0 and 100 inclusive.")


_CONFIDENCE_LABEL_TO_NUM = {
    "Speculation": 0,
    "Very Doubtful": 10,
    "Doubtful": 30,
    "Even Odds": 50,
    "Probable": 70,
    "Very Probable": 90,
    "Certainty": 100,
}


def confidence_label_to_num(label):
    try:
        return _CONFIDENCE_LABEL_TO_NUM[label]
    except KeyError:
        raise ValueError(f"Invalid confidence label: `{label}`")


def get_viz_ignored_ids(flow_bundle):
    """
    Process a flow bundle and return a set of IDs that the visualizer should ignore,
    e.g. the extension object, the extension creator identity, etc.
    """
    ignored = set()

    # Ignore flow creator identity:
    flow = get_flow_object(flow_bundle)
    if flow_creator := flow.get("created_by_ref", None):
        ignored.add(flow_creator)

    # Ignore by SDO type:
    for obj in flow_bundle.objects:
        if isinstance(obj, dict):
            # this could happen if the SDO type is unknown
            ignored.add(obj["id"])
            continue

        if obj.type in VIZ_IGNORE_SDOS:
            ignored.add(obj.id)

        # Ignore extension creator identity:
        if obj.type == "extension-definition" and (
            ext_creator := obj.get("created_by_ref", None)
        ):
            ignored.add(ext_creator)

    return ignored
