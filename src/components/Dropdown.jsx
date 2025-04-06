import React, { useState, useRef, useEffect, useMemo } from 'react';

function Option({ host, model, ...props }) {

    return (
        <div className="p-2 cursor-pointer xbg-gray-100" {...props}>
            <div className='text-xs'>{host}</div>
            <div>{model}</div>
        </div>);
}

// Define the Dropdown component
const Dropdown = ({ options, value, onChange }) => {

    const [isOpen, setIsOpen] = useState(false);
    const selected = useMemo(() => { return options.find((option) => option.value === value) }, [options, value]);

    const dropdownRef = useRef(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (optionValue) => {
        console.log("handleOptionClick", optionValue)
        onChange(optionValue);
        setIsOpen(false);
    };

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
        <div className="relative inline-block w-full text-blue-400" ref={dropdownRef}>
            <div
                className="p-2 border-4 border-white  cursor-pointer bg-blue-400 text-white"
                onClick={handleToggle}
            >
                {selected ? <Option {...selected} /> :
                    <Option host={'no model selected'} model={'Select Model'} />}
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full p-1 border-4 border-white bg-white shadow-md
                flex flex-col gap-0">
                    {options.map((option, index) => (
                        <Option key={index} {...option} onClick={() => handleOptionClick(option.value)} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
