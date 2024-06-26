// frontmatter read and parse

import { parseYaml } from "obsidian";

export const FRONTMATTER_REGEX = /^\n*---[^\n]*\n+(?<fm>.+?)\n+---.*/s;

export type Frontmatter = string | null | undefined;

export function readFrontmatter(md: string) {
  const result = md.match(FRONTMATTER_REGEX);

  return result?.groups?.fm;
}

export function parseFrontmatter(input: Frontmatter) {
  if (input === undefined || input === null) { 
    throw new Error("Frontmatter not defined.");
  }

  return parseYaml(input);
}