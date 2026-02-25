"use client";

import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! 👋 How can I help you find the perfect stay today?", sender: "bot" },
    ]);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), text: inputValue, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");

        // Simple bot logic
        setTimeout(() => {
            let botResponse = "I'm not sure about that, but you can try searching for 'Delhi' or 'Noida' to see featured stays!";
            const lower = inputValue.toLowerCase();
            if (lower.includes("price") || lower.includes("cheap")) {
                botResponse = "Our stays start as low as ₹1,500/month. Use the budget filter in search to find precisely what you need.";
            } else if (lower.includes("verified")) {
                botResponse = "We manually verify every listing to ensure your safety. Look for the violet 'Verified' badge!";
            } else if (lower.includes("hello") || lower.includes("hi")) {
                botResponse = "Hello! I'm the CampuStay assistant. Ask me anything about finding student accommodations!";
            }

            setMessages((prev) => [...prev, { id: Date.now() + 1, text: botResponse, sender: "bot" }]);
        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 flex h-[450px] w-[350px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="font-semibold">CampuStay Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg p-1 hover:bg-white/20 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950"
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === "user"
                                            ? "bg-violet-600 text-white"
                                            : "bg-white text-gray-900 border border-border dark:bg-gray-900 dark:text-gray-100"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border p-4 bg-card">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask something..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                            />
                            <button
                                onClick={handleSend}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                            >
                                <svg className="h-5 w-5 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-600/30 hover:scale-110 active:scale-95 transition-all duration-300"
            >
                {isOpen ? (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                ) : (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
