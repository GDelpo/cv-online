import Cv from './components/cv/CV/index';
import { cvData } from './constants/cv';
import ThemeToggle from './components/common/ui/ThemeToggle';
import PrintButton from './components/common/ui/PrintButton';

function App() {
  return (
    <div className="min-h-screen 
      bg-gradient-to-br from-gray-50 to-gray-100 
      dark:from-gray-900 dark:to-gray-950
      transition-colors duration-300
      print:bg-white">

      <div className="fixed top-4 right-4 z-50 
        flex gap-2 
        p-2 rounded-full 
        bg-white/70 dark:bg-gray-800/70 
        backdrop-blur-sm 
        ring-1 ring-black/5 dark:ring-white/10 
        shadow-lg shadow-black/5 dark:shadow-black/20
        print:hidden">
        
        <PrintButton />
        <ThemeToggle />

      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 ">
        <Cv cvData={cvData} />
      </div>
    </div>
  );
}

export default App;