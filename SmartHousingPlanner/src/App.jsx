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
import MisPagosPage from './pages/MisPagos/MisPagosPage'
import './App.css'

function App() {
  return (
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
            
            <Route path="/mis-pagos" element={<MisPagosPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
