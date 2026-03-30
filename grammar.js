/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Based on tree-sitter-htmldjango (https://github.com/interdependence/tree-sitter-htmldjango)
// Extended with Slippers-specific component tag syntax.

module.exports = grammar({
  name: "slippers",

  word: $ => $._identifier,

  rules: {
    template: $ => seq(
      optional($.front_matter),
      repeat($._node),
    ),

    // Optional Python front matter block at the top of Slippers component files:
    //   ---
    //   props.types = {"label": str}
    //   ---
    // Matched as a single token with higher precedence than content so it
    // wins at position 0. The entire node (including delimiters) is injected
    // as Python; editors can use #offset! to skip the delimiter lines.
    //
    // The content regex matches any line that is not exactly "---":
    // each line is either empty, starts with a non-dash, or starts with
    // one/two dashes but not three.
    front_matter: $ => token(prec(1, seq(
      "---\n",
      /([^-\n][^\n]*\n|-[^-\n][^\n]*\n|--[^-\n][^\n]*\n|-\n|--\n|\n)*/,
      "---\n",
    ))),

    _node: $ => choice(
      $._expression,
      $._statement,
      $._comment,
      $.content
    ),

    // ---- Copied verbatim from tree-sitter-htmldjango ----

    keyword: $ => token(seq(
      choice(
        "on",
        "off",
        "with",
        "as",
        "silent",
        "only",
        "from",
        "random",
        "by"
      ),
      /\s/
    )),
    keyword_operator: $ => token(seq(
      choice(
        "and",
        "or",
        "not",
        "in",
        "not in",
        "is",
        "is not"
      ),
      /\s/
    )),
    operator: $ => choice("==", "!=", "<", ">", "<=", ">="),
    number: $ => /[0-9]+/,
    boolean: $ => choice("True", "False"),
    string: $ => seq(
      choice(
        seq("'", repeat(choice(/[^'\\]/, /\\./)), "'"),
        seq('"', repeat(choice(/[^"\\]/, /\\./)), '"')
      ),
      repeat(seq("|", $.filter))
    ),

    _identifier: $ => /\w+/,

    // Expressions
    _expression: $ => seq("{{", choice($.variable, $.string), "}}"),

    variable: $ => seq($.variable_name, repeat(seq("|", $.filter))),
    variable_name: $ => /[a-zA-Z](\w+)?((\.?\w)+)?/,

    filter: $ => seq($.filter_name, optional(seq(":", choice($.filter_argument, $._quoted_filter_argument)))),
    filter_name: $ => $._identifier,
    filter_argument: $ => seq($._identifier, repeat(seq(".", $._identifier))),
    _quoted_filter_argument: $ => choice(
      seq("'", alias(repeat(choice(/[^'\\]/, /\\./)), $.filter_argument), "'"),
      seq('"', alias(repeat(choice(/[^"\\]/, /\\./)), $.filter_argument), '"')
    ),

    // Statements
    _statement: $ => choice(
      // Slippers-specific (checked before unpaired_statement to take priority)
      $.component_block,
      // Django/Jinja2 (from htmldjango)
      $.paired_statement,
      alias($.if_statement, $.paired_statement),
      alias($.for_statement, $.paired_statement),
      alias($.filter_statement, $.paired_statement),
      $.unpaired_statement
    ),

    paired_statement: $ => {
      const tag_names = [
        "autoescape",
        "block",
        "blocktranslate",
        "ifchanged",
        "spaceless",
        "verbatim",
        "with"
      ];

      return choice(...tag_names.map((tag_name) => seq(
        "{%", alias(tag_name, $.tag_name), repeat($._attribute), "%}",
        repeat($._node),
        "{%", alias("end" + tag_name, $.tag_name), repeat($._attribute), alias("%}", $.end_paired_statement))));
    },

    if_statement: $ => seq(
      "{%", alias("if", $.tag_name), repeat($._attribute), "%}",
      repeat($._node),
      repeat(prec.left(seq(
        alias($.elif_statement, $.branch_statement),
        repeat($._node),
      ))),
      optional(seq(
        alias($.else_statement, $.branch_statement),
        repeat($._node),
      )),
      "{%", alias("endif", $.tag_name), alias("%}", $.end_paired_statement)
    ),
    elif_statement: $ => seq("{%", alias("elif", $.tag_name), repeat($._attribute), "%}"),
    else_statement: $ => seq("{%", alias("else", $.tag_name), "%}"),

    for_statement: $ => seq(
      "{%", alias("for", $.tag_name), repeat($._attribute), "%}",
      repeat($._node),
      optional(seq(
        alias($.empty_statement, $.branch_statement),
        repeat($._node),
      )),
      "{%", alias("endfor", $.tag_name), alias("%}", $.end_paired_statement)
    ),
    empty_statement: $ => seq("{%", alias("empty", $.tag_name), repeat($._attribute), "%}"),

    filter_statement: $ => seq(
      "{%", alias("filter", $.tag_name), $.filter, repeat(seq("|", $.filter)), "%}",
      repeat($._node),
      "{%", alias("endfilter", $.tag_name), alias("%}", $.end_paired_statement)
    ),
    unpaired_statement: $ => seq("{%", alias($._identifier, $.tag_name), repeat($._attribute), "%}"),

    _attribute: $ => seq(
      choice(
        $.keyword,
        $.operator,
        $.keyword_operator,
        $.number,
        $.boolean,
        $.string,
        $.variable
      ),
      optional(choice(",", "="))
    ),

    // Comments
    _comment: $ => choice(
      $.unpaired_comment,
      $.paired_comment
    ),
    unpaired_comment: $ => seq("{#", repeat(/.|\s/), repeat(seq(alias($.unpaired_comment, ""), repeat(/.|\s/))), "#}"),
    paired_comment: $ => seq(
      alias("{%", ""), "comment", optional($._identifier), alias("%}", ""),
      repeat(/.|\s/),
      repeat(seq(alias($.paired_comment, ""), repeat(/.|\s/))),
      alias("{%", ""), "endcomment", alias("%}", "")
    ),

    // All other content
    content: $ => /([^\{]|\{[^{%#])+/,

    // ---- Slippers extensions ----

    // Block component: {% #name prop="val" %}...{% /name %}
    // The "#" and "/" sigils unambiguously identify block components regardless
    // of name casing (lowercase, snake_case, or PascalCase are all valid).
    // Supports optional "as varname" to capture rendered output as a variable.
    component_block: $ => seq(
      "{%", "#", $.component_name, repeat($._component_attribute),
      optional(seq("as", alias($._identifier, $.capture_var))),
      "%}",
      repeat($._node),
      "{%", "/", $.component_name, "%}",
    ),

    // Block component names accept any valid identifier (disambiguation comes
    // from the "#" and "/" sigils).
    component_name: $ => $._identifier,

    // Component attributes support:
    //   key="value"    key=variable    bare_flag
    // Prop names can include framework chars: x-bind:class  @click  aria-label
    _component_attribute: $ => choice(
      seq(alias($._prop_name, $.prop_name), "=", $._prop_value),
      alias($._prop_name, $.prop_name),
    ),

    _prop_name: $ => /[a-zA-Z_@][\w\-:@]*/,

    _prop_value: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.variable,
    ),
  },
});
