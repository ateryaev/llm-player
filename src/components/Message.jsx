import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Button";
import { BlinkingCursor, RotatingCursor } from "./Cursors";
//import { get_encoding } from "tiktoken";


function timeDiffTxt(diff) {
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${seconds}s`;
}

function timeAgoTxt(when) {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - when;
    return timeDiffTxt(timeDifference) + " ago";
}

export default function Message({ index, role, deleted, createdOn, error, content, model, loading, state, selected, data, onDelete, ...props }) {
    const [deleteing, setDeleting] = useState(false);
    const [focused, setFocused] = useState(false);

    const divRef = useRef(null);
    const copyBtn = useRef(null);

    const bytes = useMemo(() => { return content.length + role.length }, [content, role]);

    function handleCopy() {
        setCopied(true);
        copyBtn.current.blur();
        console.log("setCopied")
        setTimeout(() => { setCopied(false) }, 1000)
    }

    const [createdOnAgo, setCreatedOnAgo] = useState('');

    useEffect(() => {
        const updateTimeAgo = () => {
            setCreatedOnAgo(timeAgoTxt(createdOn));
        };
        updateTimeAgo();
        const intervalId = setInterval(updateTimeAgo, 1000);
        return () => clearInterval(intervalId);
    }, [createdOn]);

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
        <div className="flex flex-col p-1 rounded-sm gap-0  group ring-2 outline-none ring-black/10 bg-white 
        focus-within:ring-blue-300 focus-within:bg-blue-50"
            tabIndex={0} {...props} ref={divRef} onBlur={handleBlur} onFocus={handleFocus}>

            <div className="flex gap-2 items-start text-blue-600 p-2 py-1">
                <div className="text-blue-600 text-ellipsis whitespace-nowrap overflow-hidden">
                    {role}
                    {/* <div className="text-black opacity-50 text-xs text-ellipsis whitespace-nowrap overflow-hidden">{model}</div> */}
                </div>
                {/* {model &&
                    <div className="bg-whitex xtext-neutral-400 text-ellipsis overflow-hidden text-nowrap opacity-5z0 italic">
                        {model}
                    </div>} */}
                <div className="text-xs flex-1"></div>

                <div className="gap-2 group-focus-within:flex  hidden ">
                    <Button hidden={!deleteing} onClick={onDelete} className={"text-red-500"}>
                        delete
                    </Button>
                    <Button hidden={!deleteing} onClick={() => { setDeleting(false) }}>
                        cancel
                    </Button>

                    <Button hidden={deleteing} onClick={() => { setDeleting(true); divRef.current?.focus(); }} >
                        delete
                    </Button>
                </div>
                <div className="gap-2 group-focus-within:hidden flex text-black opacity-25"><div>#{index + 1}</div></div>
            </div>
            {model &&
                <div className="text-black opacity-50 text-xs text-ellipsis whitespace-nowrap overflow-hidden px-2">
                    {model}
                </div>}
            <div className="whitespace-pre-wrap break-words outline-none p-2">

                {/* <textarea className="block w-full h-fit" value={content}></textarea> */}
                {content}
                {loading && content !== "" && <BlinkingCursor />}
                {loading && content === "" && <RotatingCursor />}


            </div>


            {
                model && <div className="text-xs text-neutral-500  px-2 py-1">
                    {error && <div className="text-red-500">{error}</div>}
                    {bytes} bytes
                    {data.firstCharOn && data.finishedOn && data.createdOn && <>, {timeDiffTxt(data.firstCharOn - data.createdOn)} + {timeDiffTxt(data.finishedOn - data.firstCharOn)} to finish</>}
                    , reason {data.finishReason}
                </div>
            }
            {
                !model && <div className="text-xs opacity-50 px-2 py-1">
                    {bytes} bytes
                    {data.createdOn && <>, {createdOnAgo}</>}</div>
            }

        </div >
    )
}