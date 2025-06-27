export function fixMissingKeyProps(code: string): string {
  // Simple and effective patterns for adding missing key props

  let fixed = code;

  // Pattern 1: Handle JSX in braces - {items.map(item => <li>{item.name}</li>)}
  // This pattern specifically targets the user's case
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<(\w+)([^>]*?)>(.*?)<\/\2>\s*\)/g,
    (match, item, component, props, children) => {
      // Skip if already has key or is interactive element
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }

      // Add key prop
      const keyValue = `{${item}.id || ${item}.key || Math.random()}`;
      const space = props.trim() ? " " : "";
      return `.map(${item} => <${component} key=${keyValue}${space}${props}>${children}</${component}>)`;
    },
  );

  // Pattern 2: Self-closing tags in map
  fixed = fixed.replace(
    /\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*<(\w+)([^>]*?)\/>/g,
    (match, item, component, props) => {
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }

      const keyValue = `{${item}.id || ${item}.key || Math.random()}`;
      const space = props.trim() ? " " : "";
      return `.map(${item} => <${component} key=${keyValue}${space}${props}/>)`;
    },
  );

  // Pattern 3: Map with index parameter
  fixed = fixed.replace(
    /\.map\(\s*\(([^,)]+),\s*([^)]+)\)\s*=>\s*<(\w+)([^>]*?)>(.*?)<\/\3>\s*\)/g,
    (match, item, index, component, props, children) => {
      if (
        props.includes("key=") ||
        match.includes("onClick=") ||
        ["button", "input", "a", "textarea", "form", "select"].includes(
          component,
        )
      ) {
        return match;
      }

      const keyValue = `{${index}}`;
      const space = props.trim() ? " " : "";
      return `.map((${item}, ${index}) => <${component} key=${keyValue}${space}${props}>${children}</${component}>)`;
    },
  );

  return fixed;
}
