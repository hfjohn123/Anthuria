import ReactDOM from 'react-dom/client';
import App from './App';
import './css/style.css';
import 'flatpickr/dist/flatpickr.min.css';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
