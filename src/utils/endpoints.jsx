import { OllamaLmStudioApi } from "./endpoint-ollama-lm-studio";
import BuiltInApi from "./endpoint-built-in";
import { CustomOpenAiApi } from "./endpoint-openai-like-custom";

const endpoints = [
    {
        name: "built-in",
        implementation: new BuiltInApi(),
        about: "Built-in models for testing purposes. Experiment with different models to observe varying behaviors.",
        usedParams: ["model"],
        defaultConfig: {
            endpoint: "built-in",
            model: "built-in-story-teller"
        }
    },
    {
        name: "ollama-lm-studio",
        implementation: new OllamaLmStudioApi(),
        about: "OpenAI-compatible API. Can be used with LM Studio or OLLAMA server. Includes a model list loader.",
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
        name: "custom-openai-compatible",
        implementation: new CustomOpenAiApi(),
        about: "OpenAI-compatible API. Can be used with any compatible servers. Ensure headers are set, e.g., for API keys.",
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

