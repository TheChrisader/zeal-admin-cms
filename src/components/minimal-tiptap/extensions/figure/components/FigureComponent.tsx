import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";

const FigureComponent = () => {
  return (
    <NodeViewWrapper as="figure">
      <NodeViewContent />
    </NodeViewWrapper>
  );
};

export default FigureComponent;
