import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './redux/store'

import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

// ✅ FIXED: Imported axios and forced cross-domain cookie inclusion globally
import axios from 'axios'
axios.defaults.withCredentials = true

const persistor = persistStore(store)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} >
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
)