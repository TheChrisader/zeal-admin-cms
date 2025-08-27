const voidElements: Set<string> = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

type AttributeMap = Record<string, string>;
export type HTMLNode = VNode | TextNode;

class VNode {
  tagName: string;
  attributes: AttributeMap;
  children: HTMLNode[];
  parent: VNode | null;
  type: "V_NODE";

  constructor(
    tagName: string,
    attributes: AttributeMap = {},
    children: HTMLNode[] = []
  ) {
    this.tagName = tagName;
    this.attributes = attributes;
    this.children = children;
    this.parent = null;
    this.type = "V_NODE";
  }

  query(selector: string): VNode | null {
    if (this.matches(selector)) return this;
    for (const child of this.children) {
      if (child instanceof VNode) {
        const found = child.query(selector);
        if (found) return found;
      }
    }
    return null;
  }

  queryAll(selector: string, results: VNode[] = []): VNode[] {
    if (this.matches(selector)) results.push(this);
    for (const child of this.children) {
      if (child instanceof VNode) child.queryAll(selector, results);
    }
    return results;
  }

  matches(selector: string): boolean | null {
    if (!selector) return false;

    if (selector.includes(" ") || selector.includes(">")) {
      const tokens = selector
        .split(/\s*(>| )\s*/)
        .filter((token) => token.trim() !== "");
      //   let currentSelector = tokens.pop();
      const lastToken = tokens.pop();
      if (!lastToken || !this.matches(lastToken)) {
        return false;
      }
      let currentElement: VNode | null = this.parent;
      let currentPartIndex = tokens.length - 1;
      while (currentElement && currentPartIndex >= 0) {
        // currentSelector = tokens[currentPartIndex];
        if (tokens[currentPartIndex] === ">") {
          currentPartIndex--;
          if (
            !currentElement ||
            !currentElement.matches(tokens[currentPartIndex]!)
          ) {
            return false;
          }
          currentElement = currentElement.parent;
        } else {
          if (
            tokens[currentPartIndex] &&
            currentElement.matches(tokens[currentPartIndex]!)
          ) {
            currentPartIndex--;
          }
          currentElement = currentElement.parent;
        }
      }
      return currentPartIndex === -1;
    }

    const parentMatch = selector.match(/:\(([^)]+)\)/);
    if (parentMatch) {
      const parentSelector = parentMatch[1];
      if (!parentSelector) return false;
      const remainingSelector = selector.replace(parentMatch[0], "");
      // Check remaining part of the selector on current element and parent part on parent
      const currentMatches = remainingSelector
        ? this.matches(remainingSelector)
        : true;
      return (
        currentMatches && this.parent && this.parent.matches(parentSelector)
      );
    }

    const parts = selector.split(/(?=[#.\[])/g);

    let tag = "";
    let id = "";
    const classes: string[] = [];
    const attributes: string[] = [];

    let i = 0;

    // Extract tag name if present
    if (
      parts.length > 0 &&
      !["#", ".", "["].includes(parts[0]?.[0] as string)
    ) {
      tag = parts[i] as string;
      i++;
    }

    // Process remaining parts for id, classes, and attributes
    for (; i < parts.length; i++) {
      const part = parts[i];
      if (part?.startsWith("#")) {
        if (id) return false; // Only one id allowed
        id = part.slice(1);
      } else if (part?.startsWith(".")) {
        classes.push(part.slice(1));
      } else if (part?.startsWith("[")) {
        attributes.push(part.slice(1, -1)); // Remove brackets
      } else {
        return false; // Invalid selector part
      }
    }

    // Check tag match
    if (tag && this.tagName !== tag) return false;

    // Check id match
    if (id && this.attributes.id !== id) return false;

    // Check class matches
    const elemClasses = this.attributes.class
      ? this.attributes.class.split(/\s+/)
      : [];
    if (classes.some((cls) => !elemClasses.includes(cls))) return false;

    // Check attribute selectors
    for (const attrPart of attributes) {
      const match = attrPart.match(
        /^([^\s=]+)(?:(~=|\|=|\^=|\$=|\*=|=)(['"]?)([^'"]*)\3)?$/
      );
      if (!match) return false;

      const [_, attrName, operator, , value] = match;
      if (!attrName || !value) return false;
      const attrValue = this.attributes[attrName];

      if (operator) {
        if (attrValue === undefined) return false;
        switch (operator) {
          case "=":
            if (attrValue !== value) return false;
            break;
          case "~=":
            if (!attrValue.split(/\s+/).includes(value)) return false;
            break;
          case "|=":
            if (attrValue !== value && !attrValue.startsWith(value + "-"))
              return false;
            break;
          case "^=":
            if (!attrValue.startsWith(value)) return false;
            break;
          case "$=":
            if (!attrValue.endsWith(value)) return false;
            break;
          case "*=":
            if (!attrValue.includes(value)) return false;
            break;
          default:
            return false;
        }
      } else if (attrValue === undefined) {
        return false; // Attribute existence check
      }
    }

    return true;
  }

  // Attribute methods
  getAttr(name: string): string | undefined {
    return this.attributes[name.toLowerCase()];
  }

  setAttr(name: string, value: string): this {
    this.attributes[name.toLowerCase()] = value;
    return this;
  }

  removeAttr(name: string): this {
    delete this.attributes[name.toLowerCase()];
    return this;
  }

  // Class methods
  hasClass(className: string): boolean {
    return (this.attributes.class || "").split(/\s+/).includes(className);
  }

  addClass(className: string): this {
    const classes = new Set((this.attributes.class || "").split(/\s+/));
    classes.add(className);
    this.attributes.class = [...classes].join(" ").trim();
    return this;
  }

  removeClass(className: string): this {
    const classes = (this.attributes.class || "")
      .split(/\s+/)
      .filter((c) => c !== className);
    this.attributes.class = classes.join(" ").trim();
    if (!this.attributes.class) delete this.attributes.class;
    return this;
  }

  // Node manipulation
  append(node: HTMLNode): this {
    if (node.parent) node.remove();
    node.parent = this;
    this.children.push(node);
    return this;
  }

  prepend(node: HTMLNode): this {
    if (node.parent) node.remove();
    node.parent = this;
    this.children.unshift(node);
    return this;
  }

  remove(): this {
    if (this.parent) {
      this.parent.children = this.parent.children.filter(
        (child) => child !== this
      );
      this.parent = null;
    }
    return this;
  }

  empty(): this {
    this.children.forEach((child) => (child.parent = null));
    this.children = [];
    return this;
  }

  // Content methods
  text(): string;
  text(content: string): this;
  text(content?: string): string | this {
    if (content === undefined) {
      return this.children
        .map((child) => (child instanceof TextNode ? child.content : ""))
        .join("");
    }
    this.empty().append(new TextNode(content));
    return this;
  }

  innerHtml(): string {
    return this.children.map((child) => child.toString()).join("");
  }

  toString(): string {
    const isSelfClosing = voidElements.has(this.tagName.toLowerCase());

    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => ` ${k}="${v}"`)
      .join("");

    const children = this.children.map((c) => c.toString()).join("");

    return isSelfClosing
      ? `<${this.tagName}${attrs} />`
      : `<${this.tagName}${attrs}>${children}</${this.tagName}>`;
  }
}

class TextNode {
  content: string;
  parent: VNode | null;
  type: "TEXT_NODE";

  constructor(content = "") {
    this.content = content;
    this.parent = null;
    this.type = "TEXT_NODE";
  }

  text(): string;
  text(content: string): this;
  text(content?: string): string | this {
    if (content !== undefined) {
      this.content = content;
      return this;
    }
    return this.content;
  }

  remove(): this {
    if (this.parent) {
      this.parent.children = this.parent.children.filter(
        (child) => child !== this
      );
      this.parent = null;
    }
    return this;
  }

  toString(): string {
    return this.content;
  }
}

interface StartTagToken {
  type: "startTag";
  tagName: string;
  attributes: AttributeMap;
  selfClosing: boolean;
}

interface EndTagToken {
  type: "endTag";
  tagName: string;
}

interface TextToken {
  type: "text";
  content: string;
}

type Token = StartTagToken | EndTagToken | TextToken;

export class HTMLParser {
  parse(html: string): VNode {
    const root = new VNode("root", {}, []);
    const stack: VNode[] = [root];
    const tokens = this.tokenize(html);
    console.log(tokens, "TOKJENSSSSSSSS");

    for (const token of tokens) {
      const currentParent = stack[stack.length - 1];

      if (!currentParent) {
        throw new Error("Invalid HTML structure");
      }

      if (token.type === "text") {
        if (token.content.trim()) {
          const textNode = new TextNode(token.content);
          textNode.parent = currentParent;
          currentParent.children.push(textNode);
        }
      } else if (token.type === "startTag") {
        const node = new VNode(
          token.tagName.toLowerCase(),
          token.attributes,
          []
        );
        node.parent = currentParent;
        currentParent.children.push(node);

        if (!token.selfClosing) {
          stack.push(node);
        }
      } else if (token.type === "endTag") {
        stack.pop();
      }
    }

    // if (stack.length > 1) {
    //   throw new Error("Invalid HTML structure");
    // }

    if (stack.length === 0) {
      throw new Error("Invalid HTML structure");
    }

    if (root.children.length === 1 && root.children[0]?.type === "V_NODE") {
      return root.children[0];
    } else {
      return root;
    }

    // return root.children.length === 1 ? (root.children[0] as HTMLNode) : root;
  }

  tokenize(html: string): Token[] {
    const tokens: Token[] = [];
    const tagRegex = /<\/?([^\s/>]+)([^>]*?)\/?>|([^<]+)/g;
    let match;
    let lastIndex = 0;

    while ((match = tagRegex.exec(html))) {
      const [fullMatch, tagName, attrStr, textContent] = match;
      const index = match.index;

      //   if (!attrStr) {
      //     continue;
      //   }

      // Handle text content
      if (index > lastIndex) {
        const text = html.slice(lastIndex, index);
        if (text.trim()) {
          tokens.push({ type: "text", content: text });
        }
      }

      if (textContent) {
        // Text node
        tokens.push({ type: "text", content: textContent });
      } else if (tagName) {
        // HTML tag
        const isEndTag = fullMatch.startsWith("</");
        const isSelfClosing =
          fullMatch.endsWith("/>") || voidElements.has(tagName.toLowerCase());

        if (isEndTag) {
          tokens.push({
            type: "endTag",
            tagName: tagName.toLowerCase(),
          });
        } else {
          tokens.push({
            type: "startTag",
            tagName: tagName.toLowerCase(),
            attributes: this.parseAttributes(attrStr || ""),
            selfClosing: isSelfClosing,
          });
        }
      }

      lastIndex = tagRegex.lastIndex;
    }

    return tokens;
  }

  parseAttributes(attrStr: string): AttributeMap {
    const attrs: AttributeMap = {};
    const attrRegex = /([^\s=]+)(?:=(["'])(.*?)\2|(=?)|$)/g;
    let match;

    while ((match = attrRegex.exec(attrStr.trim()))) {
      const [_, name, , value] = match;
      if (name) {
        attrs[name.toLowerCase()] = value !== undefined ? value : "";
      }
    }

    return attrs;
  }
}

// Usage example:
// const parser = new HTMLParser();
// const dom = parser.parse(
//   '<div class="menu"><em>Tr</em><li>Item 1<em>Yo</em></li><li attr="nooo">Item 2</li><img src="image.png" alt="Example Image" /><ul><li>Item 1<em>Yo</em></li><li><p>Item 2</p></li></ul></div>'
// );
// console.log(dom.toString());

// Querying
// const menu = dom.query(".menu");
// menu.addClass("dark-mode").setAttr("id", "main-menu");
// console.log(dom.toString());

// Modification
// const newItem = new VNode("li").text("New Item");
// menu.append(newItem);
// console.log(dom.toString());

// dom.queryAll("li").forEach((n, i) => {
//   console.log(n.toString(), i);
// });
// console.log(...dom.queryAll("ul :(li)")?.map((n) => n.toString()));

// Removal
// dom.query("li").remove();

// HTML output
// console.log(dom.innerHtml());
// Outputs: <div class="menu dark-mode" id="main-menu"><li>Item 2</li><li>New Item</li></div>

export function fixMalformedHtml(html: string): string {
  const voidElements: Set<string> = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  const stack: string[] = [];
  let output = "";
  const parts = html.split(/(<[^>]+>)/);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith("<")) {
      const tag = processTag(part);
      if (tag.isClosing) {
        handleClosingTag(tag.name as string);
      } else if (tag.isSelfClosing) {
        output += tag.original;
        if (!tag.isVoid) output += `</${tag.name}>`;
      } else {
        stack.push(tag.name as string);
        output += tag.original;
      }
    } else {
      output += part;
    }
  }

  // Close remaining tags
  while (stack.length > 0) {
    const tag = stack.pop();
    if (tag) {
      output += `</${tag}>`;
    }
  }

  return output;

  function processTag(tagStr: string) {
    const closingMatch = tagStr.match(/^<\/([a-z]+)/i);
    if (closingMatch) {
      return {
        isClosing: true,
        name: closingMatch[1]?.toLowerCase(),
        original: tagStr,
        isSelfClosing: false,
        isVoid: false,
      };
    }

    const openingMatch = tagStr.match(/^<([a-z]+)/i);
    if (!openingMatch)
      return {
        isClosing: false,
        isSelfClosing: false,
        isVoid: false,
        name: "",
        original: tagStr,
      };

    const name = openingMatch[1] as string;
    const lowerName = name.toLowerCase();
    const isSelfClosing = tagStr.endsWith("/>") || voidElements.has(lowerName);
    const isVoid = voidElements.has(lowerName);

    // Handle non-void self-closing tags
    let processedTag = tagStr;
    if (isSelfClosing && !isVoid && tagStr.endsWith("/>")) {
      processedTag = tagStr.replace(/\/>$/, ">");
    }

    return {
      isClosing: false,
      isSelfClosing,
      isVoid,
      name: lowerName,
      original: processedTag,
    };
  }

  function handleClosingTag(tagName: string) {
    let foundIndex = -1;
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i]?.toLowerCase() === tagName) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      const toClose = stack.splice(foundIndex);
      for (const tag of toClose.reverse()) {
        output += `</${tag}>`;
      }
    }
  }
}

// console.time("ds");
// const parser = new HTMLParser();
// parser.parse(fixMalformedHtml(html));
// console.timeEnd("ds");

export const getParsedDocument = (html: string): VNode => {
  const parser = new HTMLParser();
  return parser.parse(fixMalformedHtml(html));
};

export const getTokens = (html: string): Token[] => {
  const parser = new HTMLParser();
  return parser.tokenize(fixMalformedHtml(html));
};
