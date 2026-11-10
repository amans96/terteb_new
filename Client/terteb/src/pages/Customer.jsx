
import { useEffect, useRef, useState } from "react";
import Hero from "../comp/Hero.jsx";
import Heron from "../comp/Heron.jsx";
import MenuGrid from "../comp/MenuGrid.jsx";

const AI_CHAT_URL = "http://localhost:5001/api/ai/chat";

export default function Customer() {
  const [section, setSection] = useState("FOOD");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("am-ET");

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! 👋 Welcome to Terteb! I'm your AI food assistant. What would you like to eat today?",
    },
  ]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Clean up speech recognition when component unmounts
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Start or stop microphone recording
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);

      if (event.error === "not-allowed") {
        alert("Please allow microphone access to use voice input.");
      } else if (event.error === "no-speech") {
        console.log("No speech detected. Try speaking again.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Could not start microphone:", error);
      setIsRecording(false);
    }
  };

  // Send message to Terteb AI
  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    // Stop recording before sending
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setMessages((previous) => [
      ...previous,
      { role: "user", content: trimmedMessage },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to get a response from Terteb AI."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Terteb AI request failed:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Hero />

      <Heron
        section={section}
        setSection={setSection}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <MenuGrid
        section={section}
        selectedCategory={selectedCategory}
      />

      {/* AI Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        {isChatOpen && (
          <div className="absolute bottom-20 right-0 flex h-[530px] max-h-[calc(100dvh-120px)] w-[370px] max-w-[calc(100vw-30px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center gap-3 bg-neutral-900 px-4 py-4 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-neutral-900">
                ✦
              </div>

              <div className="flex-1">
                <h3 className="text-base font-semibold">
                  Terteb AI
                </h3>

                <p className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Here to help you
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    recognitionRef.current?.stop();
                    setIsRecording(false);
                  }
                  setIsChatOpen(false);
                }}
                className="rounded-full px-2 text-2xl text-gray-300 transition hover:bg-neutral-700 hover:text-white"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-gray-50 p-4">
              <p className="text-center text-[10px] font-semibold tracking-widest text-gray-400">
                YOUR FOOD ASSISTANT
              </p>

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex max-w-[95%] items-end gap-2 ${
                    msg.role === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                      ✦
                    </div>
                  )}

                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-neutral-900 text-white"
                        : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="mr-auto flex items-end gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                    ✦
                  </div>

                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-4">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice language selector */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-2">
              <span className="text-xs text-gray-500">
                Voice input language
              </span>

              <select
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
                disabled={isRecording || isLoading}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-neutral-500"
              >
                <option value="am-ET">Amharic</option>
                <option value="en-US">English</option>
              </select>
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
            >
              {/* Microphone */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isLoading}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg transition ${
                  isRecording
                    ? "animate-pulse bg-red-600 text-white"
                    : "bg-gray-100 text-neutral-800 hover:bg-gray-200"
                } disabled:cursor-not-allowed disabled:opacity-40`}
                aria-label={
                  isRecording ? "Stop recording" : "Start voice recording"
                }
                title={isRecording ? "Stop recording" : "Speak"}
              >
                {isRecording ? "■" : "🎙️"}
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isRecording
                    ? "Listening..."
                    : "Ask me about our menu..."
                }
                disabled={isLoading}
                maxLength={2000}
                className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100 disabled:bg-gray-100"
              />

              {/* Send */}
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-lg text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                ➤
              </button>
            </form>

            <div className="bg-white pb-2 text-center text-[10px] text-gray-400">
              Powered by Terteb AI
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          type="button"
          onClick={() => setIsChatOpen((previous) => !previous)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-3xl text-white shadow-xl transition duration-200 hover:-translate-y-1 hover:bg-neutral-700 active:scale-95"
          aria-label={isChatOpen ? "Close Terteb AI" : "Open Terteb AI"}
        >
          {isChatOpen ? "×" : "✦"}
        </button>
      </div>
    </>
  );
}
