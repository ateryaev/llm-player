import { useMemo, useState } from "react";

export function Div({ hidden, children, ...props }) {
    if (hidden) return null;
    return (
        <div {...props} >
            {children}
        </div>
    )
}

export function Textarea({ value, secret, ...props }) {

    //const [renderValue, setRenderValue] = useState(value);
    const [focused, setFocused] = useState(false);
    const masked = useMemo(() => {
        return (secret && !focused);
    }, [focused, secret]);

    const maskedValue = useMemo(() => {
        //replace all letters but spaces, commas, linebreaks, and quotes with *
        return value.replace(/[a-zA-Z0-9]/g, '*');
    }, [value]);

    return (
        <textarea
            className="p-2 px-3 rounded-sm transition-all outline-none gap-2 block w-full bg-white ring-2 ring-neutral-200
            focus:ring-blue-300 focus:bg-blue-50 text-neutral-500 focus:text-black" rows={4}
            value={masked ? maskedValue : value}
            onChange={(e) => { console.log(e.target.value); }}
            onFocus={(e) => {
                setFocused(true);
                e.target.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
            onBlur={() => { setFocused(false) }}

            {...props} />
    )
}

export function Input({ hidden, ...props }) {
    if (hidden) return null;
    return (
        <input className="transition-all p-2 px-3 outline-none  bg-white
                        rounded-sm w-full flex-1
                        ring-2 ring-neutral-200 focus:ring-blue-300 focus:bg-blue-50"
            onFocus={(e) => {
                e.target.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"

            {...props} />
    );
}