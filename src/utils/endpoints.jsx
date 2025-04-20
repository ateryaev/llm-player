import { OllamaLmStudioApi } from "./endpoint-ollama-lm-studio";
import BuiltInApi from "./endpoint-built-in";
import { CustomOpenAiApi } from "./endpoint-openai-like-custom";

const endpoints = [
    {
        name: "built-in",
        implementation: new BuiltInApi(),
        about: "Built-in models for testing purposes. Try different models for different behaviors.",
        usedParams: ["model"],
        defaultConfig: {
            endpoint: "built-in",
            model: "built-in-story-teller"
        }
    },
    {
        name: "ollama-lm-studio",
        implementation: new OllamaLmStudioApi(),
        about: "OpenAI compatibile API. Can be used for LM Studio or OLLAMA server. It has model list loader.",
        usedParams: ["model", "baseUrl", "systemPrompt", "maxTokens", "temperature"],
        defaultConfig: {
            baseUrl: "http://localhost:1234/v1",
            systemPrompt: "Response in English only.",
            maxTokens: 500,
            temperature: 0.8,
            model: "google_gemma-3-4b-it",
        }
    },
    {
        name: "custom-openai-compatibile",
        implementation: new CustomOpenAiApi(),
        about: "OpenAI compatibile API. Can be used for any compatible servers. Make sure to set headers, e.g. for api-key.",
        usedParams: ["model", "baseUrl", "systemPrompt", "maxTokens", "temperature", "headers"],
        defaultConfig: {
            baseUrl: "https://nvdc-prod-euw-llmapiorchestration-app.azurewebsites.net/v1.1",
            systemPrompt: "Response in English only.",
            headers: '"api-key": "my_api_key",\n"workspacename": "my_workspace_name"',
            maxTokens: 400,
            temperature: 0.2,
            model: "gpt-4o-mini",
        }
    }
];

export function getEndpointInfo(endpointName) {
    const endpointIndex = endpoints.findIndex((e) => e.name === endpointName);
    return endpointIndex < 0 ? null : endpoints[endpointIndex];
}

export function getEndpointNames() {
    return endpoints.map((e) => e.name);
}

