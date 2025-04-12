import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [showWarning, setShowWarning] = useState(false);
  //const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [scrollBottom, setScrollBottom] = useState(0);
  const [chatGenerator, setChatGenerator] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);

  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);

  const [config, setConfig] = useState({
    endpoint: "built-in",
    baseUrl: "http://localhost:1234/v1",
    model: "echo-assistant-2",
    systemPrompt: "Response in English only.",
    apiKey: "YOUR_OPENAI_API_KEY",// Replace with your API key
    max_tokens: 200,
    temperature: 0.7,
    top_p: 1,
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

    const api = getEndpointInfo(config.endpoint).implementation;
    console.log("api", messagesForApi);
    const chat = api.continueChat(config.baseUrl, config.model, messagesForApi, { max_tokens: config.max_tokens, temperature: config.temperature, top_p: config.top_p });
    setChatGenerator(chat);

    setChatHistory((h) => [...h, { role: "user", content: msg, createdOn: new Date().getTime() },
    { role: "assistant", model: config.model, content: "", createdOn: new Date().getTime() }]);
    await wait(200);

    try {
      let chunk = "";
      let content = "";
      while ((chunk = await chat.read()) !== false) {
        //console.log("chunk: " + chunk + " " + chat.finish_reason());
        content += chunk;
        setChatHistory((h) => {
          const newHistory = [...h];
          if (newHistory[newHistory.length - 1].content === "" && chunk !== "") {
            newHistory[newHistory.length - 1].firstCharOn = new Date().getTime();
          }
          newHistory[newHistory.length - 1].content = content;
          newHistory[newHistory.length - 1].finishedOn = new Date().getTime();
          return newHistory;
        });
      }
      console.log("Chat finished:", chat.finish_reason());
    } catch (error) {
      console.error(error);
      //updatedHistory[updatedHistory.length - 1].error = error.message;
      setChatHistory((h) => {
        const newHistory = [...h];
        newHistory[newHistory.length - 1].error = error.message;
        return newHistory;
      });
    }

    setChatHistory((h) => {
      const newHistory = [...h];
      if (!newHistory[newHistory.length - 1].firstCharOn)
        newHistory[newHistory.length - 1].firstCharOn = new Date().getTime();
      newHistory[newHistory.length - 1].finishedOn = new Date().getTime();
      //localStorage.setItem("chat", JSON.stringify(newHistory));
      return newHistory;
    });



    setLoading(false);
    //setChatHistory([...updatedHistory, { role: "assistant", content: fullResponse }]);
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

    const prevMessages = [...chatHistory]
    chatHistory.splice(index, 1);
    const nextMessages = [...chatHistory]
    setChatHistory(nextMessages);
  }

  function handleScroll(e) {
    //check if scrollerRef is scrolled to bottom
    // const scrollTop = scrollerRef.current.scrollTop;
    // const scrollHeight = scrollerRef.current.scrollHeight;
    // const clientHeight = scrollerRef.current.clientHeight;
    // const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAtBottom(scrollerRef.current.scrollTop > -80);
    //setIsAtTop(scrollerRef.current.scrollTop < 0);
    setIsAtTop(scrollerRef.current.scrollHeight - scrollerRef.current.clientHeight + scrollerRef.current.scrollTop < 80);
    //console.log("isAtTop", scrollerRef.current.scrollTop, scrollerRef.current.scrollHeight, scrollerRef.current.clientHeight);
    //console.log("isAtBottom", scrollerRef.current.scrollTop > -80);

  }


  function handleClearAll() {
    setChatHistory([]);
    setShowWarning(false);
  }

  return (
    <>
      {/* <Header url={baseURL} model={selectedModel} /> */}
      <div className="bg-white neutral-200 py-4 w-full top-0 sticky z-10 ring-2 ring-black/10">

        <div className="px-4 m-auto overflow-hidden max-w-3xl opacity-50 text-ellipsis whitespace-nowrap text-xs">
          {config.endpoint === "built-in" ? "built-in" : config.baseUrl}
        </div>
        <div className="px-4 m-auto max-w-3xl text-whitex  flex gap-2 items-end">
          <div className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden">
            {config.model}
          </div>
          <Button className={"text-whitex hiddenx"} onClick={() => setShowConfig(true)}>config</Button>


        </div>
      </div >


      <div ref={scrollerRef} className="flex-1 flex w-full flex-col-reverse overflow-auto items-stretch"
        onScroll={handleScroll}>
        <div className="max-w-3xl w-full m-auto p-4 xpy-0 flex flex-col gap-4 flex-1">

          {/* <div className="p-2 xpx-3 pt-3 -mt-1 xring-2 ring-black/10 text-blue-500 xx/50 xbg-neutral-200/50 rounded-sm flex gap-1">
            <div className="flex-1">Chat #00</div>
            <Button>clear all</Button>
          </div> */}

          {/* <Button
            className="p-2 px-4 my-1 w-fit mx-auto rounded-full ring-6 ring-black/5 bg-blue-50"
            hidden={chatHistory.length < 2} onClick={handleClearAll}>clear all</Button>

          <Button
            className="top-4 shadowx -my-7  shadow-black/10 sticky p-2 px-4 flex mx-auto
            justify-center gap-1 rounded-full ring-6 w-fit  ring-black/10 bg-blue-500 text-white opacity-90 text-center"
            hidden={isAtTop || !isAtBottom} onClick={() => { scrollerRef.current.scrollTop = -scrollerRef.current.scrollHeight }}>up</Button> */}

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


          <div className="p-0 px-0 pl-4x flex flex-coxl gap-1 text-neutral-500 text-xs xtext-center justify-center">
            {chatSize > 0 && <div className="flex gap-1">
              {chatSize} bytes
              <Button hiddenx={chatHistory.length < 2} onClick={() => { setShowWarning(true); }}>clear all</Button>
            </div>}
            {chatSize === 0 && <div className="flex gap-1">
              no messages yet
            </div>}

          </div>

          {/* <div className="bottom-0 xsticky bg-neutral-500 p-2 xh-0">scroll up</div> */}
        </div>
      </div>

      <div className={"w-full flex flex-col  items-center bottom-0 transition-all sticky z-10 bg-white focus-within:ring-blue-300 focus-within:bg-blue-50 ring-2 ring-black/10 " +
        (false ? " translate-y-full opacity-0" : "translate-y-0 opacity-100")}>

        <SendForm message={""} active={!loading} onSend={sendMessage} />

      </div >
      <div className="text-xs w-full text-center text-neutral-500 xbg-neutral-300 p-4 flex gap-2 justify-center items-center">
        LLM-Player v1.0,
        <a href="https://github.com/ateryaev/llm-player" className="underline" target="_blank">github.com</a>
      </div>


      <Config shown={showConfig} defaultConfig={config} onChange={handleConfigChange} />

      <Modal isOpen={showWarning} onClose={() => { setShowWarning(false); }}>

        <div className="bg-white ring-2 ring-black/10">
          <div className="p-4 xbg-red-100 xtext-blue-600 text-center font-bold">Warning</div>
        </div>
        <div className="flex max-w-3xl m-auto gap-2 flex-col p-4 text-center">
          Are you sure to delete all messages from this chat?
        </div>

        <div className="p-4 bg-white flex gap-4 justify-center bottom-0 sticky z-10 
            focus-within:ring-blue-300 focus-within:bg-blue-50
            ring-2 ring-black/10
            ">
          <Button className={"lowercase"} onClick={handleClearAll}>clear all</Button>
          <Button className={"font-boldx lowercase"} onClick={() => { setShowWarning(false); }} autofocus>Cancel</Button>
        </div>
      </Modal>
    </>
  );
}
