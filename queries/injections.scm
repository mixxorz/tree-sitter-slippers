; Inject HTML into non-template content regions
((content) @injection.content
 (#set! injection.language "html")
 (#set! injection.combined))

; Inject Python into front matter, skipping the opening and closing "---" lines
((front_matter) @injection.content
 (#set! injection.language "python")
 (#set! injection.include-children)
 (#offset! @injection.content 1 0 -1 0))
