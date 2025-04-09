import { wait } from "./helpers";

class EchoApi {

    async loadModelList(url, authKey = "") {
        await wait(500);
        if (url.indexOf("xxx") > -1) {
            throw new Error("Error loading model list, caused by \"xxx\" in baseUrl!");
        }
        return [
            { name: "echo-assistant-1", },
            { name: "echo-assistant-2", },
            { name: "echo-assistant-3", }
        ];
    }

    continueChat(url, modelName, messages, parameters, authKey = "") {
        let finish_reason = null;
        let n = -1;

        //left onny role and content, remove all other properties
        messages = messages.map((m) => {
            return { role: m.role, content: m.content };
        });

        const lastMessage = messages[messages.length - 1].content;
        console.log("lastMessage", messages[messages.length - 1]);
        return {
            finish_reason: () => finish_reason,
            read: async () => {
                console.log("Reading...");
                if (finish_reason) {
                    return false;
                }
                n++;
                if (n === 0 && modelName === "echo-assistant-3") {
                    await wait(1500);
                    throw new Error("Built-in model echo-assistant-3 always throw error after 1.5s!");
                }
                if (n === 0) {
                    await wait(500);
                    return url + "\n" + modelName + "\n" + "You said:\n\n";
                }
                if (n === 9) finish_reason = "stop";
                if (n === 3 && modelName === "echo-assistant-2") {
                    throw new Error("Built-in model echo-assistant-2 always throw error in the middle!");
                }
                if (n < 10) {
                    await wait(300);
                    return n + ") " + lastMessage + "\n";
                }

                return false;

            },
            abort: () => { finish_reason = "aborted"; },
        };
    }
}

export default EchoApi;
