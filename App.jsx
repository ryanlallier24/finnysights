import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import page components
// Note: Update these import paths based on where you place your component files
import FinnysightsLanding from './components/landing/FinnysightsLanding';
import FinnysightsApp from './components/app/FinnysightsApp';
import FinnysightsDashboard from './components/dashboard/FinnysightsDashboard';
import FinnysightsApiDocs from './components/api-docs/FinnysightsApiDocs';
import FinnysightsStockDetail from './components/stock-detail/FinnysightsStockDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<FinnysightsLanding />} />
        <Route path="/docs" element={<FinnysightsApiDocs />} />
        
        {/* App routes (would typically require auth) */}
        <Route path="/app" element={<FinnysightsApp />} />
        <Route path="/dashboard" element={<FinnysightsDashboard />} />
        <Route path="/stock/:symbol" element={<FinnysightsStockDetail />} />
        
        {/* 404 fallback - redirect to landing */}
        <Route path="*" element={<FinnysightsLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
