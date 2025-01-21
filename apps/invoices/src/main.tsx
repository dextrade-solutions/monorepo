import React from 'react';
import ReactDOM from 'react-dom/client';

import { UI } from './ui';

import './engine';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UI />
  </React.StrictMode>,
);
