import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getEndpointInfo, getEndpointNames } from "./utils/endpoints";

const configContext = createContext();

// example of config object:
// allConfigs = {
//     index: "built-in",
//     endpoints: {
//         "built-in": {
//             endpoint: "built-in",
//             model: "built-in-story-teller"
//         },
//         "ollama-lm-studio": {
//             baseUrl: "http://localhost:1234/v1",
//             systemPrompt: "Response in English only.",
//             maxTokens: 500,
//             temperature: 0.8,
//             model: "google_gemma-3-4b-it",
//         },
//         "custom-openai-compatibile": {
//             baseUrl: "https://nvdc-prod-euw-llmapiorchestration-app.azurewebsites.net/v1.1",
//             systemPrompt: "Response in English only.",
//             headers: '"api-key": "my_api_key",\n"workspacename": "my_workspace_name"',
//             maxTokens: 400,
//             temperature: 0.2,
//             model: "gpt-4o-mini",
//         }
//     }
// }

export function useConfig() {
    return useContext(configContext);
}
const ENDPOINTS = getEndpointNames();
const LOCAL_STORAGE_KEY = "llm_player_config_100";

export function ConfigContextProvider({ children }) {
    const [allConfigs, setAllConfigs] = useState({});

    const endpoint = useMemo(() => {
        return ENDPOINTS.includes(allConfigs.index) ? allConfigs.index : ENDPOINTS[0]
    }, [allConfigs.index]);

    const config = useMemo(() => {
        return allConfigs?.endpoints?.[endpoint] || getEndpointInfo(endpoint).defaultConfig;
    }, [allConfigs, endpoint]);

    function removeUnusedParams(configs) {
        console.log("removeUnusedParams", configs);
        //accept only configs.index and configs.endpoints{}
        const newConfigs = { index: configs.index || ENDPOINTS[0], endpoints: {} };
        //now remove endpoints not from getEndpointNames()
        const newEndpoints = {};
        for (const endpointName of getEndpointNames()) {
            if (configs?.endpoints?.[endpointName]) {
                newEndpoints[endpointName] = configs.endpoints[endpointName];
            } else {
                newEndpoints[endpointName] = getEndpointInfo(endpointName).defaultConfig;
            }
        }
        newConfigs.endpoints = newEndpoints;
        //now remove unused params from each endpoint
        for (const endpointName of getEndpointNames()) {
            const endpointInfo = getEndpointInfo(endpointName);
            const usedParams = endpointInfo.usedParams || [];
            const newEndpointConfig = { ...newConfigs.endpoints[endpointName] };
            for (const key in newEndpointConfig) {
                if (!usedParams.includes(key)) {
                    delete newEndpointConfig[key];
                }
            }
            newConfigs.endpoints[endpointName] = newEndpointConfig;
        }
        console.log("removeUnusedParams", newConfigs);
        return newConfigs;
    }

    useEffect(() => {
        const savedConfig = localStorage.getItem(LOCAL_STORAGE_KEY) || "{}";
        try {
            const savedConfigObj = removeUnusedParams(JSON.parse(savedConfig));
            setAllConfigs(savedConfigObj);
        } catch (e) {
            console.error("Error parsing config from local storage", e);
        }
    }, []);

    function update(newEndpoint, newConfig) {
        setAllConfigs((prevConfigs) => {
            const newConfigs = { ...prevConfigs };
            newConfigs.index = newEndpoint;
            newConfigs.endpoints[newEndpoint] = { ...newConfigs.endpoints[newEndpoint], ...newConfig };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfigs));
            return newConfigs;
        });
    }

    function getConfigByEndpoint(configEndpoint) {
        return allConfigs.endpoints[configEndpoint] || getEndpointInfo(configEndpoint).defaultConfig;
    }

    return (
        <configContext.Provider value={{ endpoint, config, getConfigByEndpoint, update }}>
            {children}
        </configContext.Provider>
    );
}
