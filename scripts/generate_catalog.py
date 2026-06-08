import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ROOT = BASE_DIR

catalog = []

for folder in os.listdir(ROOT):
    path = os.path.join(ROOT, folder)

    if not os.path.isdir(path):
        continue

    info_path = os.path.join(path, "info.json")

    meta = {
        "folder": folder,
        "name": folder.replace("-", " ").title(),
        "css": None,
        "license": "",
        "projects": [],
        "tags": [],
        "preview": "The quick brown fox jumps over the lazy dog"
    }

    if os.path.exists(info_path):
        with open(info_path, "r", encoding="utf-8") as f:
            meta.update(json.load(f))

    for file in os.listdir(path):
        if file.endswith(".css"):
            meta["css"] = file
            break

    if meta["css"]:
        catalog.append(meta)

print(f"Found {len(catalog)} fonts")

with open(os.path.join(ROOT, "catalog.json"), "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2)
