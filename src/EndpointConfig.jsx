import { useMemo, useRef, useState } from "react";
import { Div, Input, Textarea } from "./components/UI";
import { Button } from "./components/Button";
import { ModelSelector } from "./ModelSelector";
import { CharSpinner } from "./components/Cursors";

export function EndpointConfig({ config, onChange, endpointInfo }) {

    const isHeadersValid = useMemo(() => {
        try {
            const headers = JSON.parse("{" + config.headers + "}");
            return typeof headers === "object" && headers !== null;
        } catch (e) {
            return false;
        }
    }, [config.headers]);

    const hasModelLoader = useMemo(() => !!endpointInfo.implementation.abortLoadingModels, [endpointInfo])

    function hasParam(param) {
        return endpointInfo.usedParams.includes(param);
    }

    function change(param, value) {
        const newConfig = { ...config, [param]: value };
        onChange(newConfig);
    }

    function handleConfigAdd(param, delta, min = 0, max = 100, defaultValue = 0) {
        let value = isNaN(parseFloat(config[param])) ? defaultValue : parseFloat(config[param]);
        console.log("handleConfigAdd", param, value, delta, min, max);
        console.log("value", value);
        value = Math.min(Math.max(value + delta, min), max);
        console.log("value", value);
        value = Math.round(value * 100) / 100;
        change(param, value);
    }

    return (
        <>
            <div className="border-b-2 border-dotted border-black/20"></div>

            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4">

                <Div hidden={!hasParam("baseUrl")}>
                    <div className="p-2">Base URL</div>
                    <Input
                        autoComplete="baseUrl"
                        name="baseUrl"
                        id="baseUrl"
                        placeholder="E.g. http://192.168.100.105:1234/v1"
                        value={config.baseUrl}
                        onChange={(e) => { change("baseUrl", e.target.value) }} />
                </Div>

                <ModelSelector value={config.model}
                    onChange={(value) => { change("model", value) }}
                    loader={() => endpointInfo.implementation.loadModelList(config.baseUrl, config.headers)}
                    abort={hasModelLoader ? (() => endpointInfo.implementation.abortLoadingModels()) : null} />

                <Div hidden={!hasParam("headers")}>
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">Headers</div>

                        <Div hidden={!isHeadersValid} className="text-green-600">valid</Div>
                        <Div hidden={isHeadersValid} className="text-red-600">
                            <CharSpinner chars={" ."} />invalid</Div>
                    </div>
                    <Textarea
                        secret={true}
                        spellCheck={false}
                        placeholder={'Example:\n"api-key": "MYAPIKEY",\n"workspacename": "MYWORKSPACENAME", \n'}
                        value={config.headers}
                        onChange={(e) => { change("headers", e.target.value) }} />
                </Div>

            </div>

            <Div hidden={!hasParam("temperature")} className="border-b-2 border-dotted border-black/20"></Div>

            <div hidden={!hasParam("temperature")} className="flex max-w-3xl m-auto gap-2 flex-col p-4">

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
                            onChange={(e) => { change("temperature", e.target.value) }} />
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
                            onChange={(e) => { change("maxTokens", e.target.value) }} />

                    </div>
                </Div>

                <Div hidden={!hasParam("systemPrompt")}>
                    <div className="p-2 flex justify-between gap-1">
                        <div className="flex-1">System Prompt</div>
                    </div>
                    <Textarea
                        placeholder={"Example:\nResponse with jokes and sarcasm."}
                        value={config.systemPrompt}
                        onChange={(e) => { change("systemPrompt", e.target.value) }}
                    />
                </Div>

            </div>
        </>
    );
}