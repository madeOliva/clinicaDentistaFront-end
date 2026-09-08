import { useContacto, whatsappLink } from '../contactConfig'

export default function Contactenos() {
  const { contacto } = useContacto()

  const whatsappHref =
    contacto.whatsappUrl?.trim() ||
    whatsappLink(contacto.whatsapp, 'Hola, quiero más información.')

  return (
    <section className="page contactenos">
      <h1>Contáctenos</h1>
      <p className="page-subtitle">Estamos para atenderte. Encuéntranos o escríbenos.</p>

      <div className="contacto-grid">
        <div className="contacto-card">
          <span className="contacto-icon">📍</span>
          <h3>Dirección</h3>
          <p>{contacto.address}</p>
        </div>

        <div className="contacto-card">
          <span className="contacto-icon">📞</span>
          <h3>Teléfono</h3>
          <p>{contacto.telephone}</p>
        </div>

        <div className="contacto-card">
          <span className="contacto-icon">📧</span>
          <h3>Correo</h3>
          <p>{contacto.email}</p>
        </div>

        <div className="contacto-card">
          <span className="contacto-icon">🕐</span>
          <h3>Horario de atención</h3>
          <ul className="schedule-list">
            {contacto.schedule.map((item) => (
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
          <a className="btn btn-red" href={contacto.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a className="btn btn-red" href={contacto.instagram} target="_blank" rel="noreferrer">
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