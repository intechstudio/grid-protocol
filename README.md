# grid-protocol

Decoder path should be

`~/.local/share/libsigrokdecode/decoders`

## CLI Tools

### Setup

After pulling the repository, install dependencies and build:

```bash
npm install
npm run build
```

### Minify (human-readable → device format)

```bash
node minify.mjs "midi_send(ch, 176, cc, val)" 2>/dev/null
# gms(ch,176,cc,val)
```

### Humanize (device format → human-readable)

```bash
node humanize.mjs "gms(ch,176,cc,val)" 2>/dev/null
# midi_send(ch, 176, cc, val)
```

> Note: Invalid Lua syntax will throw a parse error with the token and position.

> Note: When passing scripts with special characters as shell arguments, use single quotes to avoid shell interpretation: `node minify.mjs 'self:midi_send(-1, -1, -1, -1)'`

> Note: JSON output from the inspect scripts will have special characters escaped (e.g. `"` → `\"`, newline → `\n`). This is expected — parse the JSON before using the strings.

### Inspect protocol data

```bash
node list-modules.mjs 2>/dev/null    # module types and their elements
node list-elements.mjs 2>/dev/null   # element types, events and default configs
node list-functions.mjs 2>/dev/null  # Lua functions grouped by element type
```
