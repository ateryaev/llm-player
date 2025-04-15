import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Button";
import { BlinkingCursor, RotatingCursor } from "./Cursors";
import { timeAgoTxt, timeDiffTxt } from "../utils/helpers";

export default function Message({ index, role, deleted, createdOn, error, content, model, loading, state, selected, data, onDelete, ...props }) {
    const [deleteing, setDeleting] = useState(false);
    const [focused, setFocused] = useState(false);
    const [createdOnAgo, setCreatedOnAgo] = useState('');

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
        console.log("handleBlur", e)
        setFocused(false);
    }
    function handleFocus() {
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