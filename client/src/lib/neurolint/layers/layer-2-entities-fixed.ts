const HTML_ENTITIES: [RegExp, string][] = [
  [/&quot;/g, '"'],
  [/&#x27;/g, "'"],
  [/&apos;/g, "'"],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&amp;/g, "&"],
];

export async function transform(code: string): Promise<string> {
  let transformed = code;

  const isDev = import.meta.env.DEV;

  if (isDev) {
    console.log("Layer 2 - Processing transformation...");
  }

  // ONLY HTML entity fixes - nothing else
  for (const [pattern, replacement] of HTML_ENTITIES) {
    transformed = transformed.replace(pattern, replacement);
  }

  if (isDev && transformed !== code) {
    console.log("Layer 2 - Transformation completed with changes");
  }
  return transformed;
}
