import { useState } from "react";
import Message from "./Message";

function Messages({ messages, loadingIndex, editingIndex, onDelete }) {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    return (
        <>
            {messages.map((message, index) => (
                <Message key={index}
                    selected={selectedIndex === index}
                    role={message.role}
                    content={message.content}
                    error={message.error}
                    model={message.model}
                    deleted={message.deleted}
                    loading={index === loadingIndex}
                    onDelete={() => { setSelectedIndex(-1); onDelete(index) }} />
            ))}
        </>
    );
}

export default Messages