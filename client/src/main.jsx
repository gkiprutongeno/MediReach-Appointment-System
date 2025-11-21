import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  console.error('Failed to render app:', err);
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <div style={{ padding: '2rem', color: 'red', fontFamily: 'sans-serif' }}>
      <h1>Error Loading App</h1>
      <p>{err?.message}</p>
      <pre>{err?.stack}</pre>
    </div>
  );
}
