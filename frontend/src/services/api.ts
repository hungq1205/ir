export interface SearchQuery {
  must: string[];
  should: string[];
  must_not: string[];
  category?: string;
}

export interface NewsItem {
  id: string;
  title?: string;
  category: string;
  published_at?: number;
  content: string;
  score?: number;
  thumbnail?: string;
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

  if (!response.ok)
    throw new Error('Failed to search news: ' + response.statusText);
  return response.json();
};

export const getRelevantNews = async (
  currentId: number,
  positiveIds: number[] = [],
  negativeIds: number[] = [],
  size: number = 5
): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/relevant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_id: currentId,
        positive_ids: positiveIds,
        negative_ids: negativeIds,
        size,
      }),
    });

    if (!response.ok)
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    return await response.json();
  } catch (error) {
    throw new Error('Failed to get relvent news of ' + currentId + ': ' + (error instanceof Error ? error.message : String(error)));
  }
};

export const getNewsById = async (newsId: string): Promise<NewsItem> => {
  const response = await fetch(`${API_BASE_URL}/news/${newsId}`);

  if (!response.ok)
    throw new Error('Failed to fetch news: ' + response.statusText);
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

  if (!response.ok)
    throw new Error('Failed to create news: ' + response.statusText);
  return response.json();
};
