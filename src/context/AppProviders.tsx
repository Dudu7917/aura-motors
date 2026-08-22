import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { UIProvider } from './UIContext';
import { LeadsProvider } from './LeadsContext';
import { ShowroomProvider } from './ShowroomContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <UIProvider>
        <LeadsProvider>
          <ShowroomProvider>
            {children}
          </ShowroomProvider>
        </LeadsProvider>
      </UIProvider>
    </ThemeProvider>
  );
};
