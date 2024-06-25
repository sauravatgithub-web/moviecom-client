import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import { theme } from './components/constants/color.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <HelmetProvider>
        <CssBaseline/> 
          <div onContextMenu = {(e) => {e.preventDefault()}}>
            <App />
          </div>
      </HelmetProvider>
    </Provider>
  </ThemeProvider>,
)