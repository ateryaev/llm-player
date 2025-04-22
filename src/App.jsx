import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Modal from "./components/Modal";
import SendForm from "./components/SendForm";
import Messages from "./components/Messages";
import { wait } from "./utils/helpers";
import { Button } from "./components/Button";
import { Config } from "./Config";
import { getEndpointInfo } from "./utils/endpoints";
import { useConfig } from "./ConfigContext";

export default function OpenAIChatApp() {
  const scrollerRef = useRef(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);

  const { endpoint, config } = useConfig();


  useEffect(() => {
    //load config from local storage
    const savedChat = localStorage.getItem("chat");
    if (savedChat) {
      try {
        setChatHistory(JSON.parse(savedChat));
      } catch (e) {
        console.error("Error parsing chat from local storage", e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    console.log("chatHistory changed for saving");
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
    scrollerRef.current && (scrollerRef.current.scrollTop = 0);
    setLoading(true);
    let messagesForApi = [...chatHistory];
    messagesForApi.push({ role: "user", content: msg });
    //left only role and content
    messagesForApi = messagesForApi.map((m) => { return { role: m.role, content: m.content }; });

    const api = getEndpointInfo(endpoint).implementation;

    api.continueChatStart(config.baseUrl, config.model, messagesForApi, {
      systemPrompt: config.systemPrompt,
      promptTemplate: config.promptTemplate,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      topP: config.topP,
      headers: config.headers
    });

    //await wait(100);
    setChatHistory((h) => [...h, { role: "user", content: msg, createdOn: new Date().getTime() }]);
    await wait(100);
    setChatHistory((h) => [...h, { role: "assistant", model: config.model, content: "", createdOn: new Date().getTime() }]);
    await wait(100);

    try {
      let chunk = "";
      let content = "";
      let n = 0;
      while ((chunk = await api.continueChatLoader()) !== null) {
        content += chunk;
        setChatHistory((h) => {
          const newHistory = [...h];
          if (newHistory[newHistory.length - 1].content === "" && chunk !== "") {
            newHistory[newHistory.length - 1].firstCharOn = new Date().getTime();
          }
          newHistory[newHistory.length - 1].content = content;
          newHistory[newHistory.length - 1].finishedOn = new Date().getTime();
          newHistory[newHistory.length - 1].finishReason = api.lastFinnishReason();
          return newHistory;
        });
        if (++n > 1000) break;
      }
      console.log("Chat finished:", api.lastFinnishReason());
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
    const api = getEndpointInfo(endpoint).implementation;
    api.abortLoadingChat();
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
    if (loading) return;
    chatHistory.splice(index, 1);
    const nextMessages = [...chatHistory]
    setChatHistory(nextMessages);
  }

  function handleScroll() {
    setIsAtBottom(scrollerRef.current.scrollTop > -80);
  }

  function handleClearAll() {
    if (loading) return;
    setChatHistory([]);
    setShowWarning(false);
  }
  function handleShowConfig(e, btn) {
    console.log("show config", e);
    btn?.blur();
    setShowConfig(true);
  }

  return (
    <>
      <div className="bg-white py-4 w-full z-10 ring-2 ring-black/10">
        <div className="px-4 m-auto max-w-3xl flex gap-4 items-end">
          <div className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden">
            <div className="text-ellipsis overflow-hidden opacity-50 text-xs">
              {config.baseUrl ? config.baseUrl : endpoint}
            </div>
            {config.model}
          </div>
          <Button onClick={handleShowConfig}>config</Button>
        </div>
      </div>

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
            hidden={loading || lastMessage?.role !== "user"} onClick={handleGenerate}>generate response</Button>

          <div className="select-none flex flex-coxl gap-1 text-neutral-500 text-xs xtext-center justify-center">
            {chatSize > 0 && <div className="flex gap-1">
              {chatSize} bytes
              <Button hidden={loading} onClick={() => { setShowWarning(true); }}>clear all</Button>
            </div>}
            {chatSize === 0 && <div className="flex gap-1">
              no messages yet
            </div>}
          </div>

        </div>
      </div>

      <div className="w-full p-4 max-w-3xl">
        <SendForm message={""} active={!loading} onSend={sendMessage} />
      </div>

      <Config shown={showConfig} onDone={setShowConfig} readonly={loading} />

      <Modal isOpen={showWarning} onClose={() => setShowWarning(false)} title={"Warning"}
        actionName={"clear all"} onAction={handleClearAll}>
        <div className="p-4 text-center">
          Are you sure to delete all messages from this chat?
        </div>
      </Modal>
    </>
  );
}
