import type { Vista } from '../types'
import { CLINIC } from '../config'

export default function Footer({ setVista }: { setVista: (v: Vista) => void }) {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="brand-logo">🦷</span> {CLINIC.name}
      </div>
      <div className="footer-links">
        <button onClick={() => setVista('servicios')}>Servicios</button>
        <button onClick={() => setVista('citas')}>Agenda tu cita</button>
        <button onClick={() => setVista('contactenos')}>Contáctenos</button>
      </div>
      <p className="footer-note">© {new Date().getFullYear()} {CLINIC.name}. Todos los derechos reservados.</p>
    </footer>
  )
}
