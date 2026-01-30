import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BuildProvider } from './context/BuildContext'; // NEW IMPORT
import { ChatProvider } from './context/ChatContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ChatProvider>
        {/* BuildProvider must be inside AuthProvider to access isAuthenticated */}
        <BuildProvider>
          <App />
        </BuildProvider>
      </ChatProvider>
    </AuthProvider>
  </React.StrictMode>,
);
