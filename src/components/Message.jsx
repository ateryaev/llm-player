import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Button";
import { BlinkingCursor, RotatingCursor } from "./Cursors";
import { timeAgoTxt, timeDiffTxt } from "../utils/helpers";
import { Div } from "./UI";

export default function Message({ index, role, deleted, createdOn, error, content, model, loading, state, selected, data, onDelete, ...props }) {
    const [deleteing, setDeleting] = useState(false);
    const [focused, setFocused] = useState(false);
    const [createdOnAgo, setCreatedOnAgo] = useState('');
    const [copied, setCopied] = useState(false);

    //data.finishReason = null;
    const divRef = useRef(null);
    const bytes = useMemo(() => { return content.length + role.length }, [content, role]);

    useEffect(() => {
        const updateTimeAgo = () => {
            setCreatedOnAgo(timeAgoTxt(createdOn));
        };
        updateTimeAgo();
        const intervalId = setInterval(updateTimeAgo, 1000);
        return () => clearInterval(intervalId);
    }, [createdOn]);

    function handleBlur(e) {
        setFocused(false);
    }
    function handleFocus() {
        setFocused(true);
    }

    function handleCopy() {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            divRef.current.focus({ preventScroll: true });
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }).catch((err) => {
            setCopied(false);
            console.error("Failed to copy:", err);
        });
    }

    function handleDelete() {

        setDeleting(!deleteing);
        divRef.current.focus({ preventScroll: true });
    }

    useEffect(() => {
        if (!focused) {
            const timer = setTimeout(() => {
                setDeleting(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [focused]);

    return (
        <div className="flex flex-col p-1 rounded-sm gap-0  group ring-2 outline-none ring-black/10 bg-white 
        focus-within:ring-blue-300 focus-within:bg-blue-50"
            tabIndex={0} {...props} ref={divRef} onBlur={handleBlur} onFocus={handleFocus}>

            <div className="flex gap-2 items-start text-blue-600 p-2 py-1">
                <div className="text-blue-600 text-ellipsis whitespace-nowrap overflow-hidden">
                    {role}
                </div>
                <div className="text-xs flex-1"></div>

                <div className="gap-2 group-focus-within:flex  hidden ">
                    <Button hidden={deleteing || copied} onClick={handleCopy}>
                        copy
                    </Button>
                    <Div hidden={!copied} className="select-none opacity-50">copied</Div>
                    <Button hidden={!deleteing} onClick={onDelete} className={"text-red-500"}>
                        delete
                    </Button>
                    <Button hidden={false} onClick={() => { handleDelete() }} >
                        {deleteing ? "cancel" : "delete"}
                    </Button>
                </div>
                <div className="gap-2 group-focus-within:hidden flex text-black opacity-25 select-none"><div>#{index + 1}</div></div>
            </div>

            {model &&
                <div className="text-black opacity-50 text-xs text-ellipsis whitespace-nowrap overflow-hidden px-2">
                    {model}
                </div>}

            <div className="whitespace-pre-wrap break-words outline-none p-2">
                {content}
                {loading && content !== "" && <BlinkingCursor />}
                {loading && content === "" && <RotatingCursor />}
            </div>


            <Div hidden={!model} className="text-xs text-neutral-500  px-2 py-1 select-none">
                <Div hidden={!error} className="text-red-600">{error}</Div>
                {data?.data?.tokenUsage?.completion_tokens ? `${data?.data?.tokenUsage?.completion_tokens} tokens` : `${bytes} bytes`}

                {data.firstCharOn && data.finishedOn && data.createdOn && <>, {timeDiffTxt(data.firstCharOn - data.createdOn)} + {timeDiffTxt(data.finishedOn - data.firstCharOn)}</>}
                {data?.finishReason && data?.finishReason !== "null" && ", finish reason " + data.finishReason}
                {data?.data?.tokenUsage?.prompt_tokens && `, ${data?.data?.tokenUsage?.prompt_tokens} tokens prompt`}


            </Div>

            <Div hidden={model} className="text-xs opacity-50 px-2 py-1 select-none">
                {bytes} bytes
                {data.createdOn && <>, {createdOnAgo}</>}</Div>

        </div >
    )
}