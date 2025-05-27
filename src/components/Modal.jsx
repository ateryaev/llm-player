import { useEffect, useRef } from 'react';
import { Button } from './Button';

const Modal = ({ shown, onCancel, title, actionName, onAction, children }) => {

  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    document.startViewTransition(() => {
      if (shown) {
        dialogRef.current.showModal();
        scrollRef.current.scrollTop = 0;
      } else {
        dialogRef.current.close();
        //TODO: stop rendering the dialog when animation is done
      }
    });

  }, [shown]);

  function handleCancel(e) {
    //Prevent dialog closing on escape or back button, for hiding animation
    e.preventDefault();
    onCancel();
  }

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) {
      onCancel();
    }
  }

  return (
    <dialog ref={dialogRef} onCancel={handleCancel}
      className="bg-black/0 select-none w-dvw h-dvh max-h-fit mx-auto min-w-dvw overflow-hidden">

      <div ref={backdropRef} className="[view-transition-name:dialog-backdrop] h-dvh bg-black/50 dark:bg-white/50" onClick={handleBackdropClick}>
        <div className={"max-h-[max(80dvh,min(500px,100dvh))] [view-transition-name:dialog-content] w-full flex flex-col bg-neutral-100 shadow-md outline-none "} tabIndex={0}>
          <div className="bg-white z-30 ring-2 ring-black/10">
            <div className="p-4 text-center font-bold">{title}</div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-scroll scroll-p-4">
            {children}
          </div>

          <div className="p-4 bg-white flex gap-4 justify-center z-30 ring-2 ring-black/10">
            <Button hidden={!onAction} onClick={onAction}>{actionName}</Button>
            <Button hidden={!onCancel} onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;