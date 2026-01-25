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
        {/* Landing page - home */}
        <Route path="/" element={<FinnysightsLanding />} />
        
        {/* App routes */}
        <Route path="/app" element={<FinnysightsApp />} />
        <Route path="/dashboard" element={<FinnysightsDashboard />} />
        <Route path="/docs" element={<FinnysightsApiDocs />} />
        <Route path="/stock/:symbol" element={<FinnysightsStockDetail />} />
        
        {/* 404 fallback - go to landing */}
        <Route path="*" element={<FinnysightsLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
