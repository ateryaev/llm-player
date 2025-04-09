
// state: generating, eos, aborted, limited
// 5.53 tok/sec :: 43 tokens :: 8.73s to first token :: Stop reason: Stop String Found
// Stop reason: User Stopped

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { BlinkingCursor, RotatingCursor } from "./Cursors";
import { get_encoding } from "tiktoken";
//import Tiktoken from "tiktoken/lite";

export default function Message({ role, deleted, error, content, model, loading, state, selected, onDelete, ...props }) {

    const [copied, setCopied] = useState(false)
    const [editing, setEditing] = useState(false)
    const [tokenCount, setTokenCount] = useState(0);
    const [deleteing, setDeleting] = useState(false);
    const [focused, setFocused] = useState(false);

    const divRef = useRef(null);

    const copyBtn = useRef(null);
    function handleCopy() {
        setCopied(true);
        copyBtn.current.blur();
        console.log("setCopied")
        setTimeout(() => { setCopied(false) }, 1000)
    }

    useEffect(() => {
        //calculate tokens in content text using cl100k_base
        // const encoding = get_encoding("cl100k_base")
        // const tokens1 = encoding.encode(role).length;
        // const tokens2 = encoding.encode(content).length;
        // setTokenCount(tokens1 + tokens2);

    }, [role, content]);


    function handleBlur(e) {
        console.log("handleBlur", e)
        setFocused(false);
    }
    function handleFocus() {
        //console.log("handleFocus")
        setFocused(true);
    }

    useEffect(() => {
        if (!focused) {
            const timer = setTimeout(() => {
                setDeleting(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [focused]);

    function handleEdit() {

    }

    let roleClass = (role === "user" ? "rounded-tr-xs xml-4" : "rounded-tl-xs  xmr-4");
    //roleClass = (role === "system" ? "rounded-t-sm " : roleClass);
    //+ (selected ? " ring-blue-300 bg-blue-50" : "ring-neutral-200 bg-white")

    // if (deleted) {
    //     return <div className="flex justify-between p-3 rounded-sm gap-0  group ring-2 outline-none ring-neutral-200 bg-white 
    //     focus-within:ring-yellow-500 text-neutral-300 focus-within:bg-yellow-50 focus-within:text-yellow-500
    //     "
    //         tabIndex={0}>
    //         <div className="flex-1 ">{role} message deleted</div>
    //         <Button onClick={onDelete} className="group-focus-within:flex  hidden text-yellow-500">restore</Button>
    //     </div>
    // }

    return (
        <div className="flex flex-col p-1 rounded-sm gap-0  group ring-2 outline-none ring-neutral-200 bg-white 
        focus-within:ring-blue-300 focus-within:bg-blue-50"
            tabIndex={0} {...props} ref={divRef} onBlur={handleBlur} onFocus={handleFocus}>
            <div className="flex gap-0 items-start text-blue-600 p-2 py-1">
                <div className="text-blue-600">
                    {role}
                    <div className="text-black opacity-50 text-xs">{model}</div>
                </div>
                {/* {model &&
                    <div className="bg-whitex xtext-neutral-400 text-ellipsis overflow-hidden text-nowrap opacity-5z0 italic">
                        {model}
                    </div>} */}
                <div className="text-xs flex-1"></div>
                <div className="gap-2 group-focus-within:flex  hidden ">
                    {/* {model && <Button onClick={onDelete}>
                        refresh
                    </Button>}
                    <Button onClick={onDelete}>
                        edit
                    </Button> */}

                    <Button hidden={!deleteing} onClick={onDelete} className={"text-red-500"}>
                        delete
                    </Button>
                    <Button hidden={!deleteing} onClick={() => { setDeleting(false) }}>
                        cancel
                    </Button>

                    <Button hidden={deleteing} onClick={() => { setDeleting(true); divRef.current?.focus(); }} >
                        delete
                    </Button>
                    {/* <Button onClick={handleEdit}>edit</Button> */}
                    {/* <Button ref={copyBtn} disabled={copied} onClick={handleCopy}>{copied ? "done" : "copy"}</Button>
                    <Button onClick={onDelete}>delete</Button> */}

                    {/* <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-blue-500"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg> */}
                </div>
            </div>

            <div className="whitespace-pre-wrap break-words outline-none p-2">

                {/* <textarea className="block w-full h-fit" value={content}></textarea> */}
                {content}
                {loading && content !== "" && <BlinkingCursor />}
                {loading && content === "" && <RotatingCursor />}


            </div>


            {
                model && <div className="text-xs text-neutral-500  px-2 py-1">
                    {error && <div className="text-red-500">{error}</div>}
                    {tokenCount} tokens, 5s + 10s to generate</div>
            }
            {
                !model && <div className="text-xs opacity-50 px-2 py-1">
                    {tokenCount} tokens, 5m ago</div>
            }

        </div >
    )
}