
import { useEffect, useRef, useState } from "react";
import Hero from "../comp/Hero.jsx";
import Heron from "../comp/Heron.jsx";
import MenuGrid from "../comp/MenuGrid.jsx";

const AI_CHAT_URL = "http://localhost:5001/api/ai/chat";

export default function Customer() {
  const [section, setSection] = useState("FOOD");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // AI chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! 👋 Welcome to Terteb! I'm your AI food assistant. What would you like to eat today?",
    },
  ]);

  const messagesEndRef = useRef(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Send message to the AI backend
  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

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
        { role: "assistant", content: data.reply },
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
      {/* Existing customer page */}
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
        {/* Chat Window */}
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
                onClick={() => setIsChatOpen(false)}
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

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me about our menu..."
                disabled={isLoading}
                maxLength={2000}
                className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100 disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-lg text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                ➤
              </button>
            </form>

            {/* Footer */}
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
