import { useDraggable } from "@/hooks/useDraggable";
import React from "react";

export interface DraggableWrapperProps {
  item: {
    type: string;
    id: string;
  };
  children: React.ReactElement;
}

const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  item,
  children,
}) => {
  const ref = useDraggable(item);

  return React.cloneElement(children, { ref });
};

export default DraggableWrapper;
