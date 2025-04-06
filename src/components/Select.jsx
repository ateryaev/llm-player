import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

export function Select({ value, onChange, options }) {

    const [isOpen, setIsOpen] = useState(false);

    const isValidValue = options.includes(value);

    const dropdownRef = useRef(null);
    function handleChange(e) {
        setIsOpen(!isOpen);
        setTimeout(() => {
            e.target.blur();
        }, 0);
    }

    function handleClick(option) {
        setIsOpen(false);
        onChange(option);
        dropdownRef.current.blur();
    }

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };


    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="relative outline-none cursor-pointer w-full flex flex-col gap-1 group"
                ref={dropdownRef} tabIndex={0}>

                <div className={"group-focus:invisible rounded-sm p-2 px-3 ring-2 ring-neutral-200 bg-white flex gap-2 justify-between items-center " + (!isValidValue && "bg-red-100")}>
                    <div className={!isValidValue && "text-red-500x"}>
                        {value}&nbsp;
                    </div>
                    <div>[+]</div>
                </div>

                <div
                    className="absolute z-20 ring-2 group ring-blue-400 h-fit group-focus:flex hidden bg-white p-0 max-h-52 
                        inset-0 cursor-pointer overflow-auto rounded-sm shadow-lg shadow-black/20  flex-col gap-0 justify-between items-stretch">
                    <div
                        onClick={() => handleClick(value)}
                        className={`p-2 px-3 border-b-2 border-blue-400 bg-blue-50 xtext-blue-600`}
                    >{value}&nbsp;</div>

                    {options.map((option, index) => (
                        <div key={index}
                            onClick={() => handleClick(option)}
                            className={`p-2 px-3 ${option === value ? "bg-blue-400 hover:text-blue-50 text-blue-50" : "hover:text-blue-600"}`}
                        >{option}</div>
                    ))}
                    {options.length === 0 && <div className="p-2 text-red-600" onClick={() => dropdownRef.current.blur()}
                    >no models, try to reload</div>}
                </div>
            </div >
        </>
    );
}