import toothImg from '../pictures/tooth.png'
import brushImg from '../pictures/brush-teeth.png'
import smileImg from '../pictures/smile (1).png'
import dentistImg from '../pictures/dentist.png'
import type { Vista } from '../types'
import { useContacto } from '../contactConfig'

export default function Home({ setVista }: { setVista: (v: Vista) => void }) {
  const { contacto } = useContacto()
  return (
    <section className="page home">
      <div className="hero">
        <div className="hero-icon">
          <img className="icono-imagen" src={toothImg} alt="" />
        </div>
        <h1>Bienvenido a {contacto.name}</h1>
        <p className="hero-subtitle">
          Tu sonrisa es nuestra prioridad. Somos una clínica dental dedicada a brindarte una
          atención de calidad, con tecnología moderna y un equipo de profesionales que te
          acompañará en cada paso.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setVista('citas')}>
            Agendar cita
          </button>
          <button className="btn btn-outline" onClick={() => setVista('servicios')}>
            Ver servicios
          </button>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <span className="feature-icon">
            <img className="icono-imagen" src={brushImg} alt="" />
          </span>
          <h3>Cuidado preventivo</h3>
          <p>Limpiezas y chequeos regulares para mantener tu salud bucal.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">
            <img className="icono-imagen" src={smileImg} alt="" />
          </span>
          <h3>Sonrisa perfecta</h3>
          <p>Blanqueamiento y estética dental para que luzcas mejor.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">
            <img className="icono-imagen" src={dentistImg} alt="" />
          </span>
          <h3>Especialistas</h3>
          <p>Profesionales certificados y con amplia experiencia.</p>
        </div>
      </div>
    </section>
  )
}