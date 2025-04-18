export function Div({ hidden, children, ...props }) {
    if (hidden) return null;
    return (
        <div {...props} >
            {children}
        </div>
    )
}

export function Textarea({ ...props }) {
    return (
        <textarea
            className="p-2 px-3 rounded-sm transition-all outline-none gap-2 block w-full bg-white ring-2 ring-neutral-200
            focus:ring-blue-300 focus:bg-blue-50" rows={4}
            onFocus={(e) => {
                e.target.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
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
            {...props} />
    );
}