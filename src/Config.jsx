import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./components/Modal";
import { Select } from "./components/Select";
import { Button } from "./components/Button";
import { getEndpointInfo, getEndpointNames } from "./utils/endpoints";
import { EndpointConfig } from "./EndpointConfig";
import { Div } from "./components/UI";

export function Config({ shown, defaultConfig, onChange, readonly }) {

    const [config, setConfig] = useState(defaultConfig);
    //const [changed, setChanged] = useState(false);
    const currentConfig = useMemo(() => { return config?.endpoints[config.index] }, [config]);
    const endpointInfo = useMemo(() => { return getEndpointInfo(config.index) }, [currentConfig]);

    const changed = useMemo(() => {
        return JSON.stringify(config) !== JSON.stringify(defaultConfig);
    }, [config, defaultConfig]);

    useEffect(() => {
        setConfig(defaultConfig);
    }, [shown, defaultConfig]);

    function handleCancel() {
        setConfig(defaultConfig);
        onChange(null);
    }
    function handleApply() {
        onChange(config);
    }

    function changeEndpoint(value) {
        if (readonly) return;
        const newConfig = { ...config, index: value };
        setConfig(newConfig);
    }

    function handleChange(endpointConfig) {
        if (readonly) return;
        setConfig({ ...config, endpoints: { ...config.endpoints, [config.index]: endpointConfig } });
    }

    return (
        <Modal isOpen={shown}
            title={<>Configuration<Div hidden={!readonly} className="font-normal text-xs px-2 text-center text-neutral-500">generating &rarr; readonly</Div></>}
            actionName={changed ? "Apply" : "Close"}
            onAction={changed ? handleApply : undefined}
            onClose={handleCancel}>

            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4 ">

                <div className="">
                    <div className="p-2">Endpoint Type</div>
                    <Select
                        value={config.index}
                        onChange={changeEndpoint}
                        options={getEndpointNames()} />
                </div>

                <div className="text-xs p-2 px-3 text-black/50 bg-neutral-200/50 rounded-sm">
                    {endpointInfo?.about}
                </div>
            </div>

            <EndpointConfig config={currentConfig} onChange={handleChange} endpointInfo={endpointInfo} />

            <div className="flex max-w-3xl m-auto gap-2 flex-col p-4 pt-0">
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

        </Modal>
    );
}
