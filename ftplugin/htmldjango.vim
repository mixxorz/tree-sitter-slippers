" If htmldjango was detected but the file contains a Slippers block component
" tag ({% #... %}) within the first 40 lines, promote to slippers filetype.
if search('{%-\?\s*#\w', 'nw', 40)
  set ft=slippers
endif
