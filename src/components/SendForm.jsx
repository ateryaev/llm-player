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
        <div className="p-0 pr-4 m-auto w-full max-w-3xl items-center flex gap-2 bg-neutral-500ч group  ">
            {/* <div className="text-neutral-400 text-lgx">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-quote"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5" /><path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5" /></svg>
            </div> */}

            <input
                ref={inputRef}
                rows={2}
                className="bg-transparent  p-4 xpx-0 outline-none block placeholder:text-xxs 
                placeholder:text-black/40 focus:placeholder:text-blue-400/60 
        border-none flex-1
        xring-2 ring-neutral-300 rounded-md
        shadow-lgx shadow-black/10
        xtext-blue-400"

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
