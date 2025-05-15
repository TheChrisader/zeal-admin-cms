/**
 * HTML Formatter Library
 *
 * A TypeScript library to format HTML strings similar to prettier
 * for improved readability in input fields.
 */

/**
 * Configuration options for HTML formatting
 */
export interface HTMLFormatterOptions {
  indent: number; // Number of spaces for each indentation level
  maxLineLength: number; // Maximum line length before wrapping
  selfClosingStyle: "xhtml" | "html"; // How to format self-closing tags
  wrapAttributes:
    | "auto"
    | "force"
    | "force-aligned"
    | "force-expand-multiline"
    | "aligned-multiple"
    | "preserve"
    | "preserve-aligned"; // How to wrap attributes
}

/**
 * Default formatting options
 */
const defaultOptions: HTMLFormatterOptions = {
  indent: 2,
  maxLineLength: 40,
  selfClosingStyle: "xhtml",
  wrapAttributes: "auto",
};

/**
 * Token types for HTML parsing
 */
enum TokenType {
  TAG_OPEN,
  TAG_CLOSE,
  SELF_CLOSING,
  TEXT,
  COMMENT,
  DOCTYPE,
  ATTRIBUTE,
}

/**
 * Token interface for parsed HTML elements
 */
interface Token {
  type: TokenType;
  content: string;
  name?: string;
  attributes?: Array<{ name: string; value: string | null }>;
  selfClosing?: boolean;
}

/**
 * Main class for HTML formatting
 */
export class HTMLFormatter {
  private options: HTMLFormatterOptions;

  constructor(options: Partial<HTMLFormatterOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * Format an HTML string according to configuration
   */
  public format(html: string): string {
    const tokens = this.tokenize(html);
    return this.formatTokens(tokens);
  }

  /**
   * Parse HTML string into tokens
   */
  private tokenize(html: string): Token[] {
    const tokens: Token[] = [];
    let position = 0;

    while (position < html.length) {
      // Skip whitespace
      const whitespaceMatch = html.slice(position).match(/^\s+/);
      if (whitespaceMatch) {
        position += whitespaceMatch[0].length;
        continue;
      }

      // Parse HTML comment
      if (html.slice(position).startsWith("<!--")) {
        const commentEnd = html.indexOf("-->", position);
        if (commentEnd !== -1) {
          tokens.push({
            type: TokenType.COMMENT,
            content: html.slice(position, commentEnd + 3),
          });
          position = commentEnd + 3;
          continue;
        }
      }

      // Parse DOCTYPE
      if (
        html.slice(position).startsWith("<!DOCTYPE") ||
        html.slice(position).startsWith("<!doctype")
      ) {
        const doctypeEnd = html.indexOf(">", position);
        if (doctypeEnd !== -1) {
          tokens.push({
            type: TokenType.DOCTYPE,
            content: html.slice(position, doctypeEnd + 1),
          });
          position = doctypeEnd + 1;
          continue;
        }
      }

      // Parse closing tag
      if (html.slice(position).startsWith("</")) {
        const closeTagEnd = html.indexOf(">", position);
        if (closeTagEnd !== -1) {
          const tagName = html.slice(position + 2, closeTagEnd).trim();
          tokens.push({
            type: TokenType.TAG_CLOSE,
            content: html.slice(position, closeTagEnd + 1),
            name: tagName,
          });
          position = closeTagEnd + 1;
          continue;
        }
      }

      // Parse opening tag
      if (html.slice(position).startsWith("<")) {
        const tagMatch = html
          .slice(position)
          .match(/^<([a-zA-Z][a-zA-Z0-9:-]*)/);
        if (tagMatch) {
          const tagName = tagMatch[1];
          const tagEnd = this.findTagEnd(html, position);

          if (tagEnd !== -1) {
            const tagContent = html.slice(position, tagEnd + 1);
            const isSelfClosing =
              tagContent.endsWith("/>") || this.isSelfClosingTag(tagName);

            const attributes = this.parseAttributes(tagContent);

            tokens.push({
              type: isSelfClosing ? TokenType.SELF_CLOSING : TokenType.TAG_OPEN,
              content: tagContent,
              name: tagName,
              attributes,
              selfClosing: isSelfClosing,
            });

            position = tagEnd + 1;
            continue;
          }
        }
      }

      // Parse text content
      const nextTagStart = html.indexOf("<", position);
      if (nextTagStart === -1) {
        // Remaining content is all text
        const text = html.slice(position).trim();
        if (text) {
          tokens.push({
            type: TokenType.TEXT,
            content: text,
          });
        }
        break;
      } else {
        // Text until next tag
        const text = html.slice(position, nextTagStart).trim();
        if (text) {
          tokens.push({
            type: TokenType.TEXT,
            content: text,
          });
        }
        position = nextTagStart;
      }
    }

    return tokens;
  }

  /**
   * Find the end position of a tag
   */
  private findTagEnd(html: string, startPos: number): number {
    let pos = startPos;
    let inQuote: string | null = null;

    while (pos < html.length) {
      const char = html[pos];

      if (inQuote) {
        if (char === inQuote) {
          inQuote = null;
        }
      } else {
        if (char === '"' || char === "'") {
          inQuote = char;
        } else if (char === ">") {
          return pos;
        }
      }

      pos++;
    }

    return -1;
  }

  /**
   * Parse attributes from tag content
   */
  private parseAttributes(
    tagContent: string
  ): Array<{ name: string; value: string | null }> {
    const attributes: Array<{ name: string; value: string | null }> = [];

    // Removing the tag name and brackets
    const tagNameMatch = tagContent.match(/^<([a-zA-Z][a-zA-Z0-9:-]*)/);
    if (!tagNameMatch) return attributes;

    const attrString = tagContent
      .slice(tagNameMatch[0].length, tagContent.endsWith("/>") ? -2 : -1)
      .trim();

    if (!attrString) return attributes;

    // Match attributes with or without values
    const attrRegex =
      /([a-zA-Z][a-zA-Z0-9:-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let match;

    while ((match = attrRegex.exec(attrString)) !== null) {
      const name = match[1];
      const value = match[2] || match[3] || match[4] || null;
      attributes.push({ name, value });
    }

    return attributes;
  }

  /**
   * Check if a tag is self-closing by nature
   */
  private isSelfClosingTag(tagName: string): boolean {
    const selfClosingTags = [
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
    ];
    return selfClosingTags.includes(tagName.toLowerCase());
  }

  /**
   * Format tokens into pretty HTML
   */
  private formatTokens(tokens: Token[]): string {
    let result = "";
    let indentLevel = 0;
    const indentString = " ".repeat(this.options.indent);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      switch (token.type) {
        case TokenType.DOCTYPE:
          result += token.content + "\n";
          break;

        case TokenType.COMMENT:
          result += this.indent(indentLevel) + token.content + "\n";
          break;

        case TokenType.TAG_OPEN:
          if (
            token.name &&
            ["script", "style"].includes(token.name.toLowerCase())
          ) {
            // Special handling for script and style tags
            result += this.indent(indentLevel) + this.formatTag(token) + "\n";

            // Find the corresponding closing tag
            let j = i + 1;
            let content = "";
            while (j < tokens.length) {
              if (
                tokens[j].type === TokenType.TAG_CLOSE &&
                tokens[j].name &&
                tokens[j].name?.toLowerCase() === token.name.toLowerCase()
              ) {
                break;
              }
              if (tokens[j].type === TokenType.TEXT) {
                content += tokens[j].content;
              }
              j++;
            }

            // Add content with proper indentation for script/style
            if (content.trim()) {
              result += this.indent(indentLevel + 1) + content.trim() + "\n";
            }
          } else {
            result +=
              this.indent(indentLevel) +
              this.formatTag(token, indentLevel) +
              "\n";
            indentLevel++;
          }
          break;

        case TokenType.TAG_CLOSE:
          indentLevel = Math.max(0, indentLevel - 1);
          result += this.indent(indentLevel) + token.content + "\n";
          break;

        case TokenType.SELF_CLOSING:
          result +=
            this.indent(indentLevel) +
            this.formatTag(token, indentLevel) +
            "\n";
          break;

        case TokenType.TEXT: {
          // Properly format text content while preserving meaningful whitespace
          const lines = token.content.split("\n");
          const formattedText = lines
            .map((line) => line.trim())
            .filter(Boolean)
            .join(" ");

          if (formattedText) {
            result += this.indent(indentLevel) + formattedText + "\n";
          }
          break;
        }
      }
    }

    return result.trim();
  }

  /**
   * Format a tag with attributes based on options
   */
  private formatTag(token: Token, level: number = 1): string {
    if (!token.attributes || token.attributes.length === 0) {
      // Simple tag without attributes
      if (token.type === TokenType.SELF_CLOSING) {
        return this.options.selfClosingStyle === "xhtml"
          ? `<${token.name} />`
          : `<${token.name}>`;
      }
      return token.content;
    }

    // Tag with attributes
    const tagName = token.name || "";
    let attrs = "";

    // Format attributes based on the wrapAttributes option
    switch (this.options.wrapAttributes) {
      case "force":
      case "force-expand-multiline":
        // Each attribute on a new line
        attrs = token.attributes
          .map((attr) => {
            return `\n${this.indent(level + 1)}${attr.name}${
              attr.value !== null ? `="${attr.value}"` : ""
            }`;
          })
          .join("");
        if (token.type === TokenType.SELF_CLOSING) {
          return `<${tagName}${attrs}\n${this.indent(level)}${
            this.options.selfClosingStyle === "xhtml" ? "/" : ""
          }>`;
        } else {
          return `<${tagName}${attrs}\n${this.indent(level)}>`;
        }

      case "force-aligned":
      case "aligned-multiple":
        if (
          token.attributes.length > 1 ||
          this.options.wrapAttributes === "force-aligned"
        ) {
          // Align all attributes
          const longestAttr = Math.max(
            ...token.attributes.map((a) => a.name.length)
          );
          attrs = token.attributes
            .map((attr) => {
              const padding = " ".repeat(longestAttr - attr.name.length);
              return `\n${this.indent(level + 1)}${attr.name}${padding}${
                attr.value !== null ? ` = "${attr.value}"` : ""
              }`;
            })
            .join("");
          if (token.type === TokenType.SELF_CLOSING) {
            return `<${tagName}${attrs}\n${
              this.options.selfClosingStyle === "xhtml" ? "/" : ""
            }>`;
          } else {
            return `<${tagName}${attrs}\n>`;
          }
        }
      // Fall through to auto for single attributes

      case "auto":
      default: {
        // Single line if it fits, otherwise wrap
        const singleLine = token.attributes
          .map((attr) => {
            return `${attr.name}${
              attr.value !== null ? `="${attr.value}"` : ""
            }`;
          })
          .join(" ");

        if (
          singleLine.length + tagName.length + 3 <=
          this.options.maxLineLength
        ) {
          // Fits on a single line
          if (token.type === TokenType.SELF_CLOSING) {
            return this.options.selfClosingStyle === "xhtml"
              ? `<${tagName} ${singleLine} />`
              : `<${tagName} ${singleLine}>`;
          } else {
            return `<${tagName} ${singleLine}>`;
          }
        } else {
          // Wrap to multiple lines
          attrs = token.attributes
            .map((attr) => {
              return `\n${this.indent(level + 1)}${attr.name}${
                attr.value !== null ? `="${attr.value}"` : ""
              }`;
            })
            .join("");
          if (token.type === TokenType.SELF_CLOSING) {
            return `<${tagName}${attrs}\n${this.indent(level)}${
              this.options.selfClosingStyle === "xhtml" ? "/" : ""
            }>`;
          } else {
            return `<${tagName}${attrs}\n${this.indent(level)}>`;
          }
        }
      }
    }
  }

  /**
   * Create an indentation string based on level
   */
  private indent(level: number): string {
    return " ".repeat(level * this.options.indent);
  }
}

/**
 * Format an HTML string with default options
 */
export function formatHTML(
  html: string,
  options: Partial<HTMLFormatterOptions> = {}
): string {
  const formatter = new HTMLFormatter(options);
  return formatter.format(html);
}
