import Cv from '@cv/CV';
import { cvData } from '@constants/cv';
import { COMMON_STYLES } from '@constants/styles';
import ThemeToggle from '@ui/ThemeToggle';
import PrintButton from '@ui/PrintButton';
import ScrollToTop from '@ui/ScrollToTop';

// Componente de controles flotantes modernos
const FloatingControls = () => (
  <div className="fixed top-6 right-6 z-50 print:hidden">
    <div className="flex gap-3 p-3 rounded-2xl 
      bg-white/80 dark:bg-gray-900/80 
      backdrop-blur-xl 
      border border-white/20 dark:border-gray-700/30
      shadow-xl shadow-gray-900/10 dark:shadow-gray-900/25
      hover:shadow-2xl hover:shadow-gray-900/15 dark:hover:shadow-gray-900/30
      transition-all duration-300 ease-out
      hover:scale-[1.01]">
      <PrintButton />
      <ThemeToggle />
    </div>
  </div>
);

function App() {
  return (
    <div className={`
      min-h-screen 
      ${COMMON_STYLES.gradientBg}
      ${COMMON_STYLES.transition}
      print:bg-white
      relative
    `}>
      {/* Background patterns modernos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <FloatingControls />
      <ScrollToTop />
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <Cv cvData={cvData} />
      </div>
    </div>
  );
}

export default App;
