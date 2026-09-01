import { useServicios } from '../data'

export default function Servicios({ onReservar }: { onReservar: (nombre: string) => void }) {
  const { servicios } = useServicios()

  return (
    <section className="page servicios">
      <h1>Nuestros Servicios</h1>
      <p className="page-subtitle">Conoce los servicios que ofrecemos con sus precios.</p>

      <div className="servicios-grid">
        {servicios.map((s) => (
          <article key={s.id} className="servicio-card">
            <h3>{s.nombre}</h3>
            <p>{s.descripcion}</p>
            <div className="servicio-footer">
              <span className="precio">{s.moneda} {s.precio}</span>
              <button className="btn btn-primary" onClick={() => onReservar(s.nombre)}>
                Reservar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
