"""
Tools for working with the Attack Flow schema.
"""
import json
import functools
from pathlib import Path
import urllib.parse

import jsonschema

from .model import load_attack_flow_bundle, get_flow_object, ATTACK_FLOW_EXTENSION_ID

SCHEMA_DIR = Path(__file__).resolve().parents[2] / "stix"
SDOS = (
    "attack-pattern",
    "campaign",
    "course-of-action",
    "grouping",
    "identity",
    "incident",
    "indicator",
    "infrastructure",
    "intrusion-set",
    "location",
    "malware-analysis",
    "malware",
    "note",
    "observed-data",
    "opinion",
    "report",
    "threat-actor",
    "tool",
    "vulnerability",
)
SCOS = (
    "artifact",
    "autonomous-system",
    "directory",
    "domain-name",
    "email-addr",
    "email-message",
    "file",
    "ipv4-addr",
    "ipv6-addr",
    "mac-addr",
    "mutex",
    "network-traffic",
    "process",
    "software",
    "url",
    "user-account",
    "windows-registry-key",
    "x509-certificate",
)
SROS = (
    "relationship",
    "sighting",
)
COMMON = "extension-definition"


class ValidationResult:
    def __init__(self):
        self.messages = list()

    @property
    def success(self):
        return not any(f.type_ == "error" for f in self.messages)

    @property
    def strict_success(self):
        return len(self.messages) == 0

    def add_error(self, message):
        self.messages.append(FlowValidationFailure("error", message))

    def add_warning(self, message):
        self.messages.append(FlowValidationFailure("warning", message))

    def add_exc(self, message, exc):
        self.messages.append(FlowValidationFailure("error", message, exc))


class FlowValidationFailure(Exception):
    """Generic error for validation failure."""

    def __init__(self, type_, message, original_exc=None):
        self.type_ = type_
        self.message = message
        self.exc = original_exc

    def __str__(self):
        return f"[{self.type_}] {self.message}"


def validate_doc(flow_path):
    """
    Validate an Attack Flow document.

    :param str flow_path: path to attack flow doc
    :rtype: ValidationResult
    """
    with open(flow_path) as flow_file:
        flow_json = json.load(flow_file)

    result = ValidationResult()
    check_objects(flow_json, result)
    check_schema(flow_json, result)
    flow = load_attack_flow_bundle(flow_path)
    check_graph(flow, result)
    check_best_practices(flow, result)
    return result


@functools.cache
def get_validator_for_object(obj_type):
    """
    Return a validator for the given object type.

    Validators are cached for efficiency.

    :param str obj_type:
    :rtype: jsonschema.protocols.Validator
    """
    resolver = jsonschema.validators.RefResolver(
        base_uri="",
        referrer=True,
        handlers={"https": resolve_url_to_local, "http": resolve_url_to_local},
    )

    if obj_type.startswith("attack-"):
        schema_path = SCHEMA_DIR / "attack-flow-schema-2.0.0.json"
    elif obj_type in SDOS:
        schema_path = SCHEMA_DIR / "oasis-open" / "sdos" / f"{obj_type}.json"
    elif obj_type in SCOS:
        schema_path = SCHEMA_DIR / "oasis-open" / "observables" / f"{obj_type}.json"
    elif obj_type in SROS:
        schema_path = SCHEMA_DIR / "oasis-open" / "sros" / f"{obj_type}.json"
    elif obj_type in COMMON:
        schema_path = SCHEMA_DIR / "oasis-open" / "common" / f"{obj_type}.json"
    else:
        schema_path = None

    if schema_path:
        with schema_path.open() as schema_file:
            schema_json = json.load(schema_file)
        return jsonschema.Draft202012Validator(schema_json, resolver=resolver)
    else:
        return None


def resolve_url_to_local(url):
    """
    To avoid constantly downloading schemas from the internet, they are all stored
    locally and the URLs are mapped to filesystem paths.

    :param str url:
    :returns: a `dict` containing the parsed JSON schema
    """
    parsed = urllib.parse.urlparse(url)
    if parsed.path.startswith("/attack-flow/"):
        local_path = SCHEMA_DIR / parsed.path.split("/")[-1]
    elif parsed.path.startswith("/oasis-open/"):
        oasis_schema = SCHEMA_DIR / "oasis-open"
        local_path = oasis_schema.joinpath(*parsed.path.split("/")[-2:])
    else:
        raise Exception("TODO")
    with local_path.open() as local_file:
        local_schema = json.load(local_file)
    return local_schema


def check_objects(flow_json, result):
    """
    Check the Attack Flow document contains some essential objects: a top-level
    ``bundle``, exactly one ``attack-flow`` instance, and the proper
    ``extension-definition``.

    :param dict flow_json: The flow parsed from JSON
    :param ValidationResult result:
    """
    if flow_json.get("type") != "bundle":
        result.add_error(
            "An Attack Flow document must contain a top-level STIX bundle."
        )
    if not flow_json.get("id", "").startswith("bundle--"):
        result.add_error("The bundle ID must be a GUID starting with `bundle--`.")
    if not isinstance(flow_json.get("objects"), list):
        result.add_error("The bundle must contain an array called `objects`.")
    flows = [o for o in flow_json.get("objects", []) if o["type"] == "attack-flow"]
    if len(flows) != 1:
        result.add_error("The bundle must contain exactly one `attack-flow` object.")
    exts = [
        o
        for o in flow_json.get("objects", [])
        if o["type"] == "extension-definition"
        and o.get("id") == ATTACK_FLOW_EXTENSION_ID
    ]
    if not exts:
        result.add_error(
            "The bundle must include the Attack Flow `extension-definition`."
        )


def check_schema(flow_json, result):
    """
    Validate a document against the JSON schema.

    :param dict flow_json: The flow parsed from JSON
    :param ValidationResult result:
    """
    for item in flow_json.get("objects", []):
        if not (validator := get_validator_for_object(item["type"])):
            result.add_warning(f"Cannot validate objects of type: {item['type']}")
            continue

        for error in validator.iter_errors(item):
            if isinstance(error.instance, dict):
                obj_id = error.instance.get("id", "N/A")
                message = f"Object id={obj_id}: "
            else:
                message = f"{error.instance}: "
            if comment := error.schema.get("$comment"):
                message += f"{comment} (Detail: {error.message})"
            else:
                message += error.message
            result.add_exc(message, error)


def check_graph(flow, result):
    """
    Check characteristics of the Attack Flow graph.

    :param stix2.Bundle flow:
    :param ValidationResult result:
    """
    return


def check_best_practices(flow, result):
    """
    Check for some best practices.

    :param stix2.Bundle flow:
    :param ValidationResult result:
    """
    return
    try:
        author = flow_bundle.get_obj(flow["created_by_ref"])[0]
        author_name = author["name"]
    except (KeyError, IndexError):
        raise InvalidFlowError("All flows in the corpus must contain an author name.")

    try:
        flow_name = flow["name"]
        flow_description = flow["description"]
    except KeyError:
        raise InvalidFlowError(
            "All flows in the corpus must contain a name and description."
        )
