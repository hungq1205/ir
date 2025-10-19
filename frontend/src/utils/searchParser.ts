import { SearchQuery } from '../services/api';

export const parseSearchQuery = (searchText: string): SearchQuery => {
  const must: string[] = [];
  const should: string[] = [];
  const must_not: string[] = [];

  let currentIndex = 0;

  const skipWhitespace = () => {
    while (currentIndex < searchText.length && searchText[currentIndex] === ' ') {
      currentIndex++;
    }
    return currentIndex >= searchText.length;
  }

  const parseMustNotTerm = () => {
    if (searchText[currentIndex] === '"') {
      currentIndex++;
      let term = '';
      while (currentIndex < searchText.length && searchText[currentIndex] !== '"') {
        term += searchText[currentIndex];
        currentIndex++;
      }
      if (currentIndex < searchText.length) currentIndex++;
      if (term) must_not.push(term);
    } else {
      let term = '';
      while (currentIndex < searchText.length && searchText[currentIndex] !== ' ') {
        term += searchText[currentIndex];
        currentIndex++;
      }
      if (term) must_not.push(term);
    }
  }

  const parseMustTerm = () => {
    let term = '';
    while (currentIndex < searchText.length && searchText[currentIndex] !== '"') {
      term += searchText[currentIndex];
      currentIndex++;
    }
    if (currentIndex < searchText.length) currentIndex++;
    if (term) must.push(term);
  }

  const parseShouldTerm = () => {
    let term = '';
    while (currentIndex < searchText.length && searchText[currentIndex] !== ' ') {
      term += searchText[currentIndex];
      currentIndex++;
    }
    if (term) should.push(term);
  }

  while (currentIndex < searchText.length) {
    if (skipWhitespace()) break;

    if (searchText[currentIndex] === '-') {
      currentIndex++;
      if (skipWhitespace()) break;
      parseMustNotTerm();
    } else if (searchText[currentIndex] === '"') {
      currentIndex++;
      parseMustTerm();
    } else
      parseShouldTerm();
  }

  return { must, should, must_not };
};
