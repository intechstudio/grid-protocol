#!/usr/bin/env python3
"""Scaffold LuaCATS annotation stubs from grid_protocol_bot.json.

Merge-safe by design:
  - Reads the "luadocs" key from grid_protocol_bot.json for the full
    function list.
  - Reads existing annotations/globals.lua and annotations/elements.lua.
  - Parses every `function <name>` declaration already present.
  - For each function in "luadocs": if the function name ALREADY EXISTS
    in the annotation file, SKIP it entirely — no overwrite, no merge.
  - For each function that is NEW, append a skeleton stub at the end of
    the appropriate file, marked with `-- [scaffold]`.
  - Print a summary of added vs skipped stubs.

Usage:
    python3 scripts/scaffold_annotations.py

    # Dry-run (print what would be added without writing):
    python3 scripts/scaffold_annotations.py --dry-run
"""

import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
JSON_PATH = os.path.join(REPO_ROOT, "src", "grid_protocol_bot.json")
GLOBALS_PATH = os.path.join(REPO_ROOT, "annotations", "globals.lua")
ELEMENTS_PATH = os.path.join(REPO_ROOT, "annotations", "elements.lua")

# Maps luadocs element category → LuaCATS class name used in elements.lua
CATEGORY_TO_CLASS = {
    "button": "ButtonElement",
    "encoder": "EncoderElement",
    "endless": "EndlessElement",
    "potmeter": "PotmeterElement",
    "lcd": "LcdElement",
    "system": "SystemElement",
}


def parse_existing_functions(filepath):
    """Return the set of function names declared in a Lua annotation file.

    Matches patterns like:
        function midi_send(...)
        function ButtonElement:button_value(...)
    and extracts the bare name (e.g. "midi_send", "button_value").
    Also returns a dict mapping ClassName -> set of method names for element files.
    Respects LuaCATS inheritance (---@class Child : Parent) so that parent
    methods count as existing on child classes.
    """
    if not os.path.exists(filepath):
        return set(), {}

    with open(filepath, "r") as f:
        content = f.read()

    # Match both global functions and class methods
    # Global:  function foo(...)
    # Method:  function ClassName:bar(...)
    bare_names = set()
    class_methods = {}

    for m in re.finditer(
        r"^function\s+(?:(\w+):)?(\w+)\s*\(", content, re.MULTILINE
    ):
        class_name = m.group(1)
        func_name = m.group(2)
        bare_names.add(func_name)
        if class_name:
            if class_name not in class_methods:
                class_methods[class_name] = set()
            class_methods[class_name].add(func_name)

    # Parse LuaCATS inheritance: ---@class Child : Parent
    inheritance = {}
    for m in re.finditer(
        r"^---@class\s+(\w+)\s*:\s*(\w+)", content, re.MULTILINE
    ):
        child, parent = m.group(1), m.group(2)
        inheritance[child] = parent

    # Propagate parent methods to children
    def resolve_methods(cls):
        methods = set(class_methods.get(cls, set()))
        parent = inheritance.get(cls)
        if parent:
            methods |= resolve_methods(parent)
        return methods

    for cls in list(class_methods.keys()) + list(inheritance.keys()):
        class_methods[cls] = resolve_methods(cls)

    return bare_names, class_methods


def parse_usage(usage_str):
    """Parse a _usage string like 'func_name(int a, int b) Description.'
    into a tuple of (params_list, description).
    Each param is a dict with keys 'type' and 'name'.
    """
    if not usage_str:
        return [], ""

    # Match: name(params) description
    m = re.match(r"[\w:]+\(([^)]*)\)\s*(.*)", usage_str)
    if not m:
        return [], usage_str

    params_raw = m.group(1).strip()
    description = m.group(2).strip()

    params = []
    if params_raw and params_raw.lower() != "void":
        for part in params_raw.split(","):
            part = part.strip()
            tokens = part.split()
            if len(tokens) >= 2:
                # e.g. "int channel" or "string lua_code"
                param_type = tokens[0]
                param_name = tokens[-1]
                lua_type = _c_type_to_lua(param_type)
                params.append({"type": lua_type, "name": param_name})
            elif len(tokens) == 1:
                params.append({"type": "any", "name": tokens[0]})

    return params, description


def _c_type_to_lua(c_type):
    """Convert C-style type hints from _usage strings to Lua/LuaCATS types."""
    mapping = {
        "int": "integer",
        "float": "number",
        "double": "number",
        "bool": "boolean",
        "string": "string",
        "table": "table",
        "element": "any",
    }
    return mapping.get(c_type.lower(), "any")


def generate_global_stub(entry):
    """Generate a LuaCATS stub for a global function."""
    lines = []
    lines.append("")
    lines.append(f"-- [scaffold] auto-generated stub for '{entry['name']}'")

    usage = entry.get("usage", "")
    params, description = parse_usage(usage)

    if description:
        lines.append(f"---{description}")
    else:
        lines.append(f"---{entry['name']} (no description available)")

    for p in params:
        lines.append(f"---@param {p['name']} {p['type']}")

    # Build param list for function signature
    param_names = [p["name"] for p in params]
    lines.append(f"function {entry['name']}({', '.join(param_names)}) end")

    return "\n".join(lines)


def generate_method_stub(class_name, entry):
    """Generate a LuaCATS stub for an element method."""
    lines = []
    lines.append("")
    lines.append(
        f"-- [scaffold] auto-generated stub for '{class_name}:{entry['name']}'"
    )

    usage = entry.get("usage", "")
    params, description = parse_usage(usage)

    if description:
        lines.append(f"---{description}")
    else:
        lines.append(f"---{entry['name']} (no description available)")

    # Filter out 'self' from params if present (implicit in methods)
    params = [p for p in params if p["name"] != "self"]

    for p in params:
        lines.append(f"---@param {p['name']} {p['type']}")

    param_names = [p["name"] for p in params]
    lines.append(
        f"function {class_name}:{entry['name']}({', '.join(param_names)}) end"
    )

    return "\n".join(lines)


def load_luadocs(json_path):
    """Load the luadocs structure from grid_protocol_bot.json.

    Supports two formats:
    1. Structured "luadocs" key (from protocol_converter.py step 3)
    2. Fallback: parse flat GRID_LUA_FNC_* keys
    """
    with open(json_path) as f:
        data = json.load(f)

    if "luadocs" in data and isinstance(data["luadocs"], dict):
        return data["luadocs"]

    # Fallback: extract from flat keys (same logic as extract_luadocs.py)
    return _extract_luadocs_from_flat(data)


def _extract_luadocs_from_flat(data):
    """Parse flat GRID_LUA_FNC_* keys into structured luadocs."""
    suffixes = ("human", "short", "usage", "fnptr", "index", "source")
    groups = {}

    for key, val in data.items():
        m = re.match(
            r"^GRID_LUA_FNC_([A-Z]{1,2})_(.+)_(" + "|".join(suffixes) + r")$",
            key,
        )
        if not m:
            continue
        group, func_id, suffix = m.groups()
        gkey = (group, func_id)
        if gkey not in groups:
            groups[gkey] = {}
        groups[gkey][suffix] = val

    prefix_to_cat = {
        "G": "globals",
        "B": "button",
        "E": "encoder",
        "EP": "endless",
        "P": "potmeter",
        "S": "system",
        "L": "lcd",
    }

    luadocs = {"globals": [], "elements": {}}
    for (group, _), attrs in sorted(groups.items()):
        if "human" not in attrs:
            continue
        entry = {"name": attrs["human"], "short": attrs.get("short", "")}
        if "usage" in attrs:
            entry["usage"] = attrs["usage"]
        if "index" in attrs:
            entry["index"] = int(attrs["index"])

        cat = prefix_to_cat.get(group)
        if cat is None:
            continue
        if cat == "globals":
            luadocs["globals"].append(entry)
        else:
            luadocs["elements"].setdefault(cat, []).append(entry)

    return luadocs


def scaffold_globals(luadocs, dry_run=False):
    """Append new global function stubs to globals.lua."""
    existing_names, _ = parse_existing_functions(GLOBALS_PATH)

    new_stubs = []
    skipped = 0

    for entry in luadocs.get("globals", []):
        name = entry["name"]
        if name in existing_names:
            skipped += 1
            continue
        new_stubs.append(generate_global_stub(entry))

    if new_stubs and not dry_run:
        with open(GLOBALS_PATH, "a") as f:
            f.write("\n")
            f.write(
                "\n---------------------------------------------------------------------------"
            )
            f.write("\n-- Auto-scaffolded stubs (do not edit this header)")
            f.write(
                "\n---------------------------------------------------------------------------"
            )
            for stub in new_stubs:
                f.write(stub)
            f.write("\n")

    return len(new_stubs), skipped


def scaffold_elements(luadocs, dry_run=False):
    """Append new element method stubs to elements.lua."""
    _, class_methods = parse_existing_functions(ELEMENTS_PATH)
    existing_names_all, _ = parse_existing_functions(ELEMENTS_PATH)

    new_stubs = []
    skipped = 0

    for category, entries in luadocs.get("elements", {}).items():
        class_name = CATEGORY_TO_CLASS.get(category)
        if not class_name:
            continue

        existing_for_class = class_methods.get(class_name, set())

        for entry in entries:
            name = entry["name"]
            if name in existing_for_class:
                skipped += 1
                continue
            new_stubs.append(generate_method_stub(class_name, entry))

    if new_stubs and not dry_run:
        # Insert before the final `element = {}` / `self = nil` block if present,
        # or just append at the end.
        with open(ELEMENTS_PATH, "a") as f:
            f.write("\n")
            f.write(
                "\n---------------------------------------------------------------------------"
            )
            f.write("\n-- Auto-scaffolded stubs (do not edit this header)")
            f.write(
                "\n---------------------------------------------------------------------------"
            )
            for stub in new_stubs:
                f.write(stub)
            f.write("\n")

    return len(new_stubs), skipped


def main():
    dry_run = "--dry-run" in sys.argv

    # Ensure annotation directory exists
    os.makedirs(os.path.join(REPO_ROOT, "annotations"), exist_ok=True)

    # Ensure annotation files exist (create empty if missing)
    for path in (GLOBALS_PATH, ELEMENTS_PATH):
        if not os.path.exists(path):
            with open(path, "w") as f:
                f.write("---@meta\n")
            print(f"Created {os.path.relpath(path, REPO_ROOT)}")

    luadocs = load_luadocs(JSON_PATH)

    g_added, g_skipped = scaffold_globals(luadocs, dry_run)
    e_added, e_skipped = scaffold_elements(luadocs, dry_run)

    total_added = g_added + e_added
    total_skipped = g_skipped + e_skipped

    mode = " (dry-run)" if dry_run else ""
    print(f"Globals:  Added {g_added} new stubs. Skipped {g_skipped} existing.{mode}")
    print(f"Elements: Added {e_added} new stubs. Skipped {e_skipped} existing.{mode}")
    print(
        f"Total:    Added {total_added} new stubs. Skipped {total_skipped} existing. "
        f"See [scaffold] markers.{mode}"
    )

    if dry_run and total_added > 0:
        print("\nDry-run stubs that would be added:")
        luadocs = load_luadocs(JSON_PATH)
        existing_globals, _ = parse_existing_functions(GLOBALS_PATH)
        for entry in luadocs.get("globals", []):
            if entry["name"] not in existing_globals:
                print(f"  + {entry['name']}")
        _, class_methods = parse_existing_functions(ELEMENTS_PATH)
        for cat, entries in luadocs.get("elements", {}).items():
            cls = CATEGORY_TO_CLASS.get(cat, cat)
            existing = class_methods.get(cls, set())
            for entry in entries:
                if entry["name"] not in existing:
                    print(f"  + {cls}:{entry['name']}")


if __name__ == "__main__":
    main()
