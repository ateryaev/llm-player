import React, { useEffect, useRef } from 'react';

// Define the Modal component
const Modal = ({ isOpen, onClose, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current.showModal();
      dialogRef.current.focus();
      //setTimeout(() => { dialogRef.current.focus(); }, 0);
    } else {
      //dialogRef.current.close();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null; // Don't render anything if not open
  }
  return (
    <dialog ref={dialogRef} onClose={onClose}
      className="select-none outline-none p-0 no-scrollbar max-h-[80dvh]
    ring-2 ring-black/20 xshadow-[0_0_6px_0px_rgba(0,0,0,0.5)] mx-auto min-w-dvw bg-neutral-100">
      {children}
    </dialog>
  );
};

export default Modal;