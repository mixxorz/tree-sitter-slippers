# tree-sitter-slippers

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [Slippers](https://github.com/mixxorz/slippers) component templates.

Based on [tree-sitter-htmldjango](https://github.com/interdependence/tree-sitter-htmldjango), extended with Slippers-specific syntax:

- Block components: `{% #ComponentName %}...{% /ComponentName %}`
- Inline components: `{% ComponentName %}`
- Component props: `key="value"`, `key=variable`, `boolean_flag`
- Python front matter: `---` delimited block at the top of `.html` files

## Usage

```
npm install tree-sitter-slippers
```

For Neovim, add the parser via [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter).

## Development

```sh
# Regenerate the parser after editing grammar.js
tree-sitter generate

# Run tests
tree-sitter test

# Parse a file
tree-sitter parse path/to/template.html
```
