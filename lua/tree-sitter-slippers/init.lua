local M = {}

local defaults = {
  pattern = "{%%-?%s*#%w",
  priority = 10,
}

function M.setup(opts)
  opts = vim.tbl_deep_extend("force", defaults, opts or {})

  vim.filetype.add({
    pattern = {
      [".*%.html"] = {
        function(_, bufnr)
          local lines = vim.api.nvim_buf_get_lines(bufnr, 0, 10, false)
          if lines[1] == "---" then
            return "slippers"
          end
          for _, line in ipairs(lines) do
            if line:match(opts.pattern) then
              return "slippers"
            end
          end
        end,
        { priority = opts.priority },
      },
    },
  })
end

return M
