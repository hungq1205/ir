import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BrowsingPage } from './pages/BrowsingPage';
import { DetailsPage } from './pages/DetailsPage';
import { PostNewsPage } from './pages/PostNewsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<BrowsingPage />} />
        <Route path="/news/:newsId" element={<DetailsPage />} />
        <Route path="/post" element={<PostNewsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
