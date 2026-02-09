import React, { useState, useRef, useEffect } from "react";
import { Search, MessageSquare, Network, Database, Filter, Play, MapPin, Users, Music, Calendar, Download, Check, Send, Bot, User } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { INTELLIGENCE_NAME } from "@/config/constants";
import { ETHNICITIES, REGIONS, EVENT_TYPES, INSTRUMENTS } from "@/config/musicMetadata";

type TabId = "search" | "qa" | "graph" | "collection";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SearchFiltersState {
  ethnicGroup: string;
  instrument: string;
  region: string;
  ceremony: string;
}

interface MockResult {
  id: number;
  title: string;
  ethnicGroup: string;
  region: string;
  instruments: string[];
  ceremony: string;
  duration: string;
  contributor: string;
  verified: boolean;
}

interface CollectionItem {
  name: string;
  count: number;
  ethnic: string;
  region: string;
}

/** Kết quả mẫu — dân tộc, khu vực, nhạc cụ, nghi lễ lấy từ @/config/musicMetadata để đồng bộ toàn trang. */
const MOCK_RESULTS: MockResult[] = [
  {
    id: 1,
    title: "Hò mái chèo - Nghệ An",
    ethnicGroup: ETHNICITIES[0],
    region: REGIONS[2],
    instruments: [INSTRUMENTS[56], INSTRUMENTS[112]],
    ceremony: EVENT_TYPES[11],
    duration: "3:45",
    contributor: "Nghệ nhân Nguyễn Văn A",
    verified: true,
  },
  {
    id: 2,
    title: "Đàn T'rưng - Lễ hội cơm mới",
    ethnicGroup: ETHNICITIES[11],
    region: REGIONS[4],
    instruments: [INSTRUMENTS[119], INSTRUMENTS[19]],
    ceremony: EVENT_TYPES[10],
    duration: "5:20",
    contributor: "Nghệ nhân Ksor H'Bơ",
    verified: true,
  },
  {
    id: 3,
    title: "Quan họ Bắc Ninh",
    ethnicGroup: ETHNICITIES[0],
    region: REGIONS[1],
    instruments: [INSTRUMENTS[93], INSTRUMENTS[122]],
    ceremony: EVENT_TYPES[2],
    duration: "4:15",
    contributor: "Nghệ nhân Phạm Thị B",
    verified: true,
  },
];

/** Bộ sưu tập mẫu — dân tộc và khu vực lấy từ ETHNICITIES, REGIONS để đồng bộ toàn trang. */
const COLLECTIONS: CollectionItem[] = [
  { name: "Dân ca Quan họ", count: 245, ethnic: ETHNICITIES[0], region: REGIONS[1] },
  { name: "Âm nhạc Tây Nguyên", count: 892, ethnic: [ETHNICITIES[11], ETHNICITIES[10], ETHNICITIES[9]].join(", "), region: REGIONS[4] },
  { name: "Hò mái chèo Nghệ Tĩnh", count: 167, ethnic: ETHNICITIES[0], region: REGIONS[2] },
  { name: "Đờn ca tài tử", count: 324, ethnic: ETHNICITIES[0], region: REGIONS[6] },
  { name: "Then của người Tày", count: 156, ethnic: ETHNICITIES[1], region: REGIONS[0] },
  { name: "Ca trù Hà Nội", count: 89, ethnic: ETHNICITIES[0], region: REGIONS[1] },
];

const EXAMPLE_QUESTIONS = [
  "Đàn bầu được chế tạo như thế nào?",
  "So sánh nhạc tang lễ của người Tày và Thái",
  "Lịch sử phát triển của quan họ Bắc Ninh",
];

const WELCOME_CHAT =
  "Xin chào! Tôi có thể giúp bạn tìm hiểu về âm nhạc truyền thống Việt Nam. Bạn muốn tìm hiểu về điều gì?";

const MOCK_REPLY =
  "Dựa trên tài liệu đã được xác minh, tôi có thể cung cấp thông tin chi tiết về chủ đề này. Vui lòng cho tôi chút thời gian để tìm kiếm...";

export default function ResearcherPortalPage() {
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFiltersState>({
    ethnicGroup: "",
    instrument: "",
    region: "",
    ceremony: "",
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_CHAT },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatListRef.current?.scrollTo({ top: chatListRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: "assistant", content: MOCK_REPLY }]);
      setIsTyping(false);
    }, 600 + Math.min(text.length * 20, 800));
  };

  const handleQaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (question: string) => {
    setChatInput(question);
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "search", label: "Tìm kiếm nâng cao", icon: Search },
    { id: "qa", label: "VietTune Intelligence", icon: MessageSquare },
    { id: "graph", label: "Biểu đồ tri thức", icon: Network },
    { id: "collection", label: "Bộ sưu tập", icon: Database },
  ];

  return (
    <div className="min-h-screen min-w-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900 min-w-0">
            Cổng nghiên cứu
          </h1>
          <BackButton />
        </div>

        {/* Tabs — đồng bộ với UploadPage/UploadMusic: rounded-2xl, #FFFCF5, shadow-lg */}
        <div
          className="border border-neutral-200/80 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm mb-6 sm:mb-8 transition-all duration-300 hover:shadow-xl min-w-0 overflow-x-hidden"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <nav className="flex flex-wrap gap-2 p-4 sm:p-6 lg:p-8 border-b border-neutral-200/80" aria-label="Cổng nghiên cứu">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-neutral-200/80 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer focus:outline-none ${
                  activeTab === tab.id
                    ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white"
                    : "text-neutral-800 bg-neutral-100/90"
                }`}
                style={activeTab !== tab.id ? { backgroundColor: "#FFFCF5" } : undefined}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = "#F5F0E8";
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = "#FFFCF5";
                }}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Tab: Tìm Kiếm Nâng Cao — một container chung: tìm kiếm + bộ lọc + kết quả */}
          {activeTab === "search" && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Tìm kiếm bài hát — cùng section với bộ lọc, không container riêng */}
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary-100/90 rounded-lg flex-shrink-0">
                  <Search className="w-5 h-5 text-primary-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-neutral-900">Tìm kiếm bài hát</h2>
                  <p className="text-sm text-neutral-600 font-medium mt-1">
                    Nhập từ khóa để tìm kiếm nhanh. Kết hợp bộ lọc bên dưới để thu hẹp kết quả.
                  </p>
                </div>
              </div>
              <div
                className="relative w-full min-h-[48px] px-4 py-2.5 border border-neutral-400/80 rounded-full focus-within:border-primary-500 focus-within:border-transparent transition-all duration-200 shadow-sm hover:shadow-md mb-6"
                style={{ backgroundColor: "#FFFCF5" }}
              >
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" strokeWidth={2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài hát, nhạc cụ, nghệ nhân,..."
                  className="w-full pl-12 pr-32 py-2 bg-transparent text-neutral-900 placeholder-neutral-500 focus:outline-none rounded-full"
                  aria-label="Từ khóa tìm kiếm"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-full transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                >
                  Tìm kiếm
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Bộ lọc — màu nền icon đồng bộ Tìm kiếm bài hát: bg-primary-100/90 */}
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-primary-100/90 rounded-lg flex-shrink-0">
                  <Filter className="w-5 h-5 text-primary-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">Bộ lọc nâng cao</h3>
                  <p className="text-sm text-neutral-600 font-medium mt-1">Lọc theo dân tộc, nhạc cụ, vùng miền, nghi lễ</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-800">Dân tộc</label>
                  <SearchableDropdown
                    value={filters.ethnicGroup}
                    onChange={(v) => setFilters((prev) => ({ ...prev, ethnicGroup: v }))}
                    options={ETHNICITIES}
                    placeholder="Tất cả"
                    searchable
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-800">Nhạc cụ</label>
                  <SearchableDropdown
                    value={filters.instrument}
                    onChange={(v) => setFilters((prev) => ({ ...prev, instrument: v }))}
                    options={INSTRUMENTS}
                    placeholder="Tất cả"
                    searchable
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-800">Vùng miền</label>
                  <SearchableDropdown
                    value={filters.region}
                    onChange={(v) => setFilters((prev) => ({ ...prev, region: v }))}
                    options={REGIONS}
                    placeholder="Tất cả"
                    searchable={false}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-800">Nghi lễ / Sự kiện</label>
                  <SearchableDropdown
                    value={filters.ceremony}
                    onChange={(v) => setFilters((prev) => ({ ...prev, ceremony: v }))}
                    options={EVENT_TYPES}
                    placeholder="Tất cả"
                    searchable={false}
                  />
                </div>
              </div>

              {/* Kết quả — màu nền icon đồng bộ Tìm kiếm bài hát: bg-primary-100/90 */}
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-primary-100/90 rounded-lg flex-shrink-0">
                  <Search className="w-5 h-5 text-primary-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1 flex flex-wrap items-center justify-between gap-4 min-w-0">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900">Kết quả tìm kiếm</h3>
                    <p className="text-sm text-neutral-600 font-medium mt-1">{MOCK_RESULTS.length} bản ghi</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-neutral-200/80 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-br from-primary-600 to-primary-700 text-white focus:outline-none"
                  >
                    <Download className="w-4 h-4" strokeWidth={2.5} />
                    Xuất dữ liệu
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {MOCK_RESULTS.map((result) => (
                  <div
                    key={result.id}
                    className="border border-neutral-200/80 rounded-2xl p-4 sm:p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl cursor-default"
                    style={{ backgroundColor: "#FFFCF5" }}
                  >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-neutral-900">{result.title}</h4>
                            {result.verified && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-neutral-100/90 text-green-700 rounded-full border border-neutral-300/80 shadow-sm">
                                <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                                Đã xác minh
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-neutral-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 flex-shrink-0 text-primary-600" strokeWidth={2.5} />
                              <span>{result.ethnicGroup}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 flex-shrink-0 text-primary-600" strokeWidth={2.5} />
                              <span>{result.region}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Music className="w-4 h-4 flex-shrink-0 text-primary-600" strokeWidth={2.5} />
                              <span>{result.instruments.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0 text-primary-600" strokeWidth={2.5} />
                              <span>{result.ceremony}</span>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-500">Nghệ nhân: {result.contributor}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-sm font-medium text-neutral-600">{result.duration}</span>
                          <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-neutral-200/80 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-br from-primary-600 to-primary-700 text-white focus:outline-none"
                          >
                            <Play className="w-4 h-4" strokeWidth={2.5} />
                            Phát
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tab: Hỏi Đáp AI — bê y nguyên phần "Chat với VietTune Intelligence" từ ChatbotPage */}
          {activeTab === "qa" && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Introduction — y nguyên ChatbotPage */}
              <div
                className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl"
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

              {/* Chat — y nguyên ChatbotPage */}
              <div
                className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl"
                style={{ backgroundColor: "#FFFCF5" }}
              >
                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                  Hội thoại
                </h2>

                <div className="bg-secondary-50/80 rounded-xl p-4 mb-6 border border-neutral-200/80">
                  <p className="text-sm text-neutral-600 mb-2">Ví dụ câu hỏi:</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_QUESTIONS.map((question, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleExampleClick(question)}
                        className="px-3 py-1.5 bg-white border border-neutral-300 rounded-full text-sm hover:border-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  ref={chatListRef}
                  className="overflow-y-auto mb-6 pr-2"
                  style={{ minHeight: "280px", maxHeight: "50vh" }}
                >
                  <ul className="space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <li
                        key={idx}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${msg.role === "user"
                            ? "bg-primary-600 text-white"
                            : "bg-primary-100 text-primary-600"
                            }`}
                        >
                          {msg.role === "user" ? (
                            <User className="h-4 w-4" strokeWidth={2.5} />
                          ) : (
                            <Bot className="h-4 w-4" strokeWidth={2.5} />
                          )}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border border-neutral-200/80 ${msg.role === "user"
                            ? "bg-primary-600 text-white rounded-tr-md border-primary-500/50"
                            : "rounded-tl-md"
                            }`}
                          style={msg.role === "assistant" ? { backgroundColor: "#FFFCF5" } : undefined}
                        >
                          <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${msg.role === "user" ? "text-white" : "text-neutral-700"}`}>
                            {msg.role === "user" ? (
                              msg.content
                            ) : (
                              msg.content.split("**").map((part, i) =>
                                i % 2 === 1 ? (
                                  <strong key={i} className="font-semibold text-neutral-900">{part}</strong>
                                ) : (
                                  <span key={i}>{part}</span>
                                )
                              )
                            )}
                          </p>
                          {msg.role === "assistant" && (
                            <div className="mt-2 pt-2 border-t border-neutral-300">
                              <p className="text-xs text-neutral-500">Nguồn: Cơ sở tri thức đã xác minh</p>
                            </div>
                          )}
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
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleQaKeyDown}
                    placeholder="Nhập câu hỏi..."
                    className="flex-1 px-5 py-3 rounded-full border border-neutral-200/80 focus:border-primary-500 outline-none transition-all text-neutral-900 placeholder-neutral-400"
                    style={{ minHeight: "48px" }}
                    aria-label="Tin nhắn"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isTyping}
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:pointer-events-none text-white transition-colors duration-200 cursor-pointer"
                    aria-label="Gửi"
                  >
                    <Send className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Biểu Đồ Tri Thức — padding đồng bộ UploadPage/UploadMusic */}
          {activeTab === "graph" && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-primary-100/90 rounded-lg flex-shrink-0">
                  <Network className="w-5 h-5 text-primary-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">Biểu đồ tri thức</h3>
                  <p className="text-sm text-neutral-600 font-medium mt-1">
                    Trực quan hóa mối quan hệ giữa bài hát, nhạc cụ, dân tộc, nghi lễ và vùng địa lý
                  </p>
                </div>
              </div>
              <div className="text-center py-8">
                <div
                  className="max-w-2xl mx-auto rounded-2xl border border-neutral-200/80 p-4 sm:p-6 lg:p-8 text-left shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
                  style={{ backgroundColor: "#FFFCF5" }}
                >
                  <p className="text-sm font-semibold text-neutral-800 mb-2">Tính năng này sẽ hiển thị:</p>
                  <ul className="text-sm text-neutral-600 space-y-2">
                    <li>• Mạng lưới tương tác: nhấp vào nhạc cụ để xem các bài hát sử dụng nó</li>
                    <li>• Nhấp vào nghi lễ để tìm âm nhạc liên quan</li>
                    <li>• Khám phá các mối liên hệ giữa các dân tộc và phong cách âm nhạc</li>
                    <li>• Phân tích phân bố địa lý của các truyền thống âm nhạc</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Bộ Sưu Tập — padding đồng bộ UploadPage/UploadMusic */}
          {activeTab === "collection" && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Tổng bản ghi", value: "50,000+", icon: Database, color: "primary" },
                  { label: "Dân tộc", value: "54", icon: Users, color: "primary" },
                  { label: "Nhạc cụ", value: "200+", icon: Music, color: "secondary" },
                  { label: "Đã xác minh", value: "95%", icon: Check, color: "green" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-4 sm:p-6 text-white transition-all duration-300 hover:shadow-xl cursor-default ${
                      stat.color === "green"
                        ? "bg-gradient-to-br from-green-600 to-green-700"
                        : stat.color === "secondary"
                          ? "bg-gradient-to-br from-secondary-500 to-secondary-600"
                          : "bg-gradient-to-br from-primary-600 to-primary-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-8 h-8 opacity-90" strokeWidth={2.5} />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm opacity-90">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-primary-100/90 rounded-lg flex-shrink-0">
                  <Database className="w-5 h-5 text-primary-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">Bộ sưu tập</h3>
                  <p className="text-sm text-neutral-600 font-medium mt-1">Khám phá theo chủ đề và vùng miền</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {COLLECTIONS.map((collection, idx) => (
                  <div
                    key={idx}
                    className="border border-neutral-200/80 rounded-2xl p-4 sm:p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl cursor-pointer"
                    style={{ backgroundColor: "#FFFCF5" }}
                  >
                    <h4 className="font-semibold text-neutral-900 mb-2">{collection.name}</h4>
                    <div className="space-y-1 text-sm text-neutral-600 font-medium mb-3">
                      <p><strong>Số lượng:</strong> {collection.count} bản ghi</p>
                      <p><strong>Dân tộc:</strong> {collection.ethnic}</p>
                      <p><strong>Khu vực:</strong> {collection.region}</p>
                    </div>
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-neutral-200/80 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-br from-primary-600 to-primary-700 text-white focus:outline-none"
                    >
                      Xem bộ sưu tập
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
