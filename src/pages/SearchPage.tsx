import { SearchFilters } from "@/types";
import SearchBar from "@/components/features/SearchBar";

export default function SearchPage() {
  const handleSearch = (newFilters: SearchFilters) => {
    // Implement search logic here
    console.log("Search with filters:", newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Search</h1>
      <SearchBar onSearch={handleSearch} />

      <div className="mt-8 text-center text-secondary-500">
        <p>Search results will appear here</p>
      </div>
    </div>
  );
}