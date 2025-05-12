'use client'

/**
 * Presentation Layer: ResponsiveLayout
 * A responsive container for the application content
 */

import React, { ReactNode } from 'react';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <header className="w-full p-4 bg-gray-900/40 backdrop-blur-sm">
        <div className="w-full max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Next.js 3D Scene</h1>
        </div>
      </header>
      
      <main className="flex-grow w-full p-4">
        <div className="w-full max-w-7xl mx-auto px-4 h-full">
          {children}
        </div>
      </main>
      
      <footer className="w-full p-4 bg-gray-900/40 backdrop-blur-sm text-center text-sm">
        <div className="w-full max-w-7xl mx-auto px-4">
          <p>Built with Next.js and React Three Fiber</p>
        </div>
      </footer>
    </div>
  );
} 