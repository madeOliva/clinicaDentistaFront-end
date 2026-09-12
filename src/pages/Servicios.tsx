import { useEffect, useState } from 'react'
import { useServicios } from '../data'
import { getServicios, getMonedas } from '../api'
import type { Servicio } from '../types'

export default function Servicios({ onReservar }: { onReservar: (nombre: string) => void }) {
  const { servicios } = useServicios()
  const [backendServicios, setBackendServicios] = useState<Servicio[] | null>(null)
  const [error, setError] = useState('')
  const [reintentos, setReintentos] = useState(0)

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const [serviciosBackend, monedas] = await Promise.all([getServicios(), getMonedas()])
        const monedaPorId = new Map(monedas.map((m) => [m._id, m.tipoMoneda]))
        if (!activo) return
        setBackendServicios(
          serviciosBackend.map((s) => ({
            id: s._id,
            nombre: s.nombreServicio,
            descripcion: s.descripcionServicio,
            precio: s.precioServicio,
            moneda: monedaPorId.get(s.monedaServicio) ?? '',
          })),
        )
        setError('')
      } catch {
        if (activo) setError('No se pudo conectar con el backend.')
      }
    }

    cargar()
    return () => {
      activo = false
    }
  }, [reintentos])

  const mostrar = backendServicios ?? servicios

  return (
    <section className="page servicios">
      <h1>Nuestros Servicios</h1>
      <p className="page-subtitle">Conoce los servicios que ofrecemos con sus precios.</p>

      {backendServicios === null && !error && (
        <p className="empty">
          {mostrar.length === 0 ? 'Cargando servicios...' : 'Cargando servicios desde el servidor...'}
        </p>
      )}

      {error && (
        <div className="login-error" role="alert">
          {error}{' '}
          <button
            type="button"
            className="btn btn-small btn-outline"
            onClick={() => setReintentos((r) => r + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {mostrar.length === 0 && backendServicios !== null && !error && (
        <p className="empty">No hay servicios registrados.</p>
      )}

      {mostrar.length > 0 && (
        <div className="servicios-grid">
          {mostrar.map((s) => (
            <article key={s.id} className="servicio-card">
              <h3>{s.nombre}</h3>
              <p>{s.descripcion}</p>
              <div className="servicio-footer">
                <span className="precio">
                  {s.moneda} {s.precio}
                </span>
                <button className="btn btn-primary" onClick={() => onReservar(s.nombre)}>
                  Reservar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}