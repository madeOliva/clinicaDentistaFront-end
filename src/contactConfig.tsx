import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CLINIC } from './config'

export interface HorarioItem {
  days: string
  hours: string
}

export interface ContactoConfig {
  name: string
  address: string
  telephone: string
  email: string
  schedule: HorarioItem[]
  facebook: string
  instagram: string
  whatsapp: string
  whatsappUrl: string
}

const STORAGE_KEY = 'clinica-sonrisa-contacto'

const VALORES_INICIALES: ContactoConfig = {
  name: CLINIC.name,
  address: CLINIC.address,
  telephone: CLINIC.telephone,
  email: CLINIC.email,
  schedule: CLINIC.schedule.map((s) => ({ ...s })),
  facebook: CLINIC.facebook,
  instagram: CLINIC.instagram,
  whatsapp: CLINIC.whatsapp,
  whatsappUrl: `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent('Hola, quiero más información.')}`,
}

function cargarContacto(): ContactoConfig {
  const guardado = localStorage.getItem(STORAGE_KEY)
  if (guardado) {
    try {
      const parseado = JSON.parse(guardado) as Partial<ContactoConfig>
      return {
        ...VALORES_INICIALES,
        ...parseado,
        schedule: parseado.schedule ?? VALORES_INICIALES.schedule,
      }
    } catch {
      return VALORES_INICIALES
    }
  }
  return VALORES_INICIALES
}

interface ContactoContextValue {
  contacto: ContactoConfig
  actualizarContacto: (campos: Partial<ContactoConfig>) => void
  restablecerContacto: () => void
}

const ContactoContext = createContext<ContactoContextValue | undefined>(undefined)

export function ContactoProvider({ children }: { children: ReactNode }) {
  const [contacto, setContacto] = useState<ContactoConfig>(cargarContacto)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacto))
  }, [contacto])

  const actualizarContacto = (campos: Partial<ContactoConfig>) => {
    setContacto((prev) => ({ ...prev, ...campos }))
  }

  const restablecerContacto = () => {
    setContacto(VALORES_INICIALES)
  }

  return (
    <ContactoContext.Provider value={{ contacto, actualizarContacto, restablecerContacto }}>
      {children}
    </ContactoContext.Provider>
  )
}

export function useContacto(): ContactoContextValue {
  const ctx = useContext(ContactoContext)
  if (!ctx) throw new Error('useContacto debe usarse dentro de ContactoProvider')
  return ctx
}

export function whatsappLink(whatsapp: string, message: string): string {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
}
