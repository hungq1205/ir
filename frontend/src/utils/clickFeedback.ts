const STORAGE_KEY = 'news_click_feedback';
const TTL_MS = 30 * 60 * 1000;

interface ClickFeedback {
  positives: string[];
  negatives: string[];
  expiresAt: number;
}

function loadFeedback(): ClickFeedback {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      positives: [],
      negatives: [],
      expiresAt: Date.now() + TTL_MS,
    };
  }

  const parsed: ClickFeedback = JSON.parse(raw);

  if (Date.now() > parsed.expiresAt) {
    localStorage.removeItem(STORAGE_KEY);
    return {
      positives: [],
      negatives: [],
      expiresAt: Date.now() + TTL_MS,
    };
  }

  return parsed;
}

function saveFeedback(data: ClickFeedback) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Register a click event
 * @param clickedId ID of clicked news
 * @param previousIds IDs appearing before clicked news
 */
export function registerClickFeedback(
  clickedId: string | null,
  previousIds: string[]
) {
  const feedback = loadFeedback();

  if (clickedId && !feedback.positives.includes(clickedId))
    feedback.positives.push(clickedId);

  for (const id of previousIds) {
    if (
      id !== clickedId &&
      !feedback.positives.includes(id) &&
      !feedback.negatives.includes(id)
    ) {
      feedback.negatives.push(id);
    }
  }

  feedback.expiresAt = Date.now() + TTL_MS;
  saveFeedback(feedback);
}

export function getClickFeedback(): ClickFeedback {
  return loadFeedback();
}

export function clearClickFeedback() {
  localStorage.removeItem(STORAGE_KEY);
}
