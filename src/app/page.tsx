"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const API_URL = "/api/getDifyData";
const USER_ID = "abc-123";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [conversationId, setConversationId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiResponse = (data) => {
    setResponse(data);
    if (data.conversation_id) {
      setConversationId(data.conversation_id);
    }

    const newMessage = { type: "user", text: query };
    const newResponse = {
      type: "mentor",
      text: data.data?.outputs?.text || "応答なし",
    };

    setMessageHistory((prev) => [...prev, newMessage, newResponse]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: { start: query, course: selectedCourse },
          response_mode: "blocking",
          conversation_id: conversationId,
          user: USER_ID,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("APIエラー:", errorData);
        setResponse({ error: errorData });
        return;
      }

      const data = await res.json();
      handleApiResponse(data);

      setQuery("");
    } catch (error) {
      console.error("フェッチエラー:", error);
      setResponse({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponseText = (text) => {
    const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      if (lastIndex < match.index) {
        const normalText = text
          .slice(lastIndex, match.index)
          .replace(/\n/g, "<br />");
        parts.push(
          <p
            key={lastIndex}
            className="text-white text-lg"
            dangerouslySetInnerHTML={{ __html: normalText }}
          />
        );
      }

      const language = match[1];
      const code = match[2];

      parts.push(
        <SyntaxHighlighter
          key={match.index}
          language={language}
          style={tomorrow}
        >
          {code}
        </SyntaxHighlighter>
      );

      lastIndex = codeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <p key={lastIndex} className="text-white text-lg">
          {text.slice(lastIndex)}
        </p>
      );
    }

    return parts;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col flex-grow items-center justify-center w-full bg-black text-white">
        {!response && !isLoading && <h1 className="text-6xl">メンターチャットボット</h1>}
        {response && (
          <div className="w-[700px] my-4 p-4">
            {messageHistory.map((message, index) => (
              <div key={index} className="my-2">
                <strong
                  className={message.type === "user" ? "text-blue-800" : ""}
                >
                  {message.type === "user" ? "あなた:" : "メンター:"}
                </strong>
                {message.type === "mentor" ? (
                  renderResponseText(message.text)
                ) : (
                  <p className="text-blue-800">{message.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
            <span className="ml-4 text-white">loading...</span>
          </div>
        )}
      </div>
      <div className="flex-grow bg-white flex flex-col items-center justify-center my-4 p-4">
        <form onSubmit={handleSubmit} className="flex flex-col relative">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-[700px] p-4 text-black text-lg border border-gray-300 rounded"
          >
            <option value="">コースを選択してください</option>
            <option value="Python初級">Python初級</option>
            <option value="Unity初級">Unity初級</option>
          </select>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="質問を入力してください"
            className="w-[700px] h-[250px] my-4 p-4 text-black text-lg border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="absolute right-6 bottom-6 text-sm bg-blue-200 text-blue-800 py-2 px-4 rounded-md hover:bg-blue-300"
          >
            送信
          </button>
        </form>
      </div>
    </div>
  );
}
