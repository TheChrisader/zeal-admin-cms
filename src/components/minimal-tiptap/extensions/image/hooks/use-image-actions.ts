import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { Node } from "@tiptap/pm/model";
import { isUrl } from "../../../utils";
import { NodeSelection } from "@tiptap/pm/state";

interface UseImageActionsProps {
  editor: Editor;
  node: Node;
  src: string;
  onViewClick: (value: boolean) => void;
}

export type ImageActionHandlers = {
  onView?: () => void;
  onDownload?: () => void;
  onCopy?: () => void;
  onCopyLink?: () => void;
  onRemoveImg?: () => void;
};

export const useImageActions = ({
  editor,
  node,
  src,
  onViewClick,
}: UseImageActionsProps) => {
  const isLink = React.useMemo(() => isUrl(src), [src]);

  const onView = React.useCallback(() => {
    onViewClick(true);
  }, [onViewClick]);

  const onDownload = React.useCallback(() => {
    editor.commands.downloadImage({ src: node.attrs.src, alt: node.attrs.alt });
  }, [editor.commands, node.attrs.alt, node.attrs.src]);

  const onCopy = React.useCallback(() => {
    editor.commands.copyImage({ src: node.attrs.src });
  }, [editor.commands, node.attrs.src]);

  const onCopyLink = React.useCallback(() => {
    editor.commands.copyLink({ src: node.attrs.src });
  }, [editor.commands, node.attrs.src]);

  const onRemoveImg = React.useCallback(() => {
    editor.commands.command(({ tr, dispatch }) => {
      const { selection } = tr;
      const nodeAtSelection = tr.doc.nodeAt(selection.from);

      if (
        selection instanceof NodeSelection &&
        selection.node.type.name === "image" &&
        nodeAtSelection?.type.name === "image" &&
        selection.$from.parent.type.name === "figure"
      ) {
        const figurePos =
          selection.$from.pos - selection.$from.parentOffset - 1;
        const figureEndPos = figurePos + selection.$from.parent.nodeSize;

        if (dispatch) {
          tr.delete(figurePos, figureEndPos);
          // dispatch(tr);
        }
        return true; // We handled it.
      } else if (nodeAtSelection && nodeAtSelection.type.name === "image") {
        if (dispatch) {
          tr.deleteSelection();
          return true;
        }
      }
      return false;
    });
  }, [editor.commands]);

  return { isLink, onView, onDownload, onCopy, onCopyLink, onRemoveImg };
};
