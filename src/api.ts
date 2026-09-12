import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const api = axios.create({ baseURL: API_URL })

export interface ServicioBackend {
  _id: string
  nombreServicio: string
  descripcionServicio: string
  precioServicio: number
  monedaServicio: string
}

export interface ClienteBackend {
  _id: string
  ci: string
  nombre: string
  apellidos: string
  telefono: string
  direccion?: string
}

export interface CitaBackend {
  _id: string
  cliente: string
  servicio: string
  fecha: string
}

export interface HorarioBackend {
  days: string
  hours: string
}

export interface ConfiguracionBackend {
  _id?: string
  name: string
  address: string
  telephone: string
  email: string
  whatsapp: string
  whatsappUrl: string
  facebook: string
  instagram: string
  schedule: HorarioBackend[]
}

export async function getServicios(): Promise<ServicioBackend[]> {
  const { data } = await api.get<ServicioBackend[]>('/servicios')
  return data
}

export async function getClientes(): Promise<ClienteBackend[]> {
  const { data } = await api.get<ClienteBackend[]>('/cliente')
  return data
}

export async function getCitas(): Promise<CitaBackend[]> {
  const { data } = await api.get<CitaBackend[]>('/cita')
  return data
}

export async function getConfiguracion(): Promise<ConfiguracionBackend> {
  const { data } = await api.get<ConfiguracionBackend>('/configuracion')
  return data
}

export async function updateConfiguracion(
  config: Partial<ConfiguracionBackend>,
): Promise<ConfiguracionBackend> {
  const { data } = await api.patch<ConfiguracionBackend>('/configuracion', config)
  return data
}
