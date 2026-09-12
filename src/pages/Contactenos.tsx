import { useEffect, useState } from 'react'
import { useContacto, whatsappLink } from '../contactConfig'
import { getConfiguracion } from '../api'
import type { ContactoConfig } from '../contactConfig'

export default function Contactenos() {
  const { contacto } = useContacto()
  const [configuracionBackend, setConfiguracionBackend] = useState<ContactoConfig | null>(null)

  useEffect(() => {
    let activo = true

    getConfiguracion()
      .then((cfg) => {
        if (!activo) return
        setConfiguracionBackend({
          name: cfg.name ?? '',
          address: cfg.address ?? '',
          telephone: cfg.telephone ?? '',
          email: cfg.email ?? '',
          schedule: (cfg.schedule ?? []).map((s) => ({ days: s.days ?? '', hours: s.hours ?? '' })),
          facebook: cfg.facebook ?? '',
          instagram: cfg.instagram ?? '',
          whatsapp: cfg.whatsapp ?? '',
          whatsappUrl: cfg.whatsappUrl ?? '',
        })
      })
      .catch(() => {})

    return () => {
      activo = false
    }
  }, [])

  const mostrar = configuracionBackend ?? contacto

  const whatsappHref =
    mostrar.whatsappUrl?.trim() ||
    whatsappLink(mostrar.whatsapp, 'Hola, quiero más información.')

  return (
    <section className="page contactenos">
      <h1>Contáctenos</h1>
      <p className="page-subtitle">Estamos para atenderte. Encuéntranos o escríbenos.</p>

      <div className="contacto-grid">
        <div className="contacto-card">
          <span className="contacto-icon">📍</span>
          <h3>Dirección</h3>
          <p>{mostrar.address}</p>
        </div>

        <div className="contacto-card">
          <span className="contacto-icon">📞</span>
          <h3>Teléfono</h3>
          <p>{mostrar.telephone}</p>
        </div>

        <div className="contacto-card">
          <span className="contacto-icon">📧</span>
          <h3>Correo</h3>
          <p>{mostrar.email}</p>
        </div>

        <div className="contacto-card">
          <span className="contacto-icon">🕐</span>
          <h3>Horario de atención</h3>
          <ul className="schedule-list">
            {mostrar.schedule.map((item) => (
              <li key={item.days}>
                <span className="schedule-days">{item.days}</span>
                <span className="schedule-hours">{item.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="redes">
        <h2>Síguenos en redes</h2>
        <div className="redes-links">
          <a className="btn btn-red" href={mostrar.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a className="btn btn-red" href={mostrar.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a
            className="btn btn-red"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}