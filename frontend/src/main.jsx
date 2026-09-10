import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { TaskProvider } from './context/TaskContext.jsx'
import { PomodoroProvider } from './context/PomodoroContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <TaskProvider>
        <PomodoroProvider>
          <App />
        </PomodoroProvider>
      </TaskProvider>
    </AuthProvider>
  </React.StrictMode>,
)
