import React from 'react';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen 
    bg-gradient-to-br from-gray-50 to-gray-100 
    dark:from-gray-900 dark:to-gray-950 
    transition-colors duration-300">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;