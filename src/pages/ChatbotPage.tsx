import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import { INTELLIGENCE_NAME } from "@/config/constants";

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE =
  "Xin chào! Tôi là VietTune Intelligence. Bạn có thể hỏi tôi về kho bản thu âm nhạc dân gian, dân tộc, nhạc cụ truyền thống, hoặc cách sử dụng trang web. Ví dụ: \"Cách tìm bản thu dân ca?\", \"Giới thiệu về đàn bầu.\"";

const MOCK_RESPONSES: Record<string, string> = {
  "xin chào": "Xin chào bạn! Tôi có thể giúp gì cho bạn về VietTune và âm nhạc dân gian Việt Nam?",
  hello: "Xin chào! Bạn cần tìm hiểu gì về kho bản thu VietTune?",
  "tìm kiếm": "Bạn có thể dùng **Tìm kiếm** (icon kính lúp) để tìm theo từ khóa và bộ lọc. Trang **Tìm theo ý nghĩa** cho phép mô tả bằng câu tự nhiên để tìm bản ghi phù hợp.",
  "tìm theo ý nghĩa": "Trang **Tìm theo ý nghĩa** (Semantic Search) cho phép bạn gõ câu mô tả bằng ngôn ngữ tự nhiên, ví dụ \"dân ca quan họ Bắc Ninh\" hoặc \"nhạc đàn bầu\", hệ thống sẽ gợi ý bản ghi liên quan.",
  "đóng góp": "Để đóng góp bản thu, đăng nhập và vào **Đóng góp bản thu** (hoặc **Upload**). Bạn cần điền thông tin cơ bản, tải file âm thanh hoặc video, sau đó gửi để chuyên gia kiểm duyệt.",
  "đàn bầu": "Đàn bầu là nhạc cụ dây một dây truyền thống của người Việt, đặc trưng bởi âm thanh trầm ấm. Bạn có thể tìm bản thu đàn bầu qua trang Tìm kiếm hoặc Tìm theo ý nghĩa với từ khóa \"đàn bầu\".",
  "dân ca": "VietTune lưu trữ nhiều bản thu dân ca các vùng miền: quan họ, hò ví giặm, ca trù, đờn ca tài tử... Bạn hãy thử **Tìm theo ý nghĩa** với câu như \"dân ca Bắc Bộ\" hoặc \"dân ca Nam Bộ\".",
  "cảm ơn": "Không có gì! Chúc bạn khám phá kho nhạc VietTune vui vẻ.",
  help: "Tôi có thể trả lời về: cách tìm kiếm, đóng góp bản thu, nhạc cụ truyền thống, dân ca, và hướng dẫn sử dụng VietTune. Hãy đặt câu hỏi ngắn gọn.",
};

function getMockReply(userText: string): string {
  const normalized = userText.toLowerCase().trim().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  for (const [key, reply] of Object.entries(MOCK_RESPONSES)) {
    const keyNorm = key.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) return reply;
  }
  return "Tôi hiện là phiên bản demo, chưa kết nối AI thật. Bạn hãy thử hỏi: \"tìm kiếm\", \"đóng góp\", \"đàn bầu\", \"dân ca\" hoặc \"xin chào\". Tôi sẽ trả lời theo gợi ý có sẵn.";
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getMockReply(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.min(text.length * 20, 800));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            {INTELLIGENCE_NAME}
          </h1>
          <BackButton />
        </div>

        {/* Introduction — same card style as InstrumentsPage */}
        <div
          className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Chat với {INTELLIGENCE_NAME}
          </h2>
          <p className="text-neutral-600 font-medium leading-relaxed mb-4">
            {INTELLIGENCE_NAME} giúp bạn tìm hiểu về kho bản thu âm nhạc truyền thống Việt Nam, nhạc cụ dân tộc, dân ca các vùng miền và cách sử dụng nền tảng VietTune.
          </p>
          <p className="text-neutral-600 leading-relaxed">
            Bạn có thể hỏi về cách tìm kiếm bản thu, đóng góp bản thu, giới thiệu nhạc cụ như đàn bầu, đàn tranh, hoặc hướng dẫn sử dụng. Gõ câu hỏi vào ô bên dưới và nhấn Gửi.
          </p>
        </div>

        {/* Chat — same card style as InstrumentsPage */}
        <div
          className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Hội thoại
          </h2>

          <div
            ref={listRef}
            className="overflow-y-auto mb-6 pr-2"
            style={{ minHeight: "280px", maxHeight: "50vh" }}
          >
            <ul className="space-y-4">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${m.role === "user"
                      ? "bg-primary-600 text-white"
                      : "bg-primary-100 text-primary-600"
                      }`}
                  >
                    {m.role === "user" ? (
                      <User className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <Bot className="h-4 w-4" strokeWidth={2.5} />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border border-neutral-200/80 ${m.role === "user"
                      ? "bg-primary-600 text-white rounded-tr-md border-primary-500/50"
                      : "rounded-tl-md"
                      }`}
                    style={m.role === "assistant" ? { backgroundColor: "#FFFCF5" } : undefined}
                  >
                    <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${m.role === "user" ? "text-white" : "text-neutral-700"}`}>
                      {m.role === "user" ? (
                        m.content
                      ) : (
                        m.content.split("**").map((part, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className="font-semibold text-neutral-900">{part}</strong>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )
                      )}
                    </p>
                  </div>
                </li>
              ))}
              {isTyping && (
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Bot className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-md px-4 py-3 border border-neutral-200/80 shadow-sm flex gap-1.5"
                    style={{ backgroundColor: "#FFFCF5" }}
                  >
                    <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </li>
              )}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              className="flex-1 px-5 py-3 rounded-full border border-neutral-200/80 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-neutral-900 placeholder-neutral-400"
              style={{ minHeight: "48px" }}
              aria-label="Tin nhắn"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:pointer-events-none text-white transition-colors duration-200 cursor-pointer"
              aria-label="Gửi"
            >
              <Send className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
