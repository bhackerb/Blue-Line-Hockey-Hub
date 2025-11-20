import React from 'react';

const Header: React.FC = () => (
  <header className="p-4 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
    </svg>
    <h1 className="text-3xl font-bold tracking-wider text-white" style={{textShadow: '0 0 12px rgba(59, 130, 246, 0.6)'}}>
        Blue Line Hockey Hub
    </h1>
  </header>
);

export default Header;