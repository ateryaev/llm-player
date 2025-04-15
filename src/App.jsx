import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./components/Modal";
import SendForm from "./components/SendForm";
import Messages from "./components/Messages";
import { wait } from "./utils/helpers";
import { Button } from "./components/Button";
import { Config } from "./Config";
import { getEndpointInfo } from "./utils/endpoints";

export default function OpenAIChatApp() {
  const scrollerRef = useRef(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [chatGenerator, setChatGenerator] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);

  const [config, setConfig] = useState({
    endpoint: "built-in",
    baseUrl: "http://localhost:1234/v1",
    model: "echo-assistant-2",
    systemPrompt: "Response in English only.",
    apiKey: "YOUR_API_KEY",// Replace with your API key
    maxTokens: 200,
    temperature: 0.7
  });

  function handleConfigChange(newConfig) {
    console.log("handleConfigChange", newConfig);
    if (newConfig) {
      setConfig(newConfig);
      localStorage.setItem("config", JSON.stringify(newConfig));
    }
    setShowConfig(false);
  }

  useEffect(() => {
    //load config from local storage
    const savedConfig = localStorage.getItem("config");
    const savedChat = localStorage.getItem("chat");
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    }
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    console.log("chatHistory changed for saving", chatHistory);
    localStorage.setItem("chat", JSON.stringify(chatHistory));
  }, [chatHistory, loading]);

  const chatSize = useMemo(() => {
    let size = 0;
    chatHistory.forEach((m) => {
      size += m.content.length + m.role.length
    });
    return size;
  }, [chatHistory]);

  const lastMessage = useMemo(() => {
    if (chatHistory.length === 0) return null;
    return chatHistory[chatHistory.length - 1];
  }, [chatHistory]);

  async function sendMessage(msg) {

    scrollerRef.current && (scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight);

    setLoading(true);
    let messagesForApi = [...chatHistory];
    messagesForApi.push({ role: "user", content: msg });
    //left only role and content
    messagesForApi = messagesForApi.map((m) => { return { role: m.role, content: m.content }; });

    const api = getEndpointInfo(config.endpoint).implementation;
    console.log("api", messagesForApi);
    const chat = api.continueChat(config.baseUrl, config.model, messagesForApi, {
      systemPrompt: config.systemPrompt,
      promptTemplate: config.promptTemplate,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      topP: config.topP
    });

    setChatGenerator(chat);

    setChatHistory((h) => [...h, { role: "user", content: msg, createdOn: new Date().getTime() },
    { role: "assistant", model: config.model, content: "", createdOn: new Date().getTime() }]);
    await wait(200);

    try {
      let chunk = "";
      let content = "";
      while ((chunk = await chat.read()) !== false) {
        content += chunk;
        setChatHistory((h) => {
          const newHistory = [...h];
          if (newHistory[newHistory.length - 1].content === "" && chunk !== "") {
            newHistory[newHistory.length - 1].firstCharOn = new Date().getTime();
          }
          newHistory[newHistory.length - 1].content = content;
          newHistory[newHistory.length - 1].finishedOn = new Date().getTime();
          newHistory[newHistory.length - 1].finishReason = chat.finish_reason();
          return newHistory;
        });
      }
      console.log("Chat finished:", chat.finish_reason());
    } catch (error) {
      console.error(error);

      setChatHistory((h) => {
        const newHistory = [...h];
        newHistory[newHistory.length - 1].error = error.message;
        newHistory[newHistory.length - 1].finishReason = "error";
        return newHistory;
      });
    }

    setChatHistory((h) => {
      const newHistory = [...h];
      if (!newHistory[newHistory.length - 1].firstCharOn)
        newHistory[newHistory.length - 1].firstCharOn = new Date().getTime();
      newHistory[newHistory.length - 1].finishedOn = new Date().getTime();
      return newHistory;
    });

    setLoading(false);
  }

  function handleStop() {
    if (!loading) return;
    if (!chatGenerator) return;
    chatGenerator.abort();
    setLoading(false);
    setChatHistory((h) => {
      const newHistory = [...h];
      newHistory[newHistory.length - 1].error = "Generation aborted by user";
      return newHistory;
    });
  }

  function handleGenerate() {
    //take last message content, delete last message and sendMessage(content)
    const lastMessage = chatHistory[chatHistory.length - 1].content;
    setChatHistory((h) => {
      const newHistory = [...h];
      newHistory.pop();
      return newHistory;
    });
    sendMessage(lastMessage);
  }

  function handleDelete(index) {
    chatHistory.splice(index, 1);
    const nextMessages = [...chatHistory]
    setChatHistory(nextMessages);
  }

  function handleScroll() {
    setIsAtBottom(scrollerRef.current.scrollTop > -80);
  }

  function handleClearAll() {
    setChatHistory([]);
    setShowWarning(false);
  }

  return (
    <>
      <div className="bg-white neutral-200 py-4 w-full top-0 sticky z-10 ring-2 ring-black/10">

        <div className="px-4 m-auto overflow-hidden max-w-3xl opacity-50 text-ellipsis whitespace-nowrap text-xs">
          {config.endpoint === "built-in" ? "built-in" : config.baseUrl}
        </div>
        <div className="px-4 m-auto max-w-3xl text-whitex  flex gap-2 items-end">
          <div className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden">
            {config.model}
          </div>
          <Button onClick={() => setShowConfig(true)}>config</Button>

        </div>
      </div >

      <div ref={scrollerRef} className="flex-1 flex w-full flex-col-reverse overflow-auto items-stretch"
        onScroll={handleScroll}>
        <div className="max-w-3xl w-full m-auto p-4 pb-0 xpy-0 flex flex-col justify-end gap-4 flex-1">

          <Messages messages={chatHistory} loadingIndex={loading ? chatHistory.length - 1 : -1} editingIndex={0} onDelete={handleDelete}></Messages>

          <Button
            className="bottom-4 shadowx -my-7  shadow-black/10 sticky p-2 px-4 flex mx-auto
            justify-center gap-1 rounded-full ring-6 w-fit  ring-black/10 bg-blue-500 text-white opacity-90 text-center"
            hidden={isAtBottom} onClick={() => { scrollerRef.current.scrollTop = 0 }}>down</Button>

          <Button
            className="p-2 px-4 my-1 w-fit mx-auto rounded-full ring-6 ring-black/5 bg-blue-50"
            hidden={!loading} onClick={handleStop}>stop</Button>
          <Button
            className="p-2 px-4 my-1 w-fit mx-auto rounded-full ring-6 ring-black/5 bg-blue-50"
            hidden={lastMessage?.role !== "user"} onClick={handleGenerate}>generate response</Button>

          <div className="flex flex-coxl gap-1 text-neutral-500 text-xs xtext-center justify-center">
            {chatSize > 0 && <div className="flex gap-1">
              {chatSize} bytes
              <Button onClick={() => { setShowWarning(true); }}>clear all</Button>
            </div>}
            {chatSize === 0 && <div className="flex gap-1">
              no messages yet
            </div>}
          </div>

        </div>
      </div>

      <div className={"w-full p-4 max-w-3xl flex flex-col  items-center bottom-0 transition-all sticky z-10 bg-whitex  " +
        (false ? " translate-y-full opacity-0" : "translate-y-0 opacity-100")}>

        <SendForm message={""} active={!loading} onSend={sendMessage} />

      </div>

      <Config shown={showConfig} defaultConfig={config} onChange={handleConfigChange} />

      <Modal isOpen={showWarning} onClose={() => { setShowWarning(false); }} title={"Warning"}
        actionName={"clear all"} onAction={handleClearAll}>
        <div className="p-4 text-center">
          Are you sure to delete all messages from this chat?
        </div>
      </Modal>
    </>
  );
}
