# Markdown Lecture Notes

## How To

1. Use the Template feature
2. Put your Markdown in the `notes` folder
3. Adjust `settings.json`
4. Add Domain for Github Pages to push to
5. Push your commits

### Local Testing

Running `node .` will compile everything into the compiled folder, so you can test locally.

## Markdown-IT Plugins Used

```json
    ["markdown-it",
    "markdown-it-container",
    "markdown-it-modify-token",
    "markdown-it-abbr",
    "markdown-it-footnote",
    "markdown-it-sup",
    "markdown-it-sub",
    "markdown-it-emoji"]
```


## Limitations

- Cannot deal with nested containers (limitation of [Markdown-IT Container](https://github.com/markdown-it/markdown-it-container))

## Software Used

```json
    "markdown-it": "^13.0.1",
    "markdown-it-container": "^3.0.0",
    "markdown-it-modify-token": "^1.0.2",
    "node-html-parser": "^6.1.1",
    "markdown-it-abbr": "1.0.4",
    "markdown-it-footnote": "3.0.3",
    "markdown-it-sup": "1.0.0",
    "markdown-it-sub": "1.0.0",
    "markdown-it-emoji": "2.0.2",
    "highlight-js": "11.6.0"
```

