import os
import json
import re

BASE_DIR = os.getcwd()

def extract_font_families(css_text):
    return re.findall(r"font-family\s*:\s*['\"]([^'\"]+)['\"]", css_text)

catalog = []

for folder in os.listdir(BASE_DIR):
    path = os.path.join(BASE_DIR, folder)

    if not os.path.isdir(path):
        continue

    css_file = None
    for f in os.listdir(path):
        if f.endswith(".css"):
            css_file = f
            break

    if not css_file:
        continue

    css_path = os.path.join(path, css_file)

    with open(css_path, "r", encoding="utf-8") as f:
        css_text = f.read()

    families = extract_font_families(css_text)

    # fallback if CSS is weird
    if not families:
        families = [folder.replace("-", " ").title()]

    for family in families:
        catalog.append({
            "name": family,
            "fontFamily": family,
            "folder": folder,
            "css": css_file,
        })

catalog.sort(key=lambda x: x["name"].lower())

with open("catalog.json", "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)
