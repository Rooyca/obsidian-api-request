// Matches a specific pattern inside curly braces: {number1..number2}
export const num_braces_regx = /{(\d+)\.\.(\d+)}/;

// Matches a pattern of digits separated by hyphens, e.g., 1-2-3-4
export const num_hyphen_regx = /(\d+-)+\d+/;

// Matches any sequence of digits, globally.
export const nums_rex = /\d+/g;

// Matches anything inside curly braces, non-greedy, globally.
export const in_braces_regx = /{.*?}/g;

// Matches any text inside double curly braces, preceded by "{{this." and followed by "}}"
export const varname_regx = /{{this\.([^{}]*)}}/g;

// Matches "{{this." or "}}" globally
export const no_varname_regx = /{{this\.|}}/g;
