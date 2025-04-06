export default async function loadModelList(url, authKey = "") {

    const res = await fetch(`${url}/models`, {
        headers: authKey ? { Authorization: `Bearer ${authKey}` } : {},
    });

    if (!res.ok) {
        throw new Error(`Failed to load models: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.data) throw new Error("Invalid response format");

    return data.data.map(model => ({
        name: model.id,
        context_length: model.context_length ?? null,
        state: "not-loaded",
        quantization: model.quantization ?? null,
    }));

}

export function continueChat(url, modelName, messages, parameters, authKey = "") {
    const controller = new AbortController();
    const { signal } = controller;
    const decoder = new TextDecoder("utf-8");
    /*prompt: undefined,
      model: 'cydonia-24b-v2.1',
      temperature: 1,
      max_tokens: 300,
      max_completion_tokens: undefined,
      stream: true,
      presence_penalty: 0,
      frequency_penalty: 1.12,
      top_p: 1,
      top_k: undefined,
      stop: undefined,
      logit_bias: undefined,
      seed: undefined,
      n: undefined,
      logprobs: undefined,
      top_logprobs: undefined*/
    const stream = fetch(`${url}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(authKey && { Authorization: `Bearer ${authKey}` }),
        },

        body: JSON.stringify({
            messages,
            stream: true,
            temperature: 1,
            top_p: 1,
            model: modelName,
            ...parameters,
        }),
        signal,
    });

    let reader;
    let finish_reason = null;

    return {
        finish_reason: () => finish_reason,
        read: async () => {
            console.log("Reading...");
            if (!reader) {
                const res = await stream;
                if (!res.ok) throw new Error(`Failed to continue chat: ${res.statusText}`);
                reader = res.body.getReader();
            }

            const { done, value } = await reader.read();
            if (done) return false;

            const chunk = decoder.decode(value, { stream: true });
            console.log("Chunk:", chunk);
            const lines = chunk.split("\n").filter(line => line.startsWith("data: "));
            const tokens = [];

            for (const line of lines) {
                const data = line.replace("data: ", "").trim();
                if (data === "[DONE]") {
                    console.log("DONE");
                    //return false;
                    continue;
                }

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    finish_reason = parsed.choices?.[0]?.finish_reason;
                    if (content) tokens.push(content);
                } catch (error) {
                    console.error("Failed to parse chunk:", error);
                }
            }

            return tokens.join("");
        },
        abort: () => { controller.abort(); finish_reason = "aborted"; },
    };
}

export class OpenAiApi {
    async loadModelList(url, authKey = "") {
        return await loadModelList(url, authKey);
    }

    continueChat(url, modelName, messages, parameters, authKey = "") {
        return continueChat(url, modelName, messages, parameters, authKey);
    }
}