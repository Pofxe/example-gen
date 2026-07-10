import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ArithmeticPage } from './pages/ArithmeticPage';
import { FractionsPage } from './pages/FractionsPage';
import { PercentagesPage } from './pages/PercentagesPage';
import { PowersPage } from './pages/PowersPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/topic/arithmetic" element={<ArithmeticPage />} />
            <Route path="/topic/fractions" element={<FractionsPage />} />
            <Route path="/topic/percentages" element={<PercentagesPage />} />
            <Route path="/topic/powers" element={<PowersPage />} />
            <Route
              path="*"
              element={
                <div className="page">
                  <h1>Страница не найдена</h1>
                  <p>
                    <a href="/">Вернуться на главную</a>
                  </p>
                </div>
              }
            />
          </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
