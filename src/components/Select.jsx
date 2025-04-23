import { useRef } from "react";
import { BlinkingCursor, CharSpinner } from "./Cursors";
import { Div } from "./UI";
import { wait } from "../utils/helpers";

export function Select({ ref, hidden, value, onChange, options, loading, error }) {

    const allRef = useRef(null);
    const isValidValue = options.includes(value) && !error;
    const isLoaded = (error || options.length > 0) && !loading;
    const dropdownRef = useRef(null);

    function handleClick(option) {
        onChange(option);
        (ref || dropdownRef).current.blur();
    }

    if (hidden) return null;

    return (
        <div ref={ref || dropdownRef} className="relative outline-none cursor-pointer flex flex-col gap-1 group"
            tabIndex={0}
            onFocus={async () => {
                await wait(0);
                allRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}>

            <div className="group-focus:invisible rounded-sm p-2 px-3 ring-2 ring-neutral-200 bg-white flex gap-2 justify-between items-center">
                <div className={(isLoaded ? (!isValidValue ? "text-red-500 " : "") : "opacity-50")}>
                    {value}<CharSpinner hidden={!isLoaded || isValidValue} chars={" ?"} ms={250} />&nbsp;
                </div>
                <Div hidden={loading}>[+]</Div>
                <Div hidden={!loading} className="text-nowrap w-fit">[<CharSpinner chars={"-\\|/"} />]</Div>
            </div>

            <div ref={allRef}
                className="absolute scroll-m-4 z-20 ring-2 group ring-blue-400 h-fit group-focus:flex hidden bg-white p-0 max-h-52 
                        inset-0 cursor-pointer overflow-y-auto overflow-x-clip rounded-sm shadow-lg shadow-black/20  flex-col gap-0 justify-between items-stretch
                        dark:shadow-white/80">
                <div hidden={loading}
                    onClick={() => handleClick(value)}
                    className={`p-2 px-3 border-b-2 border-blue-400 bg-blue-50 xtext-blue-600`}
                >{value}&nbsp;</div>

                <Div hidden={!loading} className="p-2 px-3 flex gap-2 justify-between items-center">
                    {value}
                    <div className="text-nowrap w-fit">[<CharSpinner chars={"-\\|/"} />]</div>
                </Div>

                {!loading && options.map((option, index) => (
                    <div key={index}
                        onClick={() => handleClick(option)}
                        className={`p-2 px-3 ${option === value ? "bg-blue-400 hover:text-blue-50 text-blue-50" : "hover:text-blue-600"}`}
                    >{option}</div>
                ))}

                <Div hidden={error || loading || options.length > 0}
                    className="p-2 px-3 text-red-600"
                    onClick={() => dropdownRef.current.blur()}>
                    no models, try to reload
                </Div>

                <Div hidden={!error}
                    className="p-2 px-3 text-red-500 bg-red-50 xtext-xs"
                    onClick={() => dropdownRef.current.blur()}>
                    error: {error}
                </Div>
            </div>
        </div >

    );
}
