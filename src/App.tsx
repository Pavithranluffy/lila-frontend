// Main App Component
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NakamaProvider } from './contexts/NakamaContext';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';

function App() {
  return (
    <NakamaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NakamaProvider>
  );
}

export default App;
