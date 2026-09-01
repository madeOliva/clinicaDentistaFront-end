import { useState } from 'react'
import type { FormEvent } from 'react'
import { useServicios } from '../data'
import type { Servicio } from '../types'

const formVacio = { nombre: '', descripcion: '', precio: '', moneda: 'USD' }

const LOGIN_STORAGE_KEY = 'clinica-sonrisa-admin-login'
const USUARIO = 'alex'
const CONTRASEÑA = '1234'


const Made = '1234'
export default function Administrador() {
  const { servicios, agregarServicio, modificarServicio, eliminarServicio } = useServicios()
  const [form, setForm] = useState(formVacio)
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [autenticado, setAutenticado] = useState(() => localStorage.getItem(LOGIN_STORAGE_KEY) === 'true')
  const [login, setLogin] = useState({ usuario: '', contraseña: '' })
  const [errorLogin, setErrorLogin] = useState('')

  function manejarLogin(e: FormEvent) {
    e.preventDefault()
    if (login.usuario === USUARIO && login.contraseña === CONTRASEÑA) {
      localStorage.setItem(LOGIN_STORAGE_KEY, 'true')
      setAutenticado(true)
      setErrorLogin('')
      setLogin({ usuario: '', contraseña: '' })
    } else {
      setErrorLogin('Usuario o contraseña incorrectos.')
    }
  }

  function cerrarSesion() {
    localStorage.removeItem(LOGIN_STORAGE_KEY)
    setAutenticado(false)
  }

  if (!autenticado) {
    return (
      <section className="page administrador">
        <h1>Administrador</h1>
        <p className="page-subtitle">Inicia sesión para acceder a la administración.</p>

        <form className="servicio-form login-form" onSubmit={manejarLogin}>
          <h2>Iniciar sesión</h2>

          <div className="campo">
            <label htmlFor="login-usuario">Usuario</label>
            <input
              id="login-usuario"
              type="text"
              value={login.usuario}
              onChange={(e) => setLogin({ ...login, usuario: e.target.value })}
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div className="campo">
            <label htmlFor="login-contraseña">Contraseña</label>
            <input
              id="login-contraseña"
              type="password"
              value={login.contraseña}
              onChange={(e) => setLogin({ ...login, contraseña: e.target.value })}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {errorLogin && <p className="login-error">{errorLogin}</p>}

          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              Entrar
            </button>
          </div>
        </form>
      </section>
    )
  }

  function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    const precio = Number(form.precio)
    if (!form.nombre || Number.isNaN(precio) || precio < 0) return

    if (editando) {
      modificarServicio({
        ...editando,
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio,
        moneda: form.moneda,
      })
      setEditando(null)
    } else {
      agregarServicio({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio,
        moneda: form.moneda || 'USD',
      })
    }
    setForm(formVacio)
  }

  function editar(s: Servicio) {
    setEditando(s)
    setForm({ nombre: s.nombre, descripcion: s.descripcion, precio: String(s.precio), moneda: s.moneda })
  }

  function cancelar() {
    setEditando(null)
    setForm(formVacio)
  }

  return (
    <section className="page administrador">
      <h1>Administrador</h1>
      <p className="page-subtitle">Administra los servicios que se muestran en la vista de servicios.</p>

      <form className="servicio-form" onSubmit={manejarEnvio}>
        <h2>{editando ? 'Modificar servicio' : 'Agregar servicio'}</h2>

        <div className="campo">
          <label htmlFor="s-nombre">Nombre del servicio</label>
          <input
            id="s-nombre"
            type="text"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Blanqueamiento dental"
          />
        </div>

        <div className="campo">
          <label htmlFor="s-desc">Descripción</label>
          <textarea
            id="s-desc"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Breve descripción del servicio"
          />
        </div>

        <div className="campo-row">
          <div className="campo">
            <label htmlFor="s-precio">Precio</label>
            <input
              id="s-precio"
              type="number"
              required
              min={0}
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              placeholder="20"
            />
          </div>
          <div className="campo">
            <label htmlFor="s-moneda">Moneda</label>
            <select
              id="s-moneda"
              value={form.moneda}
              onChange={(e) => setForm({ ...form, moneda: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="C$">C$</option>
            </select>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">
            {editando ? 'Guardar cambios' : 'Agregar servicio'}
          </button>
          {editando && (
            <button type="button" className="btn btn-outline" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="lista-servicios">
        <h2>Servicios actuales</h2>
        {servicios.length === 0 ? (
          <p className="empty">No hay servicios registrados.</p>
        ) : (
          <ul>
            {servicios.map((s) => (
              <li key={s.id} className="servicio-item">
                <div className="servicio-info">
                  <strong>{s.nombre}</strong>
                  <span className="servicio-desc">{s.descripcion}</span>
                  <span className="precio">
                    {s.moneda} {s.precio}
                  </span>
                </div>
                <div className="servicio-acciones">
                  <button className="btn btn-small btn-outline" onClick={() => editar(s)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => eliminarServicio(s.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
