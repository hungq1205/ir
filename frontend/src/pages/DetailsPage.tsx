import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { getNewsById, getRelevantNews, NewsItem } from '../services/api';

function formatTimestamp(timestamp?: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
}

export const DetailsPage = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!newsId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getNewsById(newsId);
        setNews(data);

        setRelatedLoading(true);
        const currentId = parseInt(newsId, 10);
        if (!isNaN(currentId)) {
          const related = await getRelevantNews(currentId, [], [], 5);
          setRelatedNews(related);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
        setRelatedLoading(false);
      }
    };

    fetchNews();
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'News not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            Trở về
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Trở về</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {news.title}
          </h1>

          <div className="mb-6 flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {news.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatTimestamp(news.published_at) || 'Unknown date'}</span>
            </div>
          </div>

          {news.thumbnail && (
            <img
              src={news.thumbnail}
              alt={news.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-8">
            {news.content}
          </div>
        </article>

        {relatedNews.length > 0 && (
          <section className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Tin tức liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/news/${item.id}`)}
                  className="cursor-pointer group"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded-lg mb-3 group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-3 group-hover:opacity-80 transition-opacity">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedLoading && (
          <div className="text-center py-8 text-gray-600">
            Đang tải tin tức liên quan...
          </div>
        )}
      </main>
    </div>
  );
};
