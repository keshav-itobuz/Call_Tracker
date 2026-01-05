import React from 'react';
import { UserProvider } from './src/context/UserContext';
import AppContent from './src/AppContent';

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
