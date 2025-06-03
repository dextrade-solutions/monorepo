import './App.css';
import PaybisIntegrationPage from './PaybisIntegrationPage';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BackPage from "./paybis-back";
import DepositPage from "./paybis-depositredirect";
import { PaybisConfig } from './paybis-api-client';
import { DocumentUpload } from './DocumentUpload'

const paybisConfig: PaybisConfig = {
  apiKey: process.env.REACT_APP_NODE_ENV === 'production' 
    ? process.env.REACT_APP_PAYBIS_API_KEY_PROD || 'not_configured'
    : process.env.REACT_APP_PAYBIS_API_KEY_SANDBOX || 'not_configured',
  secretKey: 'not_configured',
  baseUrl: process.env.REACT_APP_NODE_ENV === 'production' 
    ? process.env.REACT_APP_PAYBIS_API_URL_PROD || 'not_configured'
    : process.env.REACT_APP_PAYBIS_API_URL_SANDBOX || 'not_configured',
  widgetUrl: process.env.REACT_APP_NODE_ENV === 'production' 
    ? process.env.REACT_APP_PAYBIS_WIDGET_URL_PROD || 'not_configured'
    : process.env.REACT_APP_PAYBIS_WIDGET_URL_SANDBOX || 'not_configured',
  widgetUrlSell: process.env.REACT_APP_NODE_ENV === 'production' 
    ? process.env.REACT_APP_PAYBIS_WIDGETSELL_URL_PROD || 'not_configured'
    : process.env.REACT_APP_PAYBIS_WIDGETSELL_URL_SANDBOX || 'not_configured',
  isLive: process.env.REACT_APP_NODE_ENV === 'production',
  apiUrl: process.env.REACT_APP_API_BASE_URL || '',
  backUrl: process.env.REACT_APP_BACK_URL || '',
  failureBackUrl: process.env.REACT_APP_BACK_FAILURE_URL || '',  
  depositRedirectUrl: process.env.REACT_APP_DEPOSITREDIRECT_URL || '',
  user_id: '2',
  email: 'sshevaiv++@gmail.com',
  locale: 'en',
};


function App() {
  return (
    <Router basename="/services_front_dev/paybis">
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<PaybisIntegrationPage paybisConfig={paybisConfig} />} />
            <Route path="/back" element={<BackPage />} />
            <Route path="/depositredirect" element={<DepositPage paybisConfig={paybisConfig}/>} />
            <Route path="/upload" element={<DocumentUpload />} />            
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
