import os
import json

FONTS_DIR = "fonts"

catalog = []

for folder in os.listdir(FONTS_DIR):
    path = os.path.join(FONTS_DIR, folder)

    if not os.path.isdir(path):
        continue

    info_path = os.path.join(path, "info.json")

    # default metadata
    meta = {
        "folder": folder,
        "name": folder.replace("-", " ").title(),
        "css": None,
        "license": "",
        "projects": [],
        "tags": [],
        "preview": "The quick brown fox jumps over the lazy dog"
    }

    # load info.json if exists
    if os.path.exists(info_path):
        with open(info_path, "r", encoding="utf-8") as f:
            user_meta = json.load(f)
            meta.update(user_meta)

    # find css file automatically
    for file in os.listdir(path):
        if file.endswith(".css"):
            meta["css"] = file
            break

    # skip invalid entries
    if meta["css"] is None:
        continue

    catalog.append(meta)

# sort alphabetically
catalog.sort(key=lambda x: x["name"].lower())

with open(os.path.join(FONTS_DIR, "catalog.json"), "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)
