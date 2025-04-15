export const PROMPT_TEMPLATES = [
    {
        name: "Empty",
        beforeSystem: "",
        afterSystem: "",
        beforeUser: "",
        afterUser: "",
        beforeAssistant: "",
        afterAssistant: "",
    },
    {
        name: "ChatML",
        beforeSystem: "<|im_start|>system\n",
        afterSystem: "<|im_end|>\n",
        beforeUser: "<|im_start|>user\n",
        afterUser: "<|im_end|>\n",
        beforeAssistant: "<|im_start|>assistant\n",
        afterAssistant: "<|im_end|>\n",
    },
    {
        name: "Llama 2",
        beforeSystem: "[INST]<<SYS>>\n",
        afterSystem: "<</SYS>>[/INST]\n",
        beforeUser: "[INST]",
        afterUser: "[/INST]\n",
        beforeAssistant: "",
        afterAssistant: "",
    },
]

export function applyPromptTemplate(messages, templateName) {
    const template = PROMPT_TEMPLATES.find(t => t.name === templateName);
    if (!template) return messages;

    return messages.map(message => {
        if (message.role === "system") {
            message.content = template.beforeSystem + message.content + template.afterSystem;
        } else if (message.role === "user") {
            message.content = template.beforeUser + message.content + template.afterUser;
        } else if (message.role === "assistant") {
            message.content = template.beforeAssistant + message.content + template.afterAssistant;
        }
        return message;
    });
}
