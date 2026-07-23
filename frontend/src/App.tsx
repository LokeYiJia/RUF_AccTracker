import { Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import AccountPage from './pages/AccountPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/accounts/:id" element={<AccountPage />} />
      </Routes>
    </div>
  )
}

export default App
