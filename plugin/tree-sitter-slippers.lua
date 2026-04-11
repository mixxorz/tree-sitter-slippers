if vim.g.slippers_disable_auto_setup then
  return
end

require("tree-sitter-slippers").setup()
