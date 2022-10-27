from collections import OrderedDict
import json
from pathlib import Path

corpus_dir = Path("./corpus")
migrate_afb_path = Path("./migrate.afb")

def main():
    # Get the schema from an existing AFB file.
    with migrate_afb_path.open() as migrate_afb_file:
        migrate_afb = json.load(migrate_afb_file)
        new_schema = migrate_afb["schema"]
        new_page_props = migrate_afb["objects"][0]["properties"]

    # Iterate over .afb files in /corpus/ and migrate each one.
    for afb_path in corpus_dir.glob("*.afb"):
        print(f"Migrating: {afb_path}")
        with afb_path.open() as afb_file_ro:
            afb = OrderedDict(json.load(afb_file_ro))

        # afb.pop("api_version", None)
        # afb["version"] = "2.0.0"
        # afb.pop("name", None)
        afb["schema"] = new_schema

        # Replace the first object (@_builtin_page) with the new attack_flow_page
        # object and set the page ID to a unique value.
        # page_id = afb.pop("page")
        # afb["id"] = page_id
        page = afb["objects"][0]
        # page["id"] = page_id
        page["template"] = "flow"
        # page["properties"] = new_page_props
        # del page["location"]

        # Migrate existing nodes to new schema.
        for obj in afb["objects"][1:]:
            # transform property list into dict for convenienc
            props = dict(obj["properties"])

            # convert hyphens in template id to underscores
            if not obj["template"].startswith("@__builtin"):
                obj["template"] = obj["template"].replace("-", "_")

        #     # Replace empty strings with nulls
        #     for k, v in props.items():
        #         if v.strip() == "":
        #             props[k] = None

        #     if obj["template"] == "action":
        #         migrate_action(props)
        #     elif obj["template"] == "asset":
        #         migrate_asset(props)
        #     elif obj["template"] in ("and", "or"):
        #         obj["children"] = []
            if obj["template"] == "condition": # TODO combine with and/or logic above
                obj["children"] = []
            elif obj["template"] == "malware":
                migrate_malware(props)

            # tranform dict back to property list
            obj["properties"] = list(props.items())

        # # Re-arrange the keys in the output json
        # afb.move_to_end("schema")
        # afb.move_to_end("objects")

        # # Add location
        # afb["location"] = {
        #     "x": -0.5,
        #     "y": 0,
        #     "k": 1
        # }

        with afb_path.open("w") as afb_file_rw:
            json.dump(afb, afb_file_rw, indent=2)


def migrate_action(props):
    # Rewrite technique_name -> name
    if "technique_name" in props:
        props["name"] = props.pop("technique_name")

    # Separate tactics and techniques
    if (tid := props.get("technique_id")) and tid.startswith("TA"):
        props["tactic_id"] = props.pop("technique_id")
    if (tref := props.get("technique_ref")) and tref.startswith("x-mitre-tactic--"):
        props["tactic_ref"] = props.pop("technique_ref")

    props["confidence"] = None


def migrate_asset(props):
    # some assets are missing names -- fill in a dummy value just to make it valid
    if props.get("name", "") == "":
        props["name"] = "PLACEHOLDER - RENAME ME"


def migrate_malware(props):
    # coerce is_family to a boolean if it's not null
    if is_family := props.get("is_family"):
        if is_family.lower() == "false":
            print(f'changed is_family from "{is_family}" to False')
            props["is_family"] = "68934a3e9455fa72420237eb05902327"
        else:
            print(f'changed is_family from "{is_family}" to True')
            props["is_family"] = "b326b5062b2f0e69046810717534cb09"
    else:
        print(f'changed is_family from "{is_family}" to False')
        props["is_family"] = "68934a3e9455fa72420237eb05902327"

if __name__ == "__main__":
    main()
