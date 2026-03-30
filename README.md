# tree-sitter-slippers

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [Slippers](https://github.com/mixxorz/slippers) component templates.

Based on [tree-sitter-htmldjango](https://github.com/interdependence/tree-sitter-htmldjango), extended with Slippers-specific syntax:

- Block components: `{% #ComponentName %}...{% /ComponentName %}`
- Python front matter: `---` delimited block at the top of `.html` files

## Neovim setup

Neovim 0.10+ has built-in tree-sitter support. `nvim-treesitter` is not required.

### 1. Compile the parser

```sh
git clone https://github.com/mixxorz/tree-sitter-slippers
cd tree-sitter-slippers
cc -o slippers.so -shared -fPIC -Os src/parser.c -Isrc
```

On macOS, use:

```sh
cc -o slippers.so -shared -fPIC -Os src/parser.c -Isrc -undefined dynamic_lookup
```

### 2. Install the parser and queries

```sh
# Copy the compiled parser
cp slippers.so ~/.local/share/nvim/site/parser/

# Copy the query files
mkdir -p ~/.config/nvim/queries/slippers
cp queries/highlights.scm ~/.config/nvim/queries/slippers/
cp queries/injections.scm ~/.config/nvim/queries/slippers/
```

### 3. Filetype detection

Neovim won't automatically know that an `.html` file is a Slippers template. Add this to your config to detect them by content — a file is treated as Slippers if it contains a block component tag (`{% #... %}`) or starts with a front matter delimiter (`---`):

```lua
vim.filetype.add({
  pattern = {
    [".*%.html"] = {
      function(path, bufnr)
        local lines = vim.api.nvim_buf_get_lines(bufnr, 0, 10, false)
        if lines[1] == "---" then
          return "slippers"
        end
        for _, line in ipairs(lines) do
          if line:match("{%%-?%s*#%w") then
            return "slippers"
          end
        end
      end,
      { priority = 10 },
    },
  },
})
```

## Development

```sh
# Regenerate the parser after editing grammar.js
tree-sitter generate

# Run tests
tree-sitter test

# Parse a file
tree-sitter parse path/to/template.html
```
