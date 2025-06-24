import { fetchJsonWithAbort, fetchStreamWithAbort } from "./helpers";

export class OllamaLmStudioApi {

    #chatFetcher = null;
    #modelsFetcher = null;
    #finishReason = null;
    #lastData = null;

    lastFinnishReason() {
        return this.#finishReason;
    }

    lastData() {
        return this.#lastData;
    }

    abortLoadingModels = () => {
        if (typeof this.#modelsFetcher?.abort === "function") {
            this.#modelsFetcher.abort();
        }
    }

    loadModelList = async (url) => {
        this.abortLoadingModels(); // Call abort to cancel any previous request
        if (this.#modelsFetcher !== null) {
            console.log("Loading models still in progress...");
            return null;
        }

        this.#modelsFetcher = fetchJsonWithAbort(`${url}/models`);

        try {
            const data = await this.#modelsFetcher.loader(); //can throw error if aborted
            return data.map(model => ({ name: model.id }));
        } catch (error) {
            console.error("Error loading models:", error);
            throw error; // Rethrow the error to handle it in the calling code
        } finally {
            this.#modelsFetcher = null;
        }
    }

    continueChatStart(url, modelName, messages, config) {
        console.log("continueChatStart...");
        this.abortLoadingChat(); // Call abort to cancel any previous request
        if (this.#chatFetcher !== null) {
            console.log("Loading chat still in progress...");
            return false;
        }

        config.temperature = config.temperature * 1.0 + 1.0;
        if (config.temperature) {
            config.temperature -= 1.0; // Normalize temperature to be between 0 and 1
            config.temperature = Math.min(Math.max(config.temperature, 0), 1);
        }

        config.maxTokens = config.maxTokens * 1;
        if (config.maxTokens) {
            config.maxTokens = Math.round(config.maxTokens); // Normalize max tokens to be an integer
            config.maxTokens = Math.min(Math.max(config.maxTokens, 5), 4000);
        }

        const params = {
            ...(config.maxTokens && { max_tokens: config.maxTokens }),
            ...(config.topP && { top_p: config.topP }),
            ...(config.temperature && { temperature: config.temperature }),
        };

        if (config.systemPrompt) {
            messages.unshift({ role: "system", content: config.systemPrompt });
        }

        this.#chatFetcher = fetchStreamWithAbort(`${url}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...config.headers
            },

            body: JSON.stringify({
                messages,
                stream: true,
                model: modelName,
                ...params,
            })
        });

        this.#finishReason = null; // Reset the finish reason
    }

    async continueChatLoader() {
        if (!this.#chatFetcher) {
            console.error("No chat loader function available. Did you call continueChatStart?");
            return null;
        }

        console.log("continueChatLoader...");
        let chunks = [];

        try {
            chunks = await this.#chatFetcher.loader();

            if (chunks === null) {
                this.#chatFetcher = null; // Reset the loader function after use
                return null; // Return null if the stream is done
            }

            //TODO: take stats from the last chunk
            this.#lastData = chunks[chunks.length - 1]; // Store the last chunk data
            this.#finishReason = chunks[chunks.length - 1]?.choices?.[0]?.finish_reason || null; // Store the finish reason
            return chunks.map(c => c.choices?.[0]?.delta?.content).join("");
        } catch (error) {
            console.error("Error during chat loading:", error);
            this.#chatFetcher = null; // Reset the loader function after use
            throw error; // Rethrow the error to handle it in the calling code
        }
    }

    abortLoadingChat() {
        if (typeof this.#chatFetcher?.abort === "function") {
            this.#chatFetcher.abort();
        }
    }
}
