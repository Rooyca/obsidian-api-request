/**
 * Utilities for reading and parsing frontmatter from markdown files
 */

import { parseYaml } from "obsidian";

/** Regular expression to extract frontmatter content from markdown */
export const FRONTMATTER_REGEX = /^\n*---[^\n]*\n+(?<fm>.+?)\n+---.*/s;

/** Type definition for frontmatter content */
export type Frontmatter = string | null | undefined;

/**
 * Extracts frontmatter content from markdown text
 * 
 * @param md - The markdown content to extract frontmatter from
 * @returns The frontmatter content string, or undefined if not found
 */
export function readFrontmatter(md: string) {
  const result = md.match(FRONTMATTER_REGEX);

  return result?.groups?.fm;
}

/**
 * Parses frontmatter YAML content into an object
 * 
 * @param input - The frontmatter content to parse
 * @returns Parsed frontmatter object
 * @throws Error if frontmatter is not defined or cannot be parsed
 */
export function parseFrontmatter(input: Frontmatter) {
  if (input === undefined || input === null) { 
    throw new Error("Frontmatter not defined.");
  }

  return parseYaml(input);
}