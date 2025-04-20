import { useEffect, useMemo, useState } from "react";
import Modal from "./components/Modal";
import { Select } from "./components/Select";
import { getEndpointInfo, getEndpointNames } from "./utils/endpoints";
import { EndpointConfig } from "./EndpointConfig";
import { Div } from "./components/UI";
import { useConfig } from "./ConfigContext";

export function Config({ shown, onDone, readonly }) {

    const { endpoint, config, getConfigByEndpoint, update } = useConfig();

    const [renderConfig, setRenderConfig] = useState(config);
    const [renderEndpoint, setRenderEndpoint] = useState(endpoint);

    const endpointInfo = useMemo(() => { return getEndpointInfo(renderEndpoint) }, [renderEndpoint]);

    const changed = useMemo(() => {
        return renderEndpoint !== endpoint || JSON.stringify(renderConfig) !== JSON.stringify(config);
    }, [renderConfig, config, renderEndpoint, endpoint]);

    useEffect(() => {
        setRenderConfig({ ...config });
        setRenderEndpoint(endpoint);
    }, [shown]);

    function handleCancel() {
        onDone();
    }

    function handleApply() {
        if (readonly) return;
        update(renderEndpoint, renderConfig);
        onDone();
    }

    function changeEndpoint(value) {
        if (readonly) return;
        setRenderEndpoint(value);
        setRenderConfig(getConfigByEndpoint(value));
    }

    function handleChange(endpointConfig) {
        if (readonly) return;
        setRenderConfig({ ...endpointConfig });
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
                        value={renderEndpoint}
                        onChange={changeEndpoint}
                        options={getEndpointNames()} />
                </div>

                <div className="text-xs p-2 px-3 text-black/50 bg-neutral-200/50 rounded-sm">
                    {endpointInfo?.about}
                </div>
            </div>

            <EndpointConfig config={renderConfig} onChange={handleChange} endpointInfo={endpointInfo} />

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
