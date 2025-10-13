import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands {
    figcaption: {
      setFigcaption: () => void;
    };
  }
}

export const Figcaption = Node.create({
  name: "figcaption",

  group: "block",

  content: "inline*",

  // This makes it so you can't press 'Enter' inside a figcaption to create a new paragraph
  isolating: true,

  parseHTML() {
    return [{ tag: "figcaption" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figcaption", mergeAttributes(HTMLAttributes), 0];
  },

  addAttributes() {
    return {
      class: {
        default:
          "border border-muted-foreground p-2 border-dashed rounded-sm text-center text-muted-foreground mb-2",
      },
    };
  },

  // Make it so you can't create a figcaption from scratch
  addCommands() {
    return {
      // Prevents creating new figcaptions manually
      setFigcaption: () => () => false,
    };
  },
});
