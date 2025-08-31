"use client";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import React, { useEffect, useState } from "react";
type Props = {
  children: React.ReactNode;
  editModalRef: React.RefObject<HTMLDivElement | null>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  centered?: boolean;
  disableOutsideClick?: boolean;
};
const Modal = ({
  children,
  editModalRef,
  open,
  setOpen,
  centered,
  disableOutsideClick,
}: Props) => {
  useClickOutside(editModalRef, () => {
    if (!disableOutsideClick) {
      setOpen(false);
    }
  });

  useEffect(() => {
    if (open === true) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "scroll";
      };
    }
  }, [open]);
  return (
    <>
      {open && (
        <>
          <div className="bg-[#1E1E1E]/40 fixed z-[60] w-screen h-[120vh] md:h-screen top-0  left-0 bg-opacity-50">
            <div className="absolute h-[100vh] w-screen  overflow-y-auto">
              <div
                ref={editModalRef}
                className={`mx-auto max-w-[972px]   ${
                  centered &&
                  "absolute  left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
                }`}
              >
                {children}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default Modal;
