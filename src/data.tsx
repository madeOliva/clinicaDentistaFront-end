import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Servicio } from './types'
import { CLINIC } from './config'

const STORAGE_KEY = 'clinica-sonrisa-servicios'

const SERVICIOS_INICIALES: Servicio[] = [
  { id: '1', nombre: 'Blanqueamiento dental', descripcion: 'Aclara el tono de tus dientes en una sola sesión.', precio: 20, moneda: 'USD', disponible: true },
  { id: '2', nombre: 'Limpieza dental', descripcion: 'Eliminación de placa y sarro para una boca saludable.', precio: 30, moneda: 'USD', disponible: true },
  { id: '3', nombre: 'Extracción dental', descripcion: 'Extracción segura de piezas afectadas.', precio: 25, moneda: 'USD', disponible: true },
  { id: '4', nombre: 'Relleno / Empaste', descripcion: 'Reparación de caries con materiales estéticos.', precio: 35, moneda: 'USD', disponible: true },
  { id: '5', nombre: 'Ortodoncia / Brackets', descripcion: 'Corrección de la alineación de tus dientes.', precio: 300, moneda: 'USD', disponible: true },
  { id: '6', nombre: 'Consulta general', descripcion: 'Evaluación y diagnóstico completo de tu salud bucal.', precio: 15, moneda: 'USD', disponible: true },
]

function cargarServicios(): Servicio[] {
  const guardado = localStorage.getItem(STORAGE_KEY)
  if (guardado) {
    try {
      return JSON.parse(guardado) as Servicio[]
    } catch {
      return SERVICIOS_INICIALES
    }
  }
  return SERVICIOS_INICIALES
}

interface ServiciosContextValue {
  servicios: Servicio[]
  agregarServicio: (s: Omit<Servicio, 'id'>) => void
  modificarServicio: (s: Servicio) => void
  eliminarServicio: (id: string) => void
}

const ServiciosContext = createContext<ServiciosContextValue | undefined>(undefined)

export function ServiciosProvider({ children }: { children: ReactNode }) {
  const [servicios, setServicios] = useState<Servicio[]>(cargarServicios)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servicios))
  }, [servicios])

  const agregarServicio = (s: Omit<Servicio, 'id'>) => {
    setServicios((prev) => [...prev, { ...s, id: crypto.randomUUID() }])
  }

  const modificarServicio = (s: Servicio) => {
    setServicios((prev) => prev.map((item) => (item.id === s.id ? s : item)))
  }

  const eliminarServicio = (id: string) => {
    setServicios((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <ServiciosContext.Provider value={{ servicios, agregarServicio, modificarServicio, eliminarServicio }}>
      {children}
    </ServiciosContext.Provider>
  )
}

export function useServicios(): ServiciosContextValue {
  const ctx = useContext(ServiciosContext)
  if (!ctx) throw new Error('useServicios debe usarse dentro de ServiciosProvider')
  return ctx
}

export { CLINIC }
