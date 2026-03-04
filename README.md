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
# Inline script
node minify.mjs "midi_send(ch, 176, cc, val)" 2>/dev/null

# From a file
node minify.mjs path/to/script.lua 2>/dev/null
```

Example output:

```
gms(ch,176,cc,val)
```

### Humanize (device format → human-readable)

```bash
# Inline script
node humanize.mjs "gms(ch,176,cc,val)" 2>/dev/null

# From a file
node humanize.mjs path/to/script.lua 2>/dev/null
```

Example output:

```
midi_send(ch, 176, cc, val)
```

> Note: Invalid Lua syntax will throw a parse error with the token and position.
