import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { FeatureGrid } from './components/sections/FeatureGrid';
import { Showcase } from './components/sections/Showcase';
import { Process } from './components/sections/Process';
import { CTA } from './components/sections/CTA';

function App() {
  return (
    <div className="app-shell">
      <div className="background-orb orb-left" aria-hidden="true" />
      <div className="background-orb orb-right" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <Showcase />
        <Process />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
