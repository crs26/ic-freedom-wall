import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import store from './app/store'
import { Provider } from 'react-redux'
import { App } from './App'
import { AuthProvider } from './helpers/use-auth-client'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <HashRouter>
      <Provider store={store}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Provider>
    </HashRouter>
  </React.StrictMode>
)
