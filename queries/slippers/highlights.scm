; Comments
[
  (unpaired_comment)
  (paired_comment)
] @comment

; Template delimiters
[
  "{{"
  "}}"
  "{%"
  "%}"
  (end_paired_statement)
] @punctuation.bracket

; Django tag names
(tag_name) @keyword

; Slippers component names
(component_name) @type

; Slippers prop names
(prop_name) @property

; Variables and filters
(variable_name) @variable
(filter_name) @function.method
(filter_argument) @variable.parameter

; Keywords and operators
(keyword) @keyword
(keyword_operator) @keyword.operator
(operator) @operator

; Literals
(number) @number
(boolean) @boolean
(string) @string

; Front matter block
(front_matter) @embedded
