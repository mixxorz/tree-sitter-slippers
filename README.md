# tree-sitter-slippers

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [Slippers](https://github.com/mixxorz/slippers) component templates.

Based on [tree-sitter-htmldjango](https://github.com/interdependence/tree-sitter-htmldjango), extended with Slippers-specific syntax:

- Block components: `{% #ComponentName %}...{% /ComponentName %}`
- Component props: `key="value"`, `key=variable`, `boolean_flag`
- Python front matter: `---` delimited block at the top of `.html` files

## Neovim setup

Register the parser and queries with [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter):

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.slippers = {
  install_info = {
    url = "https://github.com/mixxorz/tree-sitter-slippers",
    files = { "src/parser.c" },
    branch = "main",
  },
  filetype = "slippers",
}
```

Then install the parser:

```
:TSInstall slippers
```

### Filetype detection

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
