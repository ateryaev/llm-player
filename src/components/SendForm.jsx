import { act, use, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Button";
import { Blink, CharSpinner } from "./Cursors";

function SendForm({ message, active, onSend }) {
    const [shownMessage, setShownMessage] = useState(message);
    const inputRef = useRef(null);
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        setShownMessage(message);
    }, [message]);

    useEffect(() => {
        //change inputRef placeholder value periodically
        let n = 0;
        if (focused) {
            inputRef.current.placeholder = "new message";
            return;
        }

        const interval = setInterval(() => {
            n++;
            let txt = "";

            txt = "new message" + (n % 2 ? ": " : "  ");
            //txt = (n % 2 ? "> " : "  ") + "new message" + (n % 2 ? " " : "");


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
        //inputRef.current.focus()
        onSend(shownMessage);
    }

    return (
        // <div className="p-3 xw-full items-center flex gap-3 group bg-neutral-200 ring-2 m-2 ring-neutral-300 rounded-2xl">
        <div className="p-0 my-2 pr-4 m-auto w-full max-w-3xl items-center flex gap-2 ring-6 ring-black/5 group
        focus-within:ring-blue-300 focus-within:bg-blue-50 bg-white rounded-lg ">

            <input
                ref={inputRef}
                rows={2}
                className="bg-transparent  p-3 xpx-0 outline-none block placeholder:text-xxs 
                placeholder:text-black/40 focus:placeholder:text-blue-400/60 
        border-none flex-1
        xring-2 ring-neutral-300 rounded-md
        shadow-lgx shadow-black/10
        xtext-blue-400"
                name="message"
                type="text"
                autoComplete="off"
                placeholder="new message"
                value={shownMessage}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e) => setShownMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        send();
                    }
                }}
            />


            {/* <CharSpinner hidden={sendable} className="text-neutral-400 group-focus-within:hidden block" chars={"< "} ms={500} /> */}

            <Button hidden={!sendable} disabled={!sendable} onClick={send}>
                {!active ? "wait" : "send"}
            </Button>
        </div>
    );
}
export default SendForm;
