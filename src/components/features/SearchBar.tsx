import { useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import {
  SearchFilters,
  Region,
  RecordingType,
  VerificationStatus,
} from "@/types";
import Button from "../common/Button";
import Input from "../common/Input";
import { REGION_NAMES, RECORDING_TYPE_NAMES } from "@/config/constants";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    onSearch({ ...filters, query });
  };

  const handleClear = () => {
    setQuery("");
    setFilters({});
    onSearch({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex space-x-2 mb-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search recordings, instruments, performers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="primary">
          <SearchIcon className="h-5 w-5 mr-2" />
          Search
        </Button>
        <Button onClick={handleClear} variant="outline">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-primary-600 hover:text-primary-700"
      >
        {showAdvanced ? "Hide" : "Show"} Advanced Filters
      </button>

      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-secondary-200">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Region
            </label>
            <select
              className="w-full px-3 py-2 bg-white text-secondary-900 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.regions?.[0] || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  regions: e.target.value ? [e.target.value as Region] : [],
                })
              }
            >
              <option value="">All Regions</option>
              {Object.entries(REGION_NAMES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Recording Type
            </label>
            <select
              className="w-full px-3 py-2 bg-white text-secondary-900 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.recordingTypes?.[0] || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  recordingTypes: e.target.value
                    ? [e.target.value as RecordingType]
                    : [],
                })
              }
            >
              <option value="">All Types</option>
              {Object.entries(RECORDING_TYPE_NAMES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Verification Status
            </label>
            <select
              className="w-full px-3 py-2 bg-white text-secondary-900 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.verificationStatus?.[0] || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  verificationStatus: e.target.value
                    ? [e.target.value as VerificationStatus]
                    : [],
                })
              }
            >
              <option value="">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
