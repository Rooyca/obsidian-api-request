import { parseYaml } from "obsidian";

export const FRONTMATTER_REGEX = /^\n*---[^\n]*\n+(?<fm>.+?)\n+---.*/s;

export type Frontmatter = string | null | undefined;

export function readFrontmatter(md: string) {
  const result = md.match(FRONTMATTER_REGEX);

  return result?.groups?.fm;
}

// throws: MetadataError
export function parseFrontmatter(input: Frontmatter) {
  if (input === undefined || input === null) { 
    throw new Error("No hay frontmatter definido.");
  }

  return parseYaml(input);
}