import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FinnysightsLanding from './finnysights-landing.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FinnysightsLanding />} />
        <Route path="*" element={<FinnysightsLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
