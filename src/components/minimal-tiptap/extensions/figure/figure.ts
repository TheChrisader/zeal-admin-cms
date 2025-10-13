import { findChildren, mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FigureComponent from "./components/FigureComponent";
import { filterFiles, randomId } from "../../utils";
import { ReplaceStep } from "@tiptap/pm/transform";
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
} from "@tiptap/pm/state";
import { NodeType } from "@tiptap/pm/model";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: {
      setFigure: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
      setFigures: (
        options: {
          src: string | File;
          alt?: string;
          title?: string;
        }[],
      ) => ReturnType;
    };
  }
}

// You will need to create this React component
export const Figure = Node.create({
  name: "figure",

  group: "block",

  content: "image figcaption", // <-- This is the crucial part

  draggable: true,

  isolating: true,

  // atom: true,

  addOptions() {
    return {
      allowedMimeTypes: [],
      maxFileSize: 0,
      allowBase64: false,
    };
  },

  addAttributes() {
    return {
      // You can add attributes here if needed, e.g., for alignment
      // class: { default: 'text-left' },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // The '0' is a "hole" where the content (the image and figcaption) will be rendered
    return ["figure", mergeAttributes(HTMLAttributes), 0];
  },

  //   addNodeView() {
  //     return ReactNodeViewRenderer(FigureComponent);
  //   },

  addCommands() {
    return {
      setFigure:
        (options) =>
        ({ commands }) => {
          if (!options.src) {
            return false;
          }

          const position = this.editor.state.selection.from;
          const id = randomId();

          return commands.insertContentAt(position, {
            type: this.name,
            content: [
              {
                type: "image",
                attrs: {
                  id,
                  src: options.src,
                  alt: options.alt,
                  title: options.title,
                },
              },
              {
                type: "figcaption",
                content: [
                  {
                    type: "text",
                    text: " ", // Add a space to ensure the cursor can be placed inside
                  },
                ],
              },
            ],
          });
        },
      setFigures:
        (options) =>
        ({ commands }) => {
          const [validImages, errors] = filterFiles(options, {
            allowedMimeTypes: this.options.allowedMimeTypes,
            maxFileSize: this.options.maxFileSize,
            allowBase64: this.options.allowBase64,
          });

          if (errors.length > 0 && this.options.onValidationError) {
            this.options.onValidationError(errors);
          }

          if (validImages.length > 0) {
            return commands.insertContent(
              validImages.map((image) => {
                if (image.src instanceof File) {
                  const blobUrl = URL.createObjectURL(image.src);
                  const id = randomId();

                  return {
                    type: this.name,
                    content: [
                      {
                        type: "image",
                        attrs: {
                          id,
                          src: blobUrl,
                          alt: image.alt,
                          title: image.title,
                          fileName: image.src.name,
                        },
                      },
                      {
                        type: "figcaption",
                        content: [
                          {
                            type: "text",
                            text: " ", // Add a space to ensure the cursor can be placed inside
                          },
                        ],
                      },
                    ],
                  };
                }
              }),
            );
          }
          return false;
        },
    };
  },

  //   addKeyboardShortcuts() {
  //     return {
  //       // When backspace is pressed...
  //       Backspace: () => {
  //         const { selection } = this.editor.state;

  //         // ...and the selection is a NodeSelection on an image
  //         if (
  //           selection instanceof NodeSelection &&
  //           selection.node.type.name === "image"
  //         ) {
  //           // ...and that image's parent is a figure
  //           const parent = selection.$from.parent;
  //           if (parent.type.name === this.name) {
  //             // Then delete the entire figure node
  //             return this.editor.commands.deleteNode(this.name);
  //           }
  //         }

  //         // Otherwise, do the default behavior
  //         return false;
  //       },
  //       // You should probably do the same for the 'Delete' key
  //       Delete: () => {
  //         // ... same logic as above
  //         const { selection } = this.editor.state;

  //         // ...and the selection is a NodeSelection on an image
  //         if (
  //           selection instanceof NodeSelection &&
  //           selection.node.type.name === "image"
  //         ) {
  //           // ...and that image's parent is a figure
  //           const parent = selection.$from.parent;
  //           if (parent.type.name === this.name) {
  //             // Then delete the entire figure node
  //             return this.editor.commands.deleteNode(this.name);
  //           }
  //         }

  //         // Otherwise, do the default behavior
  //         return false;
  //       },
  //     };
  //   },

  addKeyboardShortcuts() {
    const isImageInFigureSelected = () => {
      const { selection } = this.editor.state;
      return (
        selection instanceof NodeSelection &&
        selection.node.type.name === "image" &&
        selection.$from.parent.type.name === this.name
      );
    };

    return {
      // For Backspace and Delete, we just want to delete the whole figure.
      Backspace: () => {
        if (isImageInFigureSelected()) {
          return this.editor.commands.deleteNode(this.name);
        }
        return false;
      },
      Delete: () => {
        if (isImageInFigureSelected()) {
          return this.editor.commands.deleteNode(this.name);
        }
        return false;
      },

      // For Enter, we want to create a new paragraph AFTER the figure.
      Enter: () => {
        if (isImageInFigureSelected()) {
          const { selection } = this.editor.state;
          const figureNode = selection.$from.parent;
          const figurePos =
            selection.$from.pos - selection.$from.parentOffset - 1;
          const endPos = figurePos + figureNode.nodeSize;

          return this.editor
            .chain()
            .insertContentAt(endPos, { type: "paragraph" })
            .setTextSelection(endPos + 1)
            .run();
        }
        return false;
        // if (isImageInFigureSelected()) {
        //   const { selection } = this.editor.state;

        //   // 1. Find the start and end positions of the entire parent figure.
        //   const figurePos =
        //     selection.$from.pos - selection.$from.parentOffset - 1;
        //   const figureEndPos = figurePos + selection.$from.parent.nodeSize;

        //   // 2. Replace the entire figure with a new paragraph node.
        //   //    Then set the cursor inside that new paragraph.
        //   return (
        //     this.editor
        //       .chain()
        //       .focus()
        //       // Use a custom command to perform the replacement and selection in one transaction
        //       .command(({ tr, dispatch }) => {
        //         const newParagraph = (
        //           this.editor.schema.nodes.paragraph as NodeType
        //         ).create();
        //         tr.replaceWith(figurePos, figureEndPos, newParagraph);

        //         // Place the cursor at the start of the new paragraph
        //         const newSelectionPos = figurePos + 1;
        //         tr.setSelection(TextSelection.create(tr.doc, newSelectionPos));

        //         if (dispatch) {
        //           dispatch(tr);
        //         }
        //         return true;
        //       })
        //       .run()
        //   );
        // }
        // return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("figureTextInput"),
        props: {
          handleTextInput: (view, from, to, text) => {
            const { state, dispatch } = view;
            const { selection } = state;

            if (
              selection instanceof NodeSelection &&
              selection.node.type.name === "image"
            ) {
              const parent = selection.$from.parent;
              if (parent.type.name === this.name) {
                // User is typing over the image in our figure.
                // Create a transaction to delete the entire figure and insert the text.
                // 1. Calculate the start and end positions of the entire figure
                const figurePos =
                  selection.$from.pos - selection.$from.parentOffset - 1;
                const figureEndPos = figurePos + parent.nodeSize;

                const newParagraph = state.schema.nodes.paragraph?.create(
                  null,
                  state.schema.text(text),
                );

                // 2. Create a transaction that replaces the figure with the new text
                // Using `replaceWith` is slightly cleaner than `deleteRange` + `insert`
                let tr = state.tr.replaceWith(
                  figurePos,
                  figureEndPos,
                  //   state.schema.text(text),
                  newParagraph || state.schema.text(text),
                );

                // 3. Calculate the new cursor position
                const newPos = figurePos + text.length + 1;

                // 4. Set the selection to that new position
                tr = tr.setSelection(TextSelection.create(tr.doc, newPos));

                // 5. Dispatch the single, complete transaction
                dispatch(tr);

                return true; // We handled it.
              }
            }

            return false; // Let ProseMirror do its thing.
          },
        },
      }),
      new Plugin({
        key: new PluginKey("figureActionHandler"),
        props: {
          // Your successful handler for when a user types over the selected image.
          handleTextInput: (view, from, to, text) => {
            const { state, dispatch } = view;
            const { selection } = state;

            if (
              selection instanceof NodeSelection &&
              selection.node.type.name === "image" &&
              selection.$from.parent.type.name === this.name
            ) {
              // This is the core logic we will reuse:
              // Find the figure, replace it with new content, and set the cursor.
              const figurePos =
                selection.$from.pos - selection.$from.parentOffset - 1;
              const figureEndPos = figurePos + selection.$from.parent.nodeSize;

              const newParagraph = (
                this.editor.schema.nodes.paragraph as NodeType
              ).create(null, state.schema.text(text));
              const tr = state.tr.replaceWith(
                figurePos,
                figureEndPos,
                newParagraph,
              );
              const newSelectionPos = figurePos + text.length + 1;
              tr.setSelection(TextSelection.create(tr.doc, newSelectionPos));
              dispatch(tr);
              return true; // We handled it.
            }
            return false; // Let ProseMirror do its thing.
          },

          // Handler for when a user PASTES over the selected image.
          handlePaste: (view, event, slice) => {
            const { state, dispatch } = view;
            const { selection } = state;

            if (
              selection instanceof NodeSelection &&
              selection.node.type.name === "image" &&
              selection.$from.parent.type.name === this.name
            ) {
              const figurePos =
                selection.$from.pos - selection.$from.parentOffset - 1;
              const figureEndPos = figurePos + selection.$from.parent.nodeSize;

              // `slice.content` is the pasted content.
              const tr = state.tr.replaceWith(
                figurePos,
                figureEndPos,
                slice.content,
              );
              // Set selection to the end of the pasted content.
              tr.setSelection(
                TextSelection.create(tr.doc, tr.mapping.map(figureEndPos)),
              );
              dispatch(tr);
              return true; // We handled it.
            }
            return false;
          },

          handleDrop: (view, event, slice, moved) => {
            const { state, dispatch } = view;
            const { selection } = state;

            // Check if the drop target is our selected image inside a figure.
            if (
              selection instanceof NodeSelection &&
              selection.node.type.name === "image" &&
              selection.$from.parent.type.name === this.name
            ) {
              // First, prevent the browser's default drop behavior.
              event.preventDefault();

              // The logic is identical to handlePaste:
              // 1. Find the start and end of the entire figure.
              const figurePos =
                selection.$from.pos - selection.$from.parentOffset - 1;
              const figureEndPos = figurePos + selection.$from.parent.nodeSize;

              // 2. Create a transaction that replaces the figure with the dropped content (`slice.content`).
              const tr = state.tr.replaceWith(
                figurePos,
                figureEndPos,
                slice.content,
              );

              // 3. Move the cursor to the end of the newly dropped content.
              tr.setSelection(
                TextSelection.create(tr.doc, tr.mapping.map(figureEndPos)),
              );

              // 4. Dispatch the transaction.
              dispatch(tr);

              // 5. Tell ProseMirror we've handled it.
              return true;
            }

            // If the drop wasn't on our specific target, let ProseMirror handle it.
            return false;
          },

          // Use handleDOMEvents to catch CUT and DRAG operations.
          handleDOMEvents: {
            cut: (view, event) => {
              const { state, dispatch } = view;
              const { selection } = state;

              if (
                selection instanceof NodeSelection &&
                selection.node.type.name === "image" &&
                selection.$from.parent.type.name === this.name
              ) {
                const figurePos =
                  selection.$from.pos - selection.$from.parentOffset - 1;
                const figureEndPos =
                  figurePos + selection.$from.parent.nodeSize;

                // Create a transaction that just deletes the figure.
                const tr = state.tr.delete(figurePos, figureEndPos);
                dispatch(tr);

                // Prevent the browser's default cut behavior.
                event.preventDefault();
                return true; // We handled it.
              }
              return false;
            },
            dragstart: (view, event) => {
              if (!event.target) {
                return false;
              }

              const pos = view.posAtDOM(event.target as HTMLElement, 0);
              const $pos = view.state.doc.resolve(pos);

              if ($pos.parent.type === this.type) {
                event.preventDefault();
              }

              return false;
            },
            // You could also add a 'drop' handler here if needed, with similar logic.
          },
        },
      }),
      new Plugin({
        key: new PluginKey("imageWrapper"),
        // This is the key part of the solution
        appendTransaction: (transactions, oldState, newState) => {
          const tr = newState.tr;
          let modified = false;

          // Check if any transaction changed the document
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null;
          }

          // Find all 'image' nodes in the new document state
          const images = findChildren(
            newState.doc,
            (node) => node.type.name === "image",
          );

          images.reverse().forEach(({ node, pos }) => {
            // Check if the image's parent is the doc itself (top level) or any other node
            // that is NOT our desired 'figure' wrapper.
            const parent = newState.doc.resolve(pos).parent;
            if (parent.type.name !== "figure") {
              // This is an unwrapped image, let's wrap it!
              const figure = (newState.schema.nodes.figure as NodeType).create(
                null, // No attributes for the figure
                [
                  node, // The original image node
                  (newState.schema.nodes.figcaption as NodeType).create(), // An empty figcaption
                ],
              );

              // Replace the image with the new figure structure
              // The range is from the start of the image to the end of the image
              tr.replaceWith(pos, pos + node.nodeSize, figure);
              modified = true;
            }
          });

          // If we made changes, return the transaction. Otherwise, return null.
          return modified ? tr : null;
        },
      }),
    ];
  },
});
