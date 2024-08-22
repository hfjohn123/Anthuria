import 'reshaped/themes/reshaped/theme.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import './css/style.css';
import 'flatpickr/dist/flatpickr.min.css';
import { BrowserRouter } from 'react-router-dom';
// import { Reshaped } from 'reshaped';
// import 'reshaped/themes/slate/theme.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    {/*<Reshaped defaultTheme="reshaped">*/}
    <App />
    {/*</Reshaped>*/}
  </BrowserRouter>,
);
