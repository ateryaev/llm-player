import React, { useEffect, useRef } from 'react';
import { Button } from './Button';

const Modal = ({ isOpen, onClose, title, actionName, onAction, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current.showModal();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <dialog ref={dialogRef} onClose={onClose}
      className="select-none w-dvw h-dvh max-h-fit bg-black-50 mx-auto min-w-dvw overflow-hidden bg-black/5">
      <div className="h-dvh bg-black/50 animate-[revealing_0.2s_ease-in-out]" tabIndex={0}>
        <div className="w-full max-h-[80dvh] flex flex-col bg-neutral-100 animate-[slideIn_0.2s_ease-in-out]">
          <div className="bg-white ring-2 ring-black/10">
            <div className="p-4 xbg-red-100 xtext-blue-600 text-center font-bold">{title}</div>
          </div>
          <div className="flex-1 overflow-y-scroll scroll-p-4">
            {children}
          </div>

          <div className="p-4 bg-white flex gap-4 justify-center  
            focus-within:ring-blue-300 focus-within:bg-blue-50
            ring-2 ring-black/10">
            <Button hidden={!onAction} className={"lowercase"} onClick={onAction}>{actionName}</Button>
            <Button hidden={!onClose} className={"font-boldx lowercase"} onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;