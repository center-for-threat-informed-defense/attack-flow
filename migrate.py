import json
from pathlib import Path

corpus_dir = Path("./corpus")
migrate_afb_path = Path("./migrate.afb")

def main():
    # Get the schema from an existing AFB file.
    with migrate_afb_path.open() as migrate_afb_file:
        migrate_afb = json.load(migrate_afb_file)
        new_schema = migrate_afb["schema"]

    # Iterate over .afb files in /corpus/ and insert new schema, then update existing
    # fields.
    for afb_path in corpus_dir.glob("*.afb"):
        print(f"Migrating: {afb_path}")
        with afb_path.open() as afb_file_ro:
            afb = json.load(afb_file_ro)

        afb["api_version"] = "2.0.0"
        afb["schema"] = new_schema

        # Migrate existing nodes to new schema.
        for obj in afb["objects"]:
            if obj["template"] == "action":
                migrate_action(obj)

        with afb_path.open("w") as afb_file_rw:
            json.dump(afb, afb_file_rw, indent=2)


def migrate_action(action):
    # Rewrite technique_name -> name
    for idx, prop in enumerate(action["properties"]):
        key = prop[0]
        if key == "technique_name":
            break
    else:
        raise Exception(f"Did not find a technique_name in action: {action}")
    action["properties"][idx][0] = "name"


if __name__ == "__main__":
    main()
