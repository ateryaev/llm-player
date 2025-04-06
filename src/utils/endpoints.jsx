import { OpenAiApi } from "./openai";
import EchoApi from "./echo";

const endpoints = [
    {
        name: "built-in",
        implementation: new EchoApi(),
        baseUrlExample: "built-in",
        about: "Built-in models for testing purposes. Just repeating what you ask. Try different models for different behaviors."
    },
    {
        name: "OpenAI compatibility API",
        implementation: new OpenAiApi(),
        baseUrlExample: "http://localhost:1234/v1",
        about: "OpenAI compatibility API. Can be used for LM Studio or OLLAMA."
    }
];

export function getEndpointInfo(endpointName) {
    const endpointIndex = endpoints.findIndex((e) => e.name === endpointName);
    return endpointIndex < 0 ? null : endpoints[endpointIndex];
}

export function getEndpointNames() {
    return endpoints.map((e) => e.name);
}

