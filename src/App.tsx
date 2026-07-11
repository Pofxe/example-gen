import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ArithmeticPage } from './pages/ArithmeticPage';
import { FractionsPage } from './pages/FractionsPage';
import { PercentagesPage } from './pages/PercentagesPage';
import { PowersPage } from './pages/PowersPage';
import { RootsPage } from './pages/RootsPage';
import { IdentitiesPage } from './pages/IdentitiesPage';
import { LoadAssignmentPage } from './pages/LoadAssignmentPage';
import { LinearEquationsPage } from './pages/LinearEquationsPage';
import { QuadraticEquationsPage } from './pages/QuadraticEquationsPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppFooter } from './components/AppFooter';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="app-shell">
          <div className="app">
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/topic/arithmetic" element={<ArithmeticPage />} />
            <Route path="/topic/fractions" element={<FractionsPage />} />
            <Route path="/topic/percentages" element={<PercentagesPage />} />
            <Route path="/topic/powers" element={<PowersPage />} />
            <Route path="/topic/roots" element={<RootsPage />} />
            <Route path="/topic/identities" element={<IdentitiesPage />} />
            <Route path="/load" element={<LoadAssignmentPage />} />
            <Route path="/topic/linear-equations" element={<LinearEquationsPage />} />
            <Route path="/topic/quadratic-equations" element={<QuadraticEquationsPage />} />
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
          <AppFooter />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
