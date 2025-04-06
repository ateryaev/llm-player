import { useEffect, useState } from "react";

export function RotatingCursor() {

    const [symbol, setSymbol] = useState("-");
    useEffect(() => {
        const symbols = ["-", "\\", "|", "/"];
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % symbols.length;
            setSymbol(symbols[index]);
        }, 150);
        return () => clearInterval(interval);
    }
        , []);
    return (
        <span className="inline-block">{symbol}</span>
    );
}


export function Blink({ children }) {
    //change visibility every 500ms
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const interval = setInterval(() => {
            setVisible((prev) => !prev);
        }, 200);
        return () => clearInterval(interval);
    }
        , []);
    return (
        <span className={`inline-block ${visible ? "opacity-100" : "opacity-0"}`}>
            {children}
        </span>
    );
}

export function BlinkingCursor() {
    //change visibility every 500ms
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const interval = setInterval(() => {
            setVisible((prev) => !prev);
        }, 97);
        return () => clearInterval(interval);
    }
        , []);
    return (
        <span className={`inline-block ${visible ? "opacity-100" : "opacity-0"}`}>_</span>
    );
}

export function CharSpinner({ chars, hidden, className, ms = 250 }) {
    //e.g. chars = "-\\|/"
    //show one char at a time, change every 150ms
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % chars.length);
        }, ms);
        return () => clearInterval(interval);
    }, [chars]);
    if (hidden) return null;
    return (
        <span className={"select-none inline-block whitespace-pre " + className}>{chars[index]}</span>
    );
}