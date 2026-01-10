import { useState, useRef, useEffect } from "react";
import { Search as SearchIcon, X, ChevronDown } from "lucide-react";
import {
  SearchFilters,
  Region,
  RecordingType,
  VerificationStatus,
} from "@/types";
import { REGION_NAMES, RECORDING_TYPE_NAMES } from "@/config/constants";
import { addSpotlightEffect } from "@/utils/spotlight";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: { key: string; value: string }[];
  onChange: (value: string) => void;
  placeholder: string;
}

function CustomDropdown({
  label,
  value,
  options,
  onChange,
  placeholder,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.key === value);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 pr-10 bg-white text-secondary-900 border border-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors cursor-pointer text-left flex items-center justify-between"
      >
        <span>{selectedOption ? selectedOption.value : placeholder}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-[9999] w-full mt-2 backdrop-blur-xl bg-white rounded-2xl shadow-2xl border border-white/40 overflow-hidden"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <div
            className="max-h-60 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#10b981 rgba(255, 255, 255, 0.3)",
            }}
          >
            <style>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 10px;
              }
              div::-webkit-scrollbar-thumb {
                background: #10b981;
                border-radius: 10px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: #059669;
              }
            `}</style>
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  onChange(option.key);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-3 text-left transition-colors ${
                  value === option.key
                    ? "bg-emerald-500 text-white font-medium"
                    : "text-secondary-900 hover:bg-emerald-100 hover:text-emerald-900"
                }`}
              >
                {option.value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    if (searchBarRef.current) {
      const cleanup = addSpotlightEffect(searchBarRef.current);
      return cleanup;
    }
  }, []);

  const handleSearch = () => {
    onSearch({ ...filters, query });
  };

  const handleClear = () => {
    setQuery("");
    setFilters({});
    onSearch({});
  };

  const regionOptions = [
    { key: "", value: "Tất cả vùng" },
    ...Object.entries(REGION_NAMES).map(([key, value]) => ({ key, value })),
  ];

  const recordingTypeOptions = [
    { key: "", value: "Tất cả loại" },
    ...Object.entries(RECORDING_TYPE_NAMES).map(([key, value]) => ({
      key,
      value,
    })),
  ];

  const verificationStatusOptions = [
    { key: "", value: "Tất cả trạng thái" },
    { key: "VERIFIED", value: "Đã xác minh" },
    { key: "PENDING", value: "Đang chờ" },
    { key: "UNDER_REVIEW", value: "Đang kiểm duyệt" },
  ];

  return (
    <div
      ref={searchBarRef}
      className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-6 overflow-visible"
      style={{
        boxShadow:
          "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
      }}
    >
      <div className="flex space-x-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm bản thu, nhạc cụ, nghệ nhân và hơn thế nữa"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full px-5 py-3 bg-white text-secondary-900 placeholder:text-secondary-400 border border-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          className="btn-liquid-glass-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <SearchIcon className="h-5 w-5" />
          Tìm kiếm
        </button>
        <button
          onClick={handleClear}
          className="btn-liquid-glass-close w-12 h-12 flex-shrink-0 flex items-center justify-center"
        >
          <span className="relative z-10">
            <X className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
        </button>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-white hover:text-green-500 active:text-green-700"
      >
        {showAdvanced ? "Ẩn" : "Hiện"} bộ lọc nâng cao
      </button>

      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-secondary-200">
          <CustomDropdown
            label="Vùng miền"
            value={filters.regions?.[0] || ""}
            options={regionOptions}
            onChange={(value) =>
              setFilters({
                ...filters,
                regions: value ? [value as Region] : [],
              })
            }
            placeholder="Tất cả vùng"
          />

          <CustomDropdown
            label="Loại bản ghi"
            value={filters.recordingTypes?.[0] || ""}
            options={recordingTypeOptions}
            onChange={(value) =>
              setFilters({
                ...filters,
                recordingTypes: value ? [value as RecordingType] : [],
              })
            }
            placeholder="Tất cả loại"
          />

          <CustomDropdown
            label="Trạng thái"
            value={filters.verificationStatus?.[0] || ""}
            options={verificationStatusOptions}
            onChange={(value) =>
              setFilters({
                ...filters,
                verificationStatus: value ? [value as VerificationStatus] : [],
              })
            }
            placeholder="Tất cả trạng thái"
          />
        </div>
      )}
    </div>
  );
}
