export interface SearchQuery {
  must: string[];
  should: string[];
  must_not: string[];
  category?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  label: string;
  date: string;
  content: string;
  score?: number;
}

export interface SearchResponse {
  news: NewsItem[];
  total: number;
  page: number;
  size: number;
}

export interface CreateNewsRequest {
  title: string;
  category: string;
  content: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const searchNews = async (
  query: SearchQuery,
  page: number = 1,
  size: number = 10
): Promise<SearchResponse> => {
  const response = await fetch(`${API_BASE_URL}/news/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...query,
      page,
      page_size: size,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to search news');
  }

  return response.json();
};

export const getNewsById = async (newsId: string): Promise<NewsItem> => {
  const response = await fetch(`${API_BASE_URL}/news/${newsId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }

  return response.json();
};

export const createNews = async (news: CreateNewsRequest): Promise<NewsItem> => {
  const response = await fetch(`${API_BASE_URL}/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(news),
  });

  if (!response.ok) {
    throw new Error('Failed to create news');
  }

  return response.json();
};
