import { useEffect, useMemo, useState } from "react";
import Modal from "./components/Modal";
import { Select } from "./components/Select";
import { Button } from "./components/Button";
import { CharSpinner } from "./components/Cursors";
import { getEndpointInfo, getEndpointNames } from "./utils/endpoints";
import { PROMPT_TEMPLATES } from "./utils/promptTemplate";

export function Config({ shown, defaultConfig, onChange }) {

    const [config, setConfig] = useState(defaultConfig || {});
    const [modelsEndpoint, setModelsEndpoint] = useState("");
    const [modelsBaseUrl, setModelsBaseUrl] = useState("");
    const [models, setModels] = useState([]); //[{ name: "echo-1", }, ...]
    const [loading, setLoading] = useState(false);
    const [loadingError, setLoadingError] = useState(null);

    const endpointInfo = useMemo(() => { return getEndpointInfo(config.endpoint) }, [config.endpoint]);
    const isBuiltin = useMemo(() => { return endpointInfo.name === "built-in" }, [endpointInfo.name]);
    const areModelsRecent = useMemo(() => { return modelsEndpoint === config.endpoint && modelsBaseUrl === config.baseUrl }, [modelsEndpoint, modelsBaseUrl, config.endpoint, config.baseUrl]);

    useEffect(() => {
        // if (shown) {
        setConfig(defaultConfig || {});
        //fetchModels();
        // }
    }, [shown, defaultConfig]);

    const fetchModels = async () => {
        if (loading) return;
        let list = [];
        setLoading(true);
        try {
            list = await endpointInfo.implementation.loadModelList(config.baseUrl);
            setModelsEndpoint(config.endpoint);
            setModelsBaseUrl(config.baseUrl);
            setLoadingError(null);
        } catch (error) {
            setModelsEndpoint("");
            setModelsBaseUrl("");
            setLoadingError(error.message);
            console.error("Error loading models:", error);
        }
        setModels(list);
        setLoading(false);
    };

    function handleCancel() {
        setConfig(defaultConfig || {});
        onChange(null);
    }
    function handleApply() {
        onChange(config);
    }


    return (
        <Modal isOpen={shown} onClose={handleCancel} title={"Config"} actionName={"Apply"} onAction={handleApply}>


            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4 ">

                <div className="">
                    <div className="p-2">Endpoint Type</div>
                    <Select
                        value={config.endpoint}
                        onChange={(value) => { setConfig({ ...config, endpoint: value }) }}
                        options={getEndpointNames()} />
                </div>

                <div className="text-xs p-2 px-3 text-black/50 bg-neutral-200/50 rounded-sm">
                    {endpointInfo.about}
                </div>
            </div>

            <div className="border-b-2 border-dotted border-black/20"></div>

            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4">
                <div className="">
                    <div className="p-2">Base URL</div>
                    <input className="transition-all p-2 px-3 outline-none bg-white
                        rounded-sm w-full ring-2 ring-neutral-200 focus:ring-blue-300 focus:bg-blue-50"
                        value={config.baseUrl}
                        onChange={(e) => { setConfig({ ...config, baseUrl: e.target.value }) }} />
                </div>

                <div>
                    <div className="p-2">API Key</div>
                    <input className="transition-all p-2 px-3 outline-none  bg-white
                        rounded-sm w-full 
                        ring-2 ring-neutral-200 focus:ring-blue-300 focus:bg-blue-50"
                        value={config.apiKey}
                        onChange={(e) => { setConfig({ ...config, apiKey: e.target.value }) }} />
                </div>



                <div className="">
                    <div className="p-2 flex justify-between">
                        <div className="">
                            Model Name
                        </div>
                        <div className="flex gap-2">
                            <CharSpinner chars={"-\\|/"} ms={150} hidden={!loading} />
                            <CharSpinner chars={" >"} hidden={loading || areModelsRecent} />

                            <Button disabled={loading} className={"animate-pulsex"} onClick={fetchModels}>
                                reload
                            </Button>
                        </div>
                    </div>

                    {loadingError &&
                        <div className={"p-2 bg-red-400 text-white " + (loading && "opacity-50")}>{loadingError}</div>
                    }

                    {!loadingError && <Select
                        value={config.model}
                        onChange={(value) => { setConfig({ ...config, model: value }) }}
                        options={models.map((model) => model.name)} />}
                </div>

                {/* <div className="">
                    <div className="p-2">Prompt Template</div>
                    <Select
                        value={config.promptTemplate}
                        onChange={(value) => { setConfig({ ...config, promptTemplate: value }) }}
                        options={PROMPT_TEMPLATES.map(p => p.name)} />
                </div> */}

            </div>

            <div className="border-b-2 border-dotted border-black/20"></div>

            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4">


                <div className="">
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">Temperature</div>
                        <Button>add</Button><Button>dec</Button>
                    </div>
                    <div className="flex gap-2">
                        <input className="transition-all p-2 px-3 outline-none  bg-white
                        rounded-sm w-full flex-1
                        ring-2 ring-neutral-200 focus:ring-blue-300 focus:bg-blue-50"
                            value={config.temperature}
                            onChange={(e) => { setConfig({ ...config, temperature: e.target.value }) }} />
                    </div>
                </div>

                <div className="">
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">Max Tokens</div>
                        <Button>add</Button><Button>dec</Button>
                    </div>
                    <div className="flex gap-2">
                        <input className="transition-all p-2 px-3 outline-none  bg-white
                        rounded-sm w-full flex-1
                        ring-2 ring-neutral-200 focus:ring-blue-300 focus:bg-blue-50"
                            value={config.maxTokens}
                            onChange={(e) => { setConfig({ ...config, maxTokens: e.target.value }) }} />

                    </div>
                </div>

                <div className="">
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">System Prompt</div>
                    </div>
                    <textarea className="p-2 px-3 rounded-sm transition-all outline-none gap-2 block w-full bg-white
                    ring-2 ring-neutral-200 focus:ring-blue-300 focus:bg-blue-50" rows={3}
                        onFocus={(e) => {
                            e.target.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }}
                        value={config.systemPrompt}
                        onChange={(e) => { setConfig({ ...config, systemPrompt: e.target.value }) }} />
                </div>
                <div className="p-2 text-center text-neutral-500 text-xs">
                    LLM-Player by Anton Teryaev, 2025
                    <br />
                    github.com/ateryaev/llm-player
                </div>
            </div>
        </Modal >
    );
}
