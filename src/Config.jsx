import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./components/Modal";
import { Select } from "./components/Select";
import { Button } from "./components/Button";
import { getEndpointInfo, getEndpointNames } from "./utils/endpoints";
import { Div, Input, Textarea } from "./components/UI";
import { wait } from "./utils/helpers";
import { CharSpinner } from "./components/Cursors";

export function Config({ shown, defaultConfig, onChange }) {

    const [config, setConfig] = useState(defaultConfig || {});
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingError, setLoadingError] = useState(null);

    const selectModelsRef = useRef(null);

    const endpointInfo = useMemo(() => { return getEndpointInfo(config.endpoint) }, [config.endpoint]);
    const canLoadModelList = useMemo(() => {
        return !!(endpointInfo?.implementation?.loadModelList)
    }, [endpointInfo?.name]);

    const isHeadersValid = useMemo(() => {
        try {
            const headers = JSON.parse("{" + config.headers + "}");
            return typeof headers === "object" && headers !== null;
        } catch (e) {
            return false;
        }
    }, [config.headers]);

    useEffect(() => {
        setConfig(defaultConfig || {});
        //setConfig({})
        console.log("Config useEffect", defaultConfig);
    }, [shown, defaultConfig]);

    function hasParam(param) {
        return endpointInfo?.usedParams.indexOf(param) > -1;
    }

    //fetching model list with possiblility to cancel
    async function fetchModels() {
        selectModelsRef.current.focus();
        setLoadingError(null);

        if (loading) return;

        setLoading(true);
        await wait(200);

        try {
            const list = await endpointInfo.implementation.loadModelList(config.baseUrl, config.headers);
            setModels(list);
            setLoadingError(null);
        } catch (error) {
            setModels([]);
            setLoadingError(error.message);
            console.error("Error loading models:", error);
        } finally {
            setLoading(false);
        }
    }

    function fetchModelsCancel() {
        endpointInfo.implementation.abortLoadingModels();
    }

    function handleCancel() {
        setConfig(defaultConfig || {});
        onChange(null);
    }
    function handleApply() {
        onChange(config);
    }

    function handleConfigAdd(param, delta, min = 0, max = 100, defaultValue = 0) {
        let value = isNaN(parseFloat(config[param])) ? defaultValue : parseFloat(config[param]);
        console.log("handleConfigAdd", param, value, delta, min, max);
        console.log("value", value);
        value = Math.min(Math.max(value + delta, min), max);
        console.log("value", value);
        value = Math.round(value * 100) / 100;
        setConfig({ ...config, [param]: value });
    }


    return (
        <Modal isOpen={shown} onClose={handleCancel} title={"Configuration"} actionName={"Apply"} onAction={handleApply}>

            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4 ">

                <div className="">
                    <div className="p-2">Endpoint Type</div>
                    <Select
                        value={config.endpoint}
                        onChange={(value) => { setConfig({ ...config, endpoint: value }) }}
                        options={getEndpointNames()} />
                </div>

                <div className="text-xs p-2 px-3 text-black/50 bg-neutral-200/50 rounded-sm">
                    {endpointInfo?.about}
                </div>
            </div>

            <div className="border-b-2 border-dotted border-black/20"></div>

            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4">

                <Div hidden={!hasParam("baseUrl")}>
                    <div className="p-2">Base URL</div>
                    <Input
                        placeholder="E.g. http://192.168.100.105:1234/v1"
                        value={config.baseUrl}
                        onChange={(e) => { setConfig({ ...config, baseUrl: e.target.value }) }} />
                </Div>

                <div className="">
                    <div className="p-2 flex justify-between">
                        <div className="">
                            Model Name
                        </div>
                        <Div className="flex gap-2" hidden={!canLoadModelList} >
                            <Button hidden={loading} onClick={fetchModels}>
                                reload
                            </Button>
                            <Button hidden={!loading} onClick={fetchModelsCancel}>
                                cancel
                            </Button>
                        </Div>
                    </div>

                    <Input
                        hidden={canLoadModelList}
                        value={config.model}
                        onChange={(e) => { setConfig({ ...config, model: e.target.value }) }} />

                    <Select
                        ref={selectModelsRef}
                        loading={loading}
                        error={loadingError}
                        hidden={!canLoadModelList}
                        value={config.model}
                        onChange={(value) => { setConfig({ ...config, model: value }) }}
                        options={models.map((model) => model.name)} />
                </div>

                <Div hidden={!hasParam("headers")}>
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">Headers</div>

                        <Div hidden={!isHeadersValid} className="text-green-500">ok</Div>
                        <Div hidden={isHeadersValid} className="text-red-500">
                            <CharSpinner chars={" >"} /> invalid</Div>
                    </div>
                    <Textarea
                        placeholder={'Example:\n"api-key": "MYAPIKEY",\n"workspacename": "MYWORKSPACENAME", \n'}
                        value={config.headers}
                        onChange={(e) => { setConfig({ ...config, headers: e.target.value }) }} />
                </Div>
            </div>

            <div className="border-b-2 border-dotted border-black/20"></div>

            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4">


                <Div hidden={!hasParam("temperature")} className="">
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">Temperature</div>
                        <Button onClick={() => handleConfigAdd("temperature", -0.1, 0, 1, 0.9)}>dec</Button>
                        <Button onClick={() => handleConfigAdd("temperature", 0.1, 0, 1, 0.9)}>add</Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="0.0 ... 1.0"
                            value={config.temperature}
                            onChange={(e) => { setConfig({ ...config, temperature: e.target.value }) }} />
                    </div>
                </Div>

                <Div hidden={!hasParam("maxTokens")}>
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">Max Tokens</div>
                        <Button onClick={() => handleConfigAdd("maxTokens", -100, 100, 4000, 500)}>dec</Button>
                        <Button onClick={() => handleConfigAdd("maxTokens", 100, 100, 4000, 500)}>add</Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="100 ... 4000"
                            value={config.maxTokens}
                            onChange={(e) => { setConfig({ ...config, maxTokens: e.target.value }) }} />

                    </div>
                </Div>

                <Div hidden={!hasParam("systemPrompt")}>
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">System Prompt</div>
                    </div>
                    <Textarea
                        placeholder={"Example:\nResponse with translation all user input into Finnish language."}
                        value={config.systemPrompt}
                        onChange={(e) => { setConfig({ ...config, systemPrompt: e.target.value }) }} />
                </Div>

                <div className="text-xs p-2 px-3 text-black/50 bg-neutral-200/50 rounded-sm">
                    Configuration and chat history are stored in the browser local storage.
                    Nothing is stored in LLM-player server side.
                    But remember once you send a message all will be sent to LLM server you provide with your base URL.
                </div>

                <div className="text-xs p-2 text-center px-3 text-neutral-600">
                    LLM-Player by Anton Teryaev, 2025
                    <br />
                    <a href="https://github.com/ateryaev/llm-player"
                        className="underline text-neutral-700 "
                        target="_blank">
                        github.com/ateryaev/llm-player</a>
                </div>


            </div>

        </Modal >
    );
}
