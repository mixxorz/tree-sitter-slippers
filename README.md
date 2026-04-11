# tree-sitter-slippers

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [Slippers](https://github.com/mixxorz/slippers) component templates.

Based on [tree-sitter-htmldjango](https://github.com/interdependence/tree-sitter-htmldjango), extended with Slippers-specific syntax:

- Block components: `{% #ComponentName %}...{% /ComponentName %}`
- Python front matter: `---` delimited block at the top of `.html` files

## Neovim setup

### With lazy.nvim (recommended)

```lua
{
  "mixxorz/tree-sitter-slippers",
  build = "make",
}
```

lazy.nvim will clone the repo, run `make` to compile the parser, and add the plugin to the runtimepath. Filetype detection runs automatically — no additional config needed.

#### Customising filetype detection

The plugin detects `.html` files as Slippers templates when the first 10 lines contain a block component tag (`{% #... %}`) or when line 1 is `---` (Python front matter delimiter).

To customise or disable automatic setup:

```lua
{
  "mixxorz/tree-sitter-slippers",
  build = "make",
  init = function()
    vim.g.slippers_disable_auto_setup = true
  end,
  config = function()
    require("tree-sitter-slippers").setup({
      priority = 20,  -- override filetype detection priority (default: 10)
    })
  end,
}
```

### Manual installation (without a plugin manager)

<details>
<summary>Expand instructions</summary>

#### 1. Clone into a Neovim pack directory

```sh
git clone https://github.com/mixxorz/tree-sitter-slippers \
  ~/.local/share/nvim/site/pack/plugins/start/tree-sitter-slippers
```

#### 2. Compile the parser

```sh
cd ~/.local/share/nvim/site/pack/plugins/start/tree-sitter-slippers
make
```

Neovim will automatically find `parser/slippers.so` and `queries/slippers/` from the pack directory.

</details>

## Development

```sh
# Regenerate the parser after editing grammar.js
tree-sitter generate

# Run tests
tree-sitter test

# Parse a file
tree-sitter parse path/to/template.html

# Build the Neovim parser
make

# Remove the built parser
make clean
```
