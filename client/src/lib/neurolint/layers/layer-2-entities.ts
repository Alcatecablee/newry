const HTML_ENTITIES: [RegExp, string][] = [
  // Standard HTML entities (order matters - &amp; should be last to avoid double conversion)
  [/&quot;/g, '"'],
  [/&#x27;/g, "'"],
  [/&apos;/g, "'"],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&amp;/g, "&"], // Must be last to avoid converting already converted entities

  // Currency symbols
  [/&#36;/g, "$"],
  [/&#x24;/g, "$"],
  [/&euro;/g, "€"],
  [/&#8364;/g, "€"],
  [/&#x20AC;/g, "€"],
  [/&pound;/g, "£"],
  [/&#163;/g, "£"],
  [/&yen;/g, "¥"],
  [/&#165;/g, "¥"],
  [/&cent;/g, "¢"],
  [/&#162;/g, "¢"],

  // Typography symbols
  [/&ndash;/g, "–"],
  [/&#8211;/g, "–"],
  [/&mdash;/g, "—"],
  [/&#8212;/g, "—"],
  [/&#8217;/g, "'"],
  [/&lsquo;/g, "'"],
  [/&rsquo;/g, "'"],
  [/&ldquo;/g, '"'],
  [/&rdquo;/g, '"'],
  [/&#8220;/g, '"'],
  [/&#8221;/g, '"'],
  [/&hellip;/g, "…"],
  [/&#8230;/g, "…"],

  // Special characters
  [/&#64;/g, "@"],
  [/&nbsp;/g, " "],
  [/&#160;/g, " "],
  [/&copy;/g, "©"],
  [/&#169;/g, "©"],
  [/&reg;/g, "®"],
  [/&#174;/g, "®"],
  [/&trade;/g, "™"],
  [/&#8482;/g, "™"],
  [/&sect;/g, "§"],
  [/&#167;/g, "§"],
  [/&para;/g, "¶"],
  [/&#182;/g, "¶"],
  [/&bull;/g, "•"],
  [/&#8226;/g, "•"],
  [/&deg;/g, "°"],
  [/&#176;/g, "°"],
  [/&#8209;/g, "-"],

  // Math symbols
  [/&plusmn;/g, "±"],
  [/&#177;/g, "±"],
  [/&times;/g, "×"],
  [/&#215;/g, "×"],
  [/&divide;/g, "÷"],
  [/&#247;/g, "÷"],
  [/&frac14;/g, "¼"],
  [/&frac12;/g, "½"],
  [/&frac34;/g, "¾"],

  // Arrows
  [/&larr;/g, "←"],
  [/&uarr;/g, "↑"],
  [/&rarr;/g, "→"],
  [/&darr;/g, "↓"],
  [/&harr;/g, "↔"],
];

export async function transform(code: string): Promise<string> {
  let transformed = code;

  // Only log in development mode and if there are actual changes
  const isDev = import.meta.env.DEV;

  if (isDev) {
    console.log("Layer 2 - Processing transformation...");
  }

  // Apply HTML entity fixes (primary focus of Layer 2)
  for (const [pattern, replacement] of HTML_ENTITIES) {
    transformed = transformed.replace(pattern, replacement);
  }

  // Additional safe entity fixes
  transformed = fixRemainingEntities(transformed);

  if (isDev && transformed !== code) {
    console.log("Layer 2 - Transformation completed with changes");
  }
  return transformed;
}

function fixRemainingEntities(code: string): string {
  let fixed = code;

  // Handle any remaining HTML entities that might have been missed
  const additionalEntities = [
    // Double-encoded entities
    [/&amp;gt;/g, ">"],
    [/&amp;lt;/g, "<"],
    [/&amp;amp;/g, "&"],
    [/&amp;quot;/g, '"'],
    [/&amp;#39;/g, "'"],
    [/&amp;nbsp;/g, " "],

    // Numeric entities
    [/&#62;/g, ">"],
    [/&#60;/g, "<"],
    [/&#38;/g, "&"],
    [/&#34;/g, '"'],
    [/&#39;/g, "'"],

    // Arrow function specific fixes in JSX context (safe replacements only)
    [/=&gt;/g, "=>"],
    [/&gt;=/g, ">="],
    [/&lt;=/g, "<="],
  ];

  for (const [pattern, replacement] of additionalEntities) {
    fixed = fixed.replace(pattern, replacement);
  }

  return fixed;
}
