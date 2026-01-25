import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FinnysightsLanding from './finnysights-landing.jsx';
import FinnysightsApp from './finnysights-app.jsx';
import FinnysightsDashboard from './finnysights-dashboard.jsx';
import FinnysightsApiDocs from './finnysights-api-docs.jsx';
import FinnysightsStockDetail from './finnysights-stock-detail.jsx';

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
