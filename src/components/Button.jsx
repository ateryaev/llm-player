import { useRef } from "react";
import { CharSpinner } from "./Cursors";

export function Button({ children, disabled, hidden, className, onClick, ...props }) {
    if (hidden) {
        return null;
    }
    const btnRef = useRef(null);
    if (disabled) {
        return (
            <button className={`${className} text-neutral-400 select-none`}
                disabled={true}
                {...props}>[{children}]
            </button>
        )
    }

    function handleClick(e) {
        btnRef.current.blur();
        if (onClick) {
            setTimeout(onClick, 10);
        }
    }

    return (
        <button ref={btnRef} className={`whitespace-nowrap text-nowrap text-blue-500 select-none outline-none 
            active:xxbg-blue-300 cursor-pointer group/btn p-1x hover:font-bold active:font-bold
            focus:font-bold ${className}`}
            {...props} onClick={handleClick}>
            <span className="group-focus/btn:inline-block hidden"><CharSpinner chars={" ["} /></span>
            <span className="group-focus/btn:hidden inline-block">[</span>
            <span className="xgroup-focus:font-bold xgroup-focus:underline">{children}</span>
            <span className="group-focus/btn:inline-block hidden"><CharSpinner chars={" ]"} /></span>
            <span className="group-focus/btn:hidden inline-block">]</span>

        </button>
    )
}

