import { useEffect, useState } from "react";
import "./App.css"


export default function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const ws = new WebSocket("ws://172.19.218.165:3000");
        setSocket(ws);

        ws.onopen = () => console.log("🔗 Connected to WebSocket");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Получено сообщение:", data);

            if (data.type === "history") {
                console.log("🔄 Загружена история сообщений:", data.data);
                setMessages(data.data);
            } else if (data.type === "message") {
                console.log(data.data)
                setMessages((prev) => [...prev, data]);
            }
        };

        ws.onclose = () => console.log("❌ WebSocket disconnected");
        ws.onerror = (error) => console.error("⚠️ WebSocket error:", error);

        return () => ws.close();
    }, []);

    const sendMessage = () => {
        if (!socket || socket.readyState !== 1 || input.trim() === "") {
            console.warn("❌ WebSocket не открыт или сообщение пустое");
            return;
        }

        const message = JSON.stringify({ type: "message", data: input });

        console.log("🚀 Отправляю сообщение:", message);
        socket.send(message);
        setInput("");
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-xl font-bold mb-4 text-center">WebSocket Chat</h1>
            <div className="h-64 overflow-auto border p-2 rounded-lg mb-4 overflow-x-hidden">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className="p-2 bg-blue-500 text-white rounded-lg mb-2 break-words w-full"
                    >
                        {msg.data}
                    </div>

                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Введите сообщение..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    onClick={sendMessage}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
}
