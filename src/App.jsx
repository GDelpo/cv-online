import Cv from '@cv/CV';
import ATSCV from '@cv/ATSCV';
import { useCVData } from '@hooks/useCVData';
import { COMMON_STYLES } from '@constants/styles';
import ThemeToggle from '@ui/ThemeToggle';
import PrintButton from '@ui/PrintButton';
import ScrollToTop from '@ui/ScrollToTop';
import ATSInfo from '@ui/ATSInfo';
import { formatBuildDate } from '@utils/date';

// Componente de controles flotantes modernos
const FloatingControls = () => (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 print:hidden">
    <div className="flex items-center gap-3 p-3 rounded-2xl 
      bg-white/80 dark:bg-gray-900/80 
      backdrop-blur-xl 
      border border-white/20 dark:border-gray-700/30
      shadow-xl shadow-gray-900/10 dark:shadow-gray-900/25
      hover:shadow-2xl hover:shadow-gray-900/15 dark:hover:shadow-gray-900/30
      transition-all duration-300 ease-out
      hover:scale-[1.01]">
      <PrintButton />
      <ThemeToggle />
      <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
      <span className="text-[11px] leading-none text-gray-700 dark:text-gray-300 px-1">
        Última actualización: {formatBuildDate(import.meta.env.VITE_BUILD_TIME)}
      </span>
    </div>
  </div>
);

function App() {
  const { cvData, loading, error } = useCVData();

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
      <ATSInfo />
      
      {/* Versión normal para pantalla */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 print:hidden">
        {loading && (
          <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 italic">Cargando datos de LinkedIn...</div>
        )}
        {!loading && cvData && (
          <>
            <Cv cvData={cvData} />
            <div className="mt-4 text-[10px] text-gray-400 dark:text-gray-500">Fuente de datos: LinkedIn (JSON)</div>
          </>
        )}
        {error && (
          <div className="mb-4 text-xs text-red-500 dark:text-red-400 italic">Error cargando datos: {error}</div>
        )}
      </div>

      {/* Versión ATS para impresión */}
      {cvData && <ATSCV cvData={cvData} />}
    </div>
  );
}

export default App;
