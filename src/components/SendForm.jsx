import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Button";

function SendForm({ message, active, onSend }) {
    const [shownMessage, setShownMessage] = useState(message);
    const inputRef = useRef(null);
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        setShownMessage(message);
    }, [message]);

    useEffect(() => {
        let n = 0;
        if (focused) {
            inputRef.current.placeholder = "new message";
            return;
        }

        const interval = setInterval(() => {
            n++;
            const txt = "new message" + (n % 2 ? ": " : "  ");
            if (inputRef.current) {
                inputRef.current.placeholder = txt;
            }
        }, 400);
        return () => clearInterval(interval);
    }, [focused]);

    const sendable = useMemo(() => {
        return shownMessage.trim() !== "" && active;
    }, [shownMessage, active]);

    function handleBlur() {
        setFocused(false);
    }
    function handleFocus() {
        setFocused(true);
    }

    function send() {
        if (!sendable) return
        setShownMessage("");
        onSend(shownMessage);
    }

    return (
        <div className="p-0 my-2 pr-4 m-auto w-full max-w-3xl items-start flex gap-2 ring-6 ring-black/5 group
        
        focus-within:ring-blue-300 focus-within:bg-blue-50 bg-white rounded-lg ">

            <textarea
                ref={inputRef}
                rows={2}
                className="bg-transparent  m-3 outline-none block resize-none
                    placeholder:text-black/40 focus:placeholder:text-blue-400/60 
                    border-none flex-1 rounded-md"
                autoComplete="off"
                placeholder="new message"
                value={shownMessage}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e) => setShownMessage(e.target.value)}
                onKeyDown={(e) => {

                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                    }
                }}
            />

            <Button className="my-3" hidden={!sendable} disabled={!sendable} onClick={send}>
                {!active ? "wait" : "send"}
            </Button>
        </div>
    );
}
export default SendForm;
