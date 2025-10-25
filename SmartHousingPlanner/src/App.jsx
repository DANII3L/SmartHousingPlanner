import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './pages/Home/common/Header'
import Footer from './pages/Home/common/Footer'
import HeroSection from './pages/Home/HeroSection'
import ProjectsSection from './pages/Home/ProjectsSection'
import PurchaseSteps from './pages/Home/PurchaseSteps'
import SubsidiesSection from './pages/Home/SubsidiesSection'
import ProjectsPage from './pages/Proyectos/components/ProjectsPage'
import ProjectDetailPage from './pages/Proyectos/components/ProjectDetailPage'
import SimuladorPage from './pages/SimuladorPagos/SimuladorPage'
import AuthManager from './pages/Auth/AuthManager'
import { AuthModalProvider } from './pages/Auth/context/AuthModalContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoutes from './UI/components/ProtectedRoutes'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={
                  <>
                    <HeroSection />
                    <ProjectsSection />
                    <SubsidiesSection />
                    <PurchaseSteps />
                  </>
                } />
                
                <Route path="/proyectos" element={<ProjectsPage />} />
                
                <Route path="/proyectos/:id/simulador" element={<ProjectDetailPage />} />
                
                <Route path="/simulador" element={<SimuladorPage />} />
                
                {/* Rutas protegidas */}
                <Route path="/*" element={<ProtectedRoutes />} />

              </Routes>
            </main>
            <Footer />
            <AuthManager />
          </div>
        </Router>
      </AuthModalProvider>
    </AuthProvider>
  )
}

export default App
