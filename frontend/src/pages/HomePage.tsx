import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export const HomePage = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-6xl font-normal text-center mb-8 text-gray-800">Gu Gồ</h1>
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm tin tức..."
              className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-full hover:shadow-md focus:shadow-md focus:outline-none transition-shadow"
            />
          </div>

          <div className="flex justify-center mt-6 gap-3">
            <button
              type="button"
              onClick={() => navigate('/post')}
              className="px-6 py-2 bg-gray-50 text-gray-700 text-sm rounded border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              Đăng tin
            </button>
          </div>
        </form>

        <div className="mt-8 text-sm text-gray-600 text-center space-y-1">
          <p>Search tips:</p>
          <p className="text-xs">
            Dùng <span className="font-mono bg-gray-100 px-1">-&lt;từ khóa cần tránh&gt;</span> để tránh cụm từ khóa,{' '}
            <span className="font-mono bg-gray-100 px-1">"&lt;từ khóa bắt buộc&gt;"</span> để lọc theo cụm từ khóa bắt buộc
          </p>
        </div>
      </div>
    </div>
  );
};
