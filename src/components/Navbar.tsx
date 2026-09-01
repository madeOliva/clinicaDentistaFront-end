import type { Vista } from '../types'
import { CLINIC } from '../config'

interface NavbarProps {
  vista: Vista
  setVista: (v: Vista) => void
}

const enlaces: { key: Vista; label: string }[] = [
  { key: 'home', label: 'Inicio' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'citas', label: 'Citas' },
  { key: 'contactenos', label: 'Contáctenos' },
  { key: 'administrador', label: 'Administrador' },
]

export default function Navbar({ vista, setVista }: NavbarProps) {
  return (
    <header className="navbar">
      <button className="brand" onClick={() => setVista('home')}>
        <span className="brand-logo">🦷</span>
        <span className="brand-name">{CLINIC.name}</span>
      </button>
      <nav className="nav-links">
        {enlaces.map((e) => (
          <button
            key={e.key}
            className={`nav-link ${vista === e.key ? 'active' : ''}`}
            onClick={() => setVista(e.key)}
          >
            {e.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
