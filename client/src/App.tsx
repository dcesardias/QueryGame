import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { initSqlEngine } from './services/sqlEngine';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import ChallengePage from './pages/Challenge';
import LeaderboardPage from './pages/Leaderboard';
import OnboardingPage from './pages/Onboarding';

function AppRoutes() {
  const location = useLocation();
  const onboardingDone = localStorage.getItem('querygame_onboarding_done') === 'true';

  // Redirect to onboarding if not done (except if already there)
  if (!onboardingDone && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/challenge/:id" element={<ChallengePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default function App() {
  const { isAuthenticated, loadSession } = useGameStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initSqlEngine();
      } catch (e) {
        console.warn('sql.js init deferred:', e);
      }
      try {
        await loadSession();
      } catch (e) {
        console.warn('session load failed:', e);
      }
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto" />
          <p className="text-text-secondary mt-4 font-mono text-sm">Inicializando terminal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppRoutes />;
}
