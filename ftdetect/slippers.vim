" Detect Slippers templates: files starting with '---' front matter AND
" containing a block component tag ({% #... %}) within the first 40 lines.
au BufNewFile,BufRead *.html
  \ if getline(1) == '---' && search('{%-\?\s*#\w', 'nw', 40) |
  \   set ft=slippers |
  \ endif
