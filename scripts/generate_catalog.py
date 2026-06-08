import os
import json
import re
from collections import defaultdict

# ----------------------------
# PATH SETUP (GitHub Actions safe)
# ----------------------------
BASE_DIR = os.getcwd()
ROOT = BASE_DIR

# ----------------------------
# HELPERS
# ----------------------------

def extract_font_faces(css_text):
    return re.findall(r"@font-face\s*{[^}]+}", css_text, re.DOTALL)


def parse_font_face(block):
    family = re.search(r"font-family\s*:\s*['\"]([^'\"]+)['\"]", block)
    weight = re.search(r"font-weight\s*:\s*([^;]+)", block)
    style = re.search(r"font-style\s*:\s*([^;]+)", block)

    return {
        "family": family.group(1) if family else None,
        "weight": weight.group(1).strip() if weight else "400",
        "style": style.group(1).strip() if style else "normal"
    }


def normalize_weight(w):
    if not w:
        return "400"

    w = w.strip().lower()

    mapping = {
        "thin": "100",
        "extralight": "200",
        "ultralight": "200",
        "light": "300",
        "normal": "400",
        "regular": "400",
        "medium": "500",
        "semibold": "600",
        "demibold": "600",
        "bold": "700",
        "extrabold": "800",
        "ultrabold": "800",
        "black": "900",
        "heavy": "900",
    }

    return mapping.get(w, w)


# ----------------------------
# DATA STRUCTURE
# ----------------------------

families = defaultdict(lambda: {
    "family": "",
    "license": "unknown",
    "tags": [],
    "projects": [],
    "variants": []
})

# ----------------------------
# MAIN LOOP
# ----------------------------

for folder in os.listdir(ROOT):
    path = os.path.join(ROOT, folder)

    if not os.path.isdir(path):
        continue

    css_files = [f for f in os.listdir(path) if f.endswith(".css")]
    if not css_files:
        continue

    css_file = css_files[0]
    css_path = os.path.join(path, css_file)

    info_path = os.path.join(path, "info.json")

    # ----------------------------
    # SAFE META (ALWAYS DEFINED)
    # ----------------------------
    meta = {
        "license": "unknown",
        "tags": [],
        "projects": []
    }

    if os.path.exists(info_path):
        try:
            with open(info_path, "r", encoding="utf-8") as f:
                meta.update(json.load(f))
        except Exception:
            pass

    license_type = meta.get("license", "unknown")
    tags = meta.get("tags", [])
    projects = meta.get("projects", [])

    with open(css_path, "r", encoding="utf-8") as f:
        css_text = f.read()

    faces = extract_font_faces(css_text)

    if not faces:
        continue

    for face in faces:

        data = parse_font_face(face)

        if not data["family"]:
            continue

        fam = data["family"]

        group = families[fam]

        group["family"] = fam
        group["license"] = license_type
        group["tags"] = tags
        group["projects"] = projects

        variant = {
            "name": fam,
            "weight": normalize_weight(data["weight"]),
            "style": data["style"],
            "folder": folder,
            "css": css_file
        }

        group["variants"].append(variant)

# ----------------------------
# OUTPUT
# ----------------------------

catalog = list(families.values())

catalog.sort(key=lambda x: x["family"].lower())

with open(os.path.join(ROOT, "catalog.json"), "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print(f"Generated {len(catalog)} font families")
