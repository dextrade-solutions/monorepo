import ReactDOM from 'react-dom/client';

import { Ui } from '../ui';

window.global ||= window;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <Ui />
  </>,
);
