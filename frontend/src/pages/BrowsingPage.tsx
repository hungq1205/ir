import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchNews, SearchResponse, NewsItem } from '../services/api';
import { parseSearchQuery } from '../utils/searchParser';
import { CATEGORIES } from '../utils/constants';

export const BrowsingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const performSearch = async (query: string, page: number, cat: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const parsedQuery = parseSearchQuery(query);
      const searchQuery = {
        ...parsedQuery,
        ...(cat !== 'All' && { category: cat }),
      };

      const response = await searchNews(searchQuery, page, 10);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchText(query);
      performSearch(query, currentPage, category);
    }
  }, [searchParams, currentPage, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      setCurrentPage(1);
      navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  const totalPages = results ? Math.ceil(results.total / 10) : 0;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-8">
            <h1
              onClick={() => navigate('/')}
              className="text-2xl font-normal text-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
            >
              Gu Gồ
            </h1>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for news..."
                  className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-full hover:shadow-md focus:shadow-md focus:outline-none transition-shadow"
                />
              </div>
            </form>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-600">Chủ đề:</span>
            <div className="flex gap-2 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                    category === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-12 text-gray-600">
            Loading results...
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {results && !loading && (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Tìm được {results.total} kết quả
            </div>

            <div className="space-y-8">
              {results.news.map((item) => (
                <article
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/news/${item.id}`)}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs text-gray-600 mr-2">{item.label}</span>
                    {/* <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span> */}
                    {item.score !== undefined && (
                      <span className="text-xs text-gray-500 ml-auto">
                        Score: <span className="font-medium text-gray-700">{item.score.toFixed(2)}</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl text-blue-700 hover:underline mb-1">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {item.content}
                  </p>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
