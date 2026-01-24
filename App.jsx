import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import from flat structure (all files in root)
import FinnysightsLanding from './finnysights-landing';
import FinnysightsApp from './finnysights-app';
import FinnysightsDashboard from './finnysights-dashboard';
import FinnysightsApiDocs from './finnysights-api-docs';
import FinnysightsStockDetail from './finnysights-stock-detail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<FinnysightsLanding />} />
        <Route path="/docs" element={<FinnysightsApiDocs />} />
        
        {/* App routes */}
        <Route path="/app" element={<FinnysightsApp />} />
        <Route path="/dashboard" element={<FinnysightsDashboard />} />
        <Route path="/stock/:symbol" element={<FinnysightsStockDetail />} />
        
        {/* 404 fallback */}
        <Route path="*" element={<FinnysightsLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
