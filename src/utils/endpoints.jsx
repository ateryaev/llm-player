import { OllamaLmStudioApi } from "./endpoint-ollama-lm-studio";
import BuiltInApi from "./endpoint-built-in";
import { CustomOpenAiApi } from "./endpoint-openai-like-custom";

const endpoints = [
    {
        name: "built-in",
        implementation: new BuiltInApi(),
        baseUrlExample: "built-in",
        about: "Built-in models for testing purposes. Try different models for different behaviors.",
        usedParams: []
    },
    {
        name: "ollama-lm-studio",
        implementation: new OllamaLmStudioApi(),
        baseUrlExample: "http://localhost:1234/v1",
        about: "OpenAI compatibility API. Can be used for LM Studio or OLLAMA server.",
        usedParams: ["baseUrl", "systemPrompt", "maxTokens", "temperature"]
    },
    {
        name: "custom-openai-compatibile",
        implementation: new CustomOpenAiApi(),
        baseUrlExample: "http://localhost:1234/v1",
        about: "OpenAI compatibility API. Can be used for any compatible servers. Make sure to set headers, e.g. for api-key.",
        usedParams: ["baseUrl", "systemPrompt", "maxTokens", "temperature", "headers"]
    }
];

export function getEndpointInfo(endpointName) {
    const endpointIndex = endpoints.findIndex((e) => e.name === endpointName);
    return endpointIndex < 0 ? null : endpoints[endpointIndex];
}

export function getEndpointNames() {
    return endpoints.map((e) => e.name);
}

