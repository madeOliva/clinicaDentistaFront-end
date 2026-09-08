import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Servicios from './pages/Servicios'
import Citas from './pages/Citas'
import Contactenos from './pages/Contactenos'
import Administrador from './pages/Administrador'
import { ServiciosProvider } from './data'
import { ContactoProvider } from './contactConfig'
import type { Vista } from './types'
import './App.css'

function App() {
  const [vista, setVista] = useState<Vista>('home')
  const [servicioSeleccionado, setServicioSeleccionado] = useState('')

  function reservarServicio(nombre: string) {
    setServicioSeleccionado(nombre)
    setVista('citas')
  }

  return (
    <ServiciosProvider>
      <ContactoProvider>
        {vista === 'administrador' ? (
          <Administrador onVolverAlSitio={() => setVista('home')} />
        ) : (
          <div className="app">
            <Navbar vista={vista} setVista={setVista} />
            <main className="contenido">
              {vista === 'home' && <Home setVista={setVista} />}
              {vista === 'servicios' && <Servicios onReservar={reservarServicio} />}
              {vista === 'citas' && <Citas servicioInicial={servicioSeleccionado} />}
              {vista === 'contactenos' && <Contactenos />}
            </main>
            <Footer setVista={setVista} />
          </div>
        )}
      </ContactoProvider>
    </ServiciosProvider>
  )
}

export default App
