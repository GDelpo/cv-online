import React from 'react';
import { User } from 'lucide-react';
import Badge from '../../../components/common/ui/Badge';
import IconWrapper from '../../../components/common/ui/IconWrapper';

const Header = ({ name, title, description, photo }) => (
  <header className="bg-slate-900 dark:bg-gray-950 text-white p-6 md:p-8 rounded-t-xl">
    <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8">
      <div className="flex justify-center md:justify-start">
        <div className="w-48 h-48 rounded-full overflow-hidden 
          border-2 border-white/20 
          shadow-lg shadow-blue-500/50 dark:shadow-blue-400/30 
          transition-shadow duration-300 
          hover:shadow-blue-500/75 dark:hover:shadow-blue-400/50">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 dark:bg-gray-900">
              <IconWrapper 
                icon={User} 
                size="lg" 
                color="gray" 
                className="w-24 h-24 opacity-50"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center md:text-left space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {name}
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <h2 className="text-xl text-gray-300 dark:text-gray-400 font-medium">
              {title}
            </h2>
            <Badge variant="success">Disponible para proyectos</Badge>
          </div>
        </div>
        <p className="text-base md:text-lg text-gray-300 dark:text-gray-400 leading-relaxed max-w-3xl">
          {description}
        </p>
      </div>
    </div>
  </header>
);

export default Header;