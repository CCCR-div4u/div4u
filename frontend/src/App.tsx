import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CrowdPredictionPage from './pages/CrowdPredictionPage';
import CrowdPredictionPageV2 from './pages/CrowdPredictionPageV2';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ComingSoonPage from './pages/ComingSoonPage';
import ComparisonPage from './pages/ComparisonPage';
import DevToolsPage from './pages/DevToolsPage';
import LocationsPage from './pages/LocationsPage';
import NLPTester from './components/NLPTester';
import CongestionTester from './components/CongestionTester';
import ComponentTest from './components/test/ComponentTest';
import CharacterTest from './components/test/CharacterTest';
import APITest from './components/test/APITest';
import CongestionResultTest from './components/test/CongestionResultTest';
import AdvancedCharacterTest from './components/test/AdvancedCharacterTest';
import AnimationSequenceTest from './components/test/AnimationSequenceTest';
import ResponsiveTest from './components/test/ResponsiveTest';
import MobileTestGuide from './components/test/MobileTestGuide';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/prediction" element={<CrowdPredictionPageV2 />} />
          <Route path="/realtime" element={<CrowdPredictionPageV2 />} />
          <Route path="/prediction-v1" element={<CrowdPredictionPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/other" element={<ComingSoonPage />} />
          
          {/* 새로운 페이지들 */}
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/dev-tools" element={<DevToolsPage />} />
          
          {/* 개발자 도구들 - 새로운 경로 */}
          <Route path="/dev-tools/nlp-test" element={<NLPTester />} />
          <Route path="/dev-tools/congestion-test" element={<CongestionTester />} />
          <Route path="/dev-tools/component-test" element={<ComponentTest />} />
          <Route path="/dev-tools/character-test" element={<CharacterTest />} />
          <Route path="/dev-tools/api-test" element={<APITest />} />
          <Route path="/dev-tools/result-test" element={<CongestionResultTest />} />
          <Route path="/dev-tools/advanced-character-test" element={<AdvancedCharacterTest />} />
          <Route path="/dev-tools/animation-sequence-test" element={<AnimationSequenceTest />} />
          <Route path="/dev-tools/responsive-test" element={<ResponsiveTest />} />
          <Route path="/dev-tools/mobile-test" element={<MobileTestGuide />} />
          
          {/* 기존 경로들 (하위 호환성) */}
          <Route path="/nlp-test" element={<NLPTester />} />
          <Route path="/congestion-test" element={<CongestionTester />} />
          <Route path="/component-test" element={<ComponentTest />} />
          <Route path="/character-test" element={<CharacterTest />} />
          <Route path="/api-test" element={<APITest />} />
          <Route path="/result-test" element={<CongestionResultTest />} />
          <Route path="/advanced-character-test" element={<AdvancedCharacterTest />} />
          <Route path="/animation-sequence-test" element={<AnimationSequenceTest />} />
          <Route path="/responsive-test" element={<ResponsiveTest />} />
          <Route path="/mobile-test-guide" element={<MobileTestGuide />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;