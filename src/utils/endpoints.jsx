import { OllamaLmStudioApi } from "./endpoint-ollama-lm-studio";
import BuiltInApi from "./endpoint-built-in";
import { CustomOpenAiApi } from "./endpoint-openai-like-custom";

const endpoints = [
    {
        name: "built-in",
        implementation: new BuiltInApi(),
        baseUrlExample: "built-in",
        about: "Built-in models for testing purposes. Try different models for different behaviors.",
        usedParams: [],
        defaultConfig: {
            endpoint: "built-in",
            model: "built-in-story-teller"
        }
    },
    {
        name: "ollama-lm-studio",
        implementation: new OllamaLmStudioApi(),
        baseUrlExample: "http://localhost:1234/v1",
        about: "OpenAI compatibility API. Can be used for LM Studio or OLLAMA server.",
        usedParams: ["baseUrl", "systemPrompt", "maxTokens", "temperature"],
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
        baseUrlExample: "http://localhost:1234/v1",
        about: "OpenAI compatibility API. Can be used for any compatible servers. Make sure to set headers, e.g. for api-key.",
        usedParams: ["baseUrl", "systemPrompt", "maxTokens", "temperature", "headers"],
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

