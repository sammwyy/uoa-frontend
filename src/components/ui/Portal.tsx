import React from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  container?: Element;
}

export const Portal: React.FC<PortalProps> = ({
  children,
  container = document.body,
}) => {
  return createPortal(children, container);
};
