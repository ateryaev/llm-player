import React, { useEffect, useRef, useState } from "react";
import loadModelList, { continueChat } from "./utils/openai";
import Divider from "./components/Divider";
import Message from "./components/Message";
import Dropdown from "./components/Dropdown";
import Modal from "./components/Modal";
import Header from "./components/Header";
import SendForm from "./components/SendForm";
import Messages from "./components/Messages";
import EchoApi from "./utils/echo";
import { wait } from "./utils/helpers";
import { Button } from "./components/Button";
import { Select } from "./components/Select";
import { Config } from "./Config";
import { getEndpointInfo } from "./utils/endpoints";
//import loadModelList, continueChat from "./openai";


const echoApi = new EchoApi();

export default function OpenAIChatApp() {
  const scrollerRef = useRef(null);
  const [showConfig, setShowConfig] = useState(false);
  //const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [scrollBottom, setScrollBottom] = useState(0);

  //const [models, setModels] = useState([]);
  //const [selectedModel, setSelectedModel] = useState("echo-assistant-1");

  const [config, setConfig] = useState({
    endpoint: "built-in",
    baseUrl: "http://localhost:1234/v1",
    model: "echo-assistant-2",
    systemPrompt: "Response in English only.",
    apiKey: "YOUR_OPENAI_API_KEY",// Replace with your API key
    maxTokens: 200,
    temperature: 0.7,
    topP: 1,
  });


  function handleConfigChange(newConfig) {
    console.log("handleConfigChange", newConfig);
    //setConfig(newConfig);
    if (newConfig) {
      setConfig(newConfig);
      //save config to local storage
      localStorage.setItem("config", JSON.stringify(newConfig));
    }
    setShowConfig(false);
  }

  useEffect(() => {
    //load config from local storage
    const savedConfig = localStorage.getItem("config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);


  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    { role: "system", content: "Response in English only." },
    { role: "user", content: "What is AI?" },
    { role: "assistant", model: "start-up-model", error: "Connection timeout", content: "AI is the simulation of human intelligence in machines.\nAI is the simulation of human intelligence in machines.\nAI is the simulation of human intelligence in machines.\n" },
    { role: "user", content: "AI is the simulation of human intelligence in machines.\nAI is the simulation of human intelligence in machines.\nAI is the simulation of human intelligence in machines.\n" },
    { role: "assistant", model: "start-up-model", content: "AI is the simulation of human intelligence in machines.\nAI is the simulation of human intelligence in machines.\nAI is the simulation of human intelligence in machines.\n" },
  ]);


  // scroll to bottom when document height changing
  useEffect(() => {
    // function isScrolledToBottom() {
    //   const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    //   const scrollHeight = (document.documentElement || document.body.parentNode || document.body).scrollHeight;
    //   const clientHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;
    //   return Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    // }

    const handleScroll = () => {
      //window.scrollTo(0, document.body.scrollHeight);
      //window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth', })
    };
    //handleScroll();
  }, [chatHistory]);

  function testScrolledToBottom() {
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const scrollHeight = (document.documentElement || document.body.parentNode || document.body).scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;
    return Math.ceil(scrollTop + clientHeight) >= scrollHeight;
  }

  function calcScrollBottom() {
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const scrollHeight = (document.documentElement || document.body.parentNode || document.body).scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;
    return scrollHeight - clientHeight - scrollTop;
  }


  function scrollToBottom(bottomOffset) {
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const scrollHeight = (document.documentElement || document.body.parentNode || document.body).scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;
    //const scrollBottom = scrollHeight - clientHeight - scrollTop;

    const newScrollTop = scrollHeight - clientHeight - bottomOffset;
    console.log("- scrollToBottom", scrollTop, clientHeight, scrollHeight, scrollBottom);
    console.log("- newScrollTop", newScrollTop);
    //scrollTop+clientHeight+scrollBottom ´= scrollHeight
    window.scrollTo(0, newScrollTop);

  }



  async function sendMessage(msg) {

    scrollerRef.current && (scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight);

    console.log("sendMessage", chatHistory, config.baseUrl, config.model, msg);
    let updatedHistory = [...chatHistory, { role: "user", content: msg }, { role: "assistant", model: config.model, content: "" }];
    setChatHistory([...chatHistory, { role: "user", content: msg }]);

    await wait(300);
    setChatHistory(updatedHistory);
    setLoading(true);
    await wait(300);

    const api = getEndpointInfo(config.endpoint).implementation;

    const chat = api.continueChat(config.baseUrl, config.model, updatedHistory, { max_tokens: 200 });

    //await wait(1500);
    try {
      let chunk;
      while ((chunk = await chat.read()) !== false) {
        console.log("chunk: " + chunk + " " + chat.finish_reason());
        updatedHistory[updatedHistory.length - 1].content += chunk;
        setChatHistory([...updatedHistory]);
        //await wait(10);
      }
      console.log("Chat finished:", chat.finish_reason());
    } catch (error) {
      console.error(error);
      updatedHistory[updatedHistory.length - 1].error = error.message;
      setChatHistory([...updatedHistory]);
    }
    setLoading(false);
    //setChatHistory([...updatedHistory, { role: "assistant", content: fullResponse }]);
  }



  function handleDelete(index) {
    const prevMessages = [...chatHistory]
    chatHistory.splice(index, 1);
    const nextMessages = [...chatHistory]
    setChatHistory(nextMessages);
  }

  return (
    <>
      {/* <Header url={baseURL} model={selectedModel} /> */}
      <div className="bg-white neutral-200 py-4 w-full top-0 sticky z-10 ring-2 ring-black/10">

        <div className="px-4 m-auto overflow-hidden max-w-3xl opacity-50 text-ellipsis whitespace-nowrap text-xs">
          {config.endpoint === "built-in" ? "built-in" : config.baseUrl}
        </div>
        <div className="px-4 m-auto max-w-3xl text-whitex  flex gap-2 items-end">
          <div className="flex-1 font-boldx text-ellipsis whitespace-nowrap">
            {config.model}
          </div>
          <Button className={"text-whitex"} onClick={() => setShowConfig(true)}>config</Button>
        </div>
      </div >

      <div ref={scrollerRef} className="flex-1 flex w-full flex-col-reverse overflow-auto items-stretch">
        <div className="max-w-3xl w-full m-auto p-4 flex flex-col gap-4 flex-1">
          <div className="text-xs p-2 bg-amber-400x opacity-25 text-center">chat #01</div>
          <Messages messages={chatHistory} loadingIndex={loading ? chatHistory.length - 1 : -1} editingIndex={0} onDelete={handleDelete}></Messages>
          <div className="text-xs p-2 opacity-25 text-center">3 messages, 55 bytes</div>
        </div>
      </div>

      <div className={"w-full bottom-0 transition-all sticky z-10 bg-white focus-within:ring-blue-300 focus-within:bg-blue-50 ring-2 ring-black/10 " +
        (false ? " translate-y-full opacity-0" : "translate-y-0 opacity-100")}>
        <SendForm message={""} active={!loading} onSend={sendMessage} />
      </div >

      <Config shown={showConfig} defaultConfig={config} onChange={handleConfigChange} />

    </>
  );
}
