#!/usr/bin/env python3
"""Enrich luadocs entries in grid_protocol_bot.json with usage strings
parsed from the LuaCATS annotation files.

For any luadocs entry that is MISSING a "usage" field, this script
generates one from the corresponding annotation stub in
annotations/globals.lua or annotations/elements.lua.

Entries that ALREADY have a "usage" field (e.g. from firmware _usage
macros) are left untouched — firmware documentation takes precedence.

Usage:
    python3 scripts/enrich_luadocs.py           # apply
    python3 scripts/enrich_luadocs.py --dry-run  # preview only
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


def parse_annotations(filepath):
    """Parse a LuaCATS annotation file and return a dict of
    function_name -> usage_string.

    For global functions: key = function_name
    For methods: key = (ClassName, method_name)

    The usage string is built in the firmware _usage format:
        "human_name(type param, ...) Description."
    """
    if not os.path.exists(filepath):
        return {}

    with open(filepath, "r") as f:
        content = f.read()

    results = {}

    # Split into blocks: each function declaration with its preceding doc comments
    # Pattern: consecutive ---lines followed by function declaration
    blocks = re.findall(
        r"((?:---[^\n]*\n)+)function\s+(?:(\w+):)?(\w+)\s*\(([^)]*)\)\s*end",
        content,
    )

    for doc_block, class_name, func_name, params_raw in blocks:
        # Parse the doc block
        lines = doc_block.strip().split("\n")

        description_parts = []
        params = []
        returns = []

        for line in lines:
            line = line.strip()
            # @param name type description
            m = re.match(r"^---@param\s+(\w+\??)\s+(\S+)\s*(.*)", line)
            if m:
                param_name = m.group(1).rstrip("?")
                param_type = m.group(2)
                params.append((param_name, param_type))
                continue

            # @return type name description
            m = re.match(r"^---@return\s+(\S+)\s*(.*)", line)
            if m:
                return_type = m.group(1)
                return_desc = m.group(2).strip()
                returns.append((return_type, return_desc))
                continue

            # @field, @class, @type — skip
            if re.match(r"^---@", line):
                continue

            # Description line
            m = re.match(r"^---(.*)$", line)
            if m:
                desc = m.group(1).strip()
                if desc:
                    description_parts.append(desc)

        # Build the usage string in firmware format:
        # "func_name(type param, type param, ...) Description."
        param_strs = []
        for pname, ptype in params:
            lua_type = _normalize_type(ptype)
            param_strs.append(f"{lua_type} {pname}")

        description = " ".join(description_parts)

        # Add return info to description if present
        if returns:
            ret_parts = []
            for rtype, rdesc in returns:
                if rdesc:
                    ret_parts.append(f"Returns {rdesc} ({rtype}).")
                else:
                    ret_parts.append(f"Returns {rtype}.")
            if description:
                description = description.rstrip(".")
                description += ". " + " ".join(ret_parts)
            else:
                description = " ".join(ret_parts)

        # Build prefix for method calls
        if class_name:
            prefix = f"self:{func_name}"
        else:
            prefix = func_name

        usage = f"{prefix}({', '.join(param_strs)}) {description}".strip()

        # Store in results
        if class_name:
            results[(class_name, func_name)] = usage
        else:
            results[func_name] = usage

    return results


def _normalize_type(lua_type):
    """Convert LuaCATS types to simple type names for usage strings."""
    # Remove optional markers and unions for display
    t = lua_type.replace("?", "")
    # Simplify common patterns
    if "|" in t:
        # e.g. "integer|false" -> "integer"
        parts = t.split("|")
        t = parts[0]
    if t == "integer[]":
        t = "table"
    if t.startswith("{"):
        t = "table"
    return t


def enrich_luadocs(json_path, globals_annots, elements_annots, dry_run=False):
    """Update luadocs entries with usage strings from annotations."""
    with open(json_path) as f:
        data = json.load(f)

    if "luadocs" not in data:
        print("No luadocs key in JSON. Run extract/scaffold first.")
        return 0

    luadocs = data["luadocs"]
    enriched_count = 0

    # Enrich globals
    for entry in luadocs.get("globals", []):
        if "usage" in entry and entry["usage"]:
            continue  # firmware _usage takes precedence
        name = entry["name"]
        if name in globals_annots:
            entry["usage"] = globals_annots[name]
            enriched_count += 1

    # Enrich elements
    for category, entries in luadocs.get("elements", {}).items():
        class_name = CATEGORY_TO_CLASS.get(category)
        if not class_name:
            continue
        for entry in entries:
            if "usage" in entry and entry["usage"]:
                continue  # firmware _usage takes precedence
            name = entry["name"]
            key = (class_name, name)
            if key in elements_annots:
                entry["usage"] = elements_annots[key]
                enriched_count += 1
            else:
                # Try inherited: check ElementBase
                base_key = ("ElementBase", name)
                if base_key in elements_annots:
                    entry["usage"] = elements_annots[base_key]
                    enriched_count += 1

    if not dry_run and enriched_count > 0:
        with open(json_path, "w") as f:
            json.dump(data, f, indent=2)
            f.write("\n")

    return enriched_count


def main():
    dry_run = "--dry-run" in sys.argv

    globals_annots = parse_annotations(GLOBALS_PATH)
    elements_annots = parse_annotations(ELEMENTS_PATH)

    print(f"Parsed {len(globals_annots)} global annotations")
    print(
        f"Parsed {len(elements_annots)} element annotations"
    )

    enriched = enrich_luadocs(JSON_PATH, globals_annots, elements_annots, dry_run)

    mode = " (dry-run)" if dry_run else ""
    print(f"Enriched {enriched} entries with usage strings.{mode}")

    if dry_run and enriched > 0:
        # Show what would be added
        with open(JSON_PATH) as f:
            data = json.load(f)
        luadocs = data["luadocs"]
        print("\nEntries that would gain usage:")
        for entry in luadocs.get("globals", []):
            if "usage" not in entry or not entry["usage"]:
                name = entry["name"]
                if name in globals_annots:
                    print(f"  + {name}: {globals_annots[name][:80]}...")
        for cat, entries in luadocs.get("elements", {}).items():
            cls = CATEGORY_TO_CLASS.get(cat, cat)
            for entry in entries:
                if "usage" not in entry or not entry["usage"]:
                    name = entry["name"]
                    key = (cls, name)
                    base_key = ("ElementBase", name)
                    usage = elements_annots.get(key) or elements_annots.get(base_key)
                    if usage:
                        print(f"  + {cls}:{name}: {usage[:80]}...")


if __name__ == "__main__":
    main()
