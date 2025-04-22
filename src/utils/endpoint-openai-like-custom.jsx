import { OllamaLmStudioApi } from "./endpoint-ollama-lm-studio";

export class CustomOpenAiApi {
    #parent = new OllamaLmStudioApi();
    continueChatStart(url, modelName, messages, config) {

        let headersObj = {};
        try {
            headersObj = config.headers ? JSON.parse("{" + config.headers + "}") : {};
        } catch (e) { }
        const newConfig = { ...config, headers: headersObj };
        return this.#parent.continueChatStart(url, modelName, messages, newConfig);
    }

    continueChatLoader() {
        return this.#parent.continueChatLoader();
    }

    abortLoadingChat() {
        return this.#parent.abortLoadingChat();
    }

    lastData() {
        return this.#parent.lastData();
    }

    lastFinnishReason() {
        return this.#parent.lastFinnishReason();
    }
}
