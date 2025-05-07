import { useState } from "react";
import Message from "./Message";

function Messages({ messages, loadingIndex, editingIndex, onDelete }) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    function handleDelete(from, to) {
        setSelectedIndex(-1);
        onDelete(from, to);
    }
    return (
        <>
            {messages.map((message, index) => (
                <Message key={message.createdOn + "/" + index}
                    index={index}
                    data={message}
                    selected={selectedIndex === index}
                    role={message.role}
                    content={message.content}
                    error={message.error}
                    model={message.model}
                    deleted={message.deleted}
                    createdOn={message.createdOn}
                    loading={index === loadingIndex}
                    onDelete={() => { handleDelete(index, index) }}
                    onDeleteBefore={() => { handleDelete(0, index - 1) }}
                    onDeleteAfter={() => { handleDelete(index + 1, index + messages.length) }}
                />
            ))}
        </>
    );
}

export default Messages