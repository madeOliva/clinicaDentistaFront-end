import { useState, useEffect } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { useServicios } from '../data'
import { useContacto } from '../contactConfig'
import type { Servicio } from '../types'
import type { ContactoConfig, HorarioItem } from '../contactConfig'

const formVacio = { nombre: '', descripcion: '', precio: '', moneda: 'USD' }

const LOGIN_STORAGE_KEY = 'clinica-sonrisa-admin-login'
const USUARIO = 'alex'
const CONTRASEÑA = '1234'

const OPCIONES_MENU = [
  { id: 'dashboard', label: 'Dashboard', icono: 'home' },
  { id: 'servicios', label: 'Servicios', icono: 'servicios' },
  { id: 'clientes', label: 'Clientes', icono: 'clientes' },
  { id: 'citas', label: 'Citas', icono: 'citas' },
  { id: 'entrada', label: 'Productos Entrada', icono: 'entrada' },
  { id: 'stock', label: 'Stock', icono: 'stock' },
] as const

const OPCIONES_SECUNDARIAS = [{ id: 'configuracion', label: 'Configuración', icono: 'config' }] as const

type Seccion = (typeof OPCIONES_MENU)[number]['id'] | (typeof OPCIONES_SECUNDARIAS)[number]['id']

type NombreIcono = 'home' | 'servicios' | 'clientes' | 'citas' | 'entrada' | 'stock' | 'config' | 'logout'

function Icono({ nombre, size = 18 }: { nombre: NombreIcono; size?: number }) {
  const caminos: Record<NombreIcono, ReactElement> = {
    home: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    servicios: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
    clientes: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    citas: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    entrada: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    ),
    stock: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    ),
    config: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {caminos[nombre]}
    </svg>
  )
}

type EstadoOrden = 'Delivered' | 'Processing' | 'Shipped'

interface OrdenEjemplo {
  id: number
  cliente: string
  servicio: string
  fecha: string
  monto: number
  estado: EstadoOrden
}

const ESTADOS_ORDEN: EstadoOrden[] = ['Delivered', 'Processing', 'Shipped']

const CLIENTES_ORDEN: [string, string][] = [
  ['María', 'López'], ['Carlos', 'Pérez'], ['Ana', 'García'], ['Luis', 'Martínez'],
  ['Laura', 'Hernández'], ['Pedro', 'González'], ['Sofía', 'Ramírez'], ['Jorge', 'Torres'],
  ['Lucía', 'Flores'], ['Andrés', 'Rivera'], ['Valentina', 'Castro'], ['Diego', 'Vargas'],
  ['Camila', 'Rojas'], ['Miguel', 'Silva'], ['Fernanda', 'Molina'], ['Ricardo', 'Salas'],
  ['Gabriela', 'Ortiz'], ['Sebastián', 'Mendoza'], ['Daniela', 'Navarro'], ['Felipe', 'Aguilar'],
  ['Carolina', 'Peña'], ['Martín', 'Reyes'], ['Isabella', 'Vega'], ['Tomás', 'Cabrera'],
  ['Antonella', 'Delgado'], ['Emilio', 'Campos'], ['Regina', 'Núñez'], ['Nicolás', 'Fuentes'],
]

const SERVICIOS_PRECIO: { nombre: string; precio: number }[] = [
  { nombre: 'Blanqueamiento dental', precio: 20 },
  { nombre: 'Limpieza dental', precio: 30 },
  { nombre: 'Extracción dental', precio: 25 },
  { nombre: 'Relleno / Empaste', precio: 35 },
  { nombre: 'Ortodoncia / Brackets', precio: 300 },
  { nombre: 'Consulta general', precio: 15 },
]

const ORDENES_EJEMPLO: OrdenEjemplo[] = CLIENTES_ORDEN.map(([nombre, apellidos], i) => {
  const servicio = SERVICIOS_PRECIO[i % SERVICIOS_PRECIO.length]
  return {
    id: 1000 + i,
    cliente: `${nombre} ${apellidos}`,
    servicio: servicio.nombre,
    fecha: `2026-09-${String((i % 20) + 1).padStart(2, '0')}`,
    monto: servicio.precio,
    estado: ESTADOS_ORDEN[i % ESTADOS_ORDEN.length],
  }
})

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function Calendario() {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = hoy.getMonth()
  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const fechasConCita = new Set(ORDENES_EJEMPLO.map((o) => o.fecha))

  const celdas: (number | null)[] = Array(primerDia).fill(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  return (
    <div className="calendario">
      <div className="calendario-titulo">
        {MESES[mes]} {anio}
      </div>
      <div className="calendario-semana">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="cal-semana-dia">
            {d}
          </span>
        ))}
      </div>
      <div className="calendario-dias">
        {celdas.map((d, i) => {
          if (d === null) {
            return <span key={`vacio-${i}`} className="cal-dia vacio" />
          }
          const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const tieneCita = fechasConCita.has(fecha)
          const esHoy = d === hoy.getDate()
          return (
            <span
              key={d}
              className={`cal-dia ${esHoy ? 'hoy' : ''} ${tieneCita ? 'con-cita' : ''}`}
              title={tieneCita ? 'Tiene citas' : undefined}
            >
              {d}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function GraficoCitas() {
  const datos = SERVICIOS_PRECIO.map((s) => ({
    nombre: s.nombre,
    cantidad: ORDENES_EJEMPLO.filter((o) => o.servicio === s.nombre).length,
  }))
  const maximo = Math.max(...datos.map((d) => d.cantidad), 1)

  return (
    <div className="grafico-barras">
      {datos.map((d) => (
        <div className="barra-fila" key={d.nombre}>
          <span className="barra-label" title={d.nombre}>
            {d.nombre}
          </span>
          <div className="barra-track">
            <div className="barra-valor" style={{ width: `${(d.cantidad / maximo) * 100}%` }} />
          </div>
          <span className="barra-cantidad">{d.cantidad}</span>
        </div>
      ))}
    </div>
  )
}

export default function Administrador({ onVolverAlSitio }: { onVolverAlSitio?: () => void }) {
  const { servicios, agregarServicio, modificarServicio, eliminarServicio } = useServicios()
  const [form, setForm] = useState(formVacio)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [formEdit, setFormEdit] = useState(formVacio)
  const [autenticado, setAutenticado] = useState(() => localStorage.getItem(LOGIN_STORAGE_KEY) === 'true')
  const [login, setLogin] = useState({ usuario: '', contraseña: '' })
  const [errorLogin, setErrorLogin] = useState('')
  const [seccion, setSeccion] = useState<Seccion>('dashboard')

  const { contacto, actualizarContacto, restablecerContacto } = useContacto()
  const [formContacto, setFormContacto] = useState<ContactoConfig>(contacto)
  const [guardadoContacto, setGuardadoContacto] = useState(false)

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
    setSeccion('dashboard')
  }

  if (!autenticado) {
    return (
      <section className="page administrador login-page">
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
            {onVolverAlSitio && (
              <button type="button" className="btn btn-outline" onClick={onVolverAlSitio}>
                ← Volver al sitio
              </button>
            )}
          </div>
        </form>
      </section>
    )
  }

  function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    const precio = Number(form.precio)
    if (!form.nombre || Number.isNaN(precio) || precio < 0) return

    agregarServicio({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio,
      moneda: form.moneda || 'USD',
    })
    setForm(formVacio)
    setMostrarFormulario(false)
  }

  function abrirEditar(s: Servicio) {
    setEditando(s)
    setFormEdit({ nombre: s.nombre, descripcion: s.descripcion, precio: String(s.precio), moneda: s.moneda })
  }

  function guardarEdicion(e: FormEvent) {
    e.preventDefault()
    if (!editando) return
    const precio = Number(formEdit.precio)
    if (!formEdit.nombre || Number.isNaN(precio) || precio < 0) return

    modificarServicio({
      ...editando,
      nombre: formEdit.nombre,
      descripcion: formEdit.descripcion,
      precio,
      moneda: formEdit.moneda,
    })
    setEditando(null)
    setFormEdit(formVacio)
  }

  function cancelar() {
    setEditando(null)
    setFormEdit(formVacio)
  }

  useEffect(() => {
    if (seccion === 'configuracion') {
      setFormContacto(contacto)
      setGuardadoContacto(false)
    }
  }, [seccion, contacto])

  function cambiarCampoContacto(campo: keyof ContactoConfig, valor: string) {
    setFormContacto((prev) => ({ ...prev, [campo]: valor }))
  }

  function cambiarHorario(index: number, campo: keyof HorarioItem, valor: string) {
    setFormContacto((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
    }))
  }

  function agregarHorario() {
    setFormContacto((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { days: '', hours: '' }],
    }))
  }

  function eliminarHorario(index: number) {
    setFormContacto((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }))
  }

  function guardarContacto(e: FormEvent) {
    e.preventDefault()
    const horarioLimpio = formContacto.schedule
      .map((item) => ({ days: item.days.trim(), hours: item.hours.trim() }))
      .filter((item) => item.days || item.hours)
    actualizarContacto({ ...formContacto, schedule: horarioLimpio })
    setGuardadoContacto(true)
  }

  function renderSeccion() {
    switch (seccion) {
      case 'dashboard':
        return (
          <div className="admin-seccion dashboard-seccion">
            <div className="resumen-tarjetas">
              <div className="resumen-card">
                <span className="resumen-label">Total de servicios</span>
                <span className="resumen-valor">{servicios.length}</span>
              </div>
              <div className="resumen-card">
                <span className="resumen-label">Total de clientes</span>
                <span className="resumen-valor">{CLIENTES_ORDEN.length}</span>
              </div>
              <div className="resumen-card">
                <span className="resumen-label">Total de citas</span>
                <span className="resumen-valor">{ORDENES_EJEMPLO.length}</span>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="panel panel-calendario">
                <h3 className="panel-titulo">Calendario de citas</h3>
                <Calendario />
              </div>
              <div className="panel panel-grafico">
                <h3 className="panel-titulo">Citas por servicio</h3>
                <GraficoCitas />
              </div>
            </div>
          </div>
        )

      case 'servicios':
        return (
          <div className="admin-seccion">
            <div className="admin-section-header">
              <div>
                <h2>Servicios</h2>
                <p className="page-subtitle">Administra los servicios que se muestran en la vista de servicios.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                {mostrarFormulario ? 'Cerrar formulario' : '+ Agregar servicio'}
              </button>
            </div>

            {mostrarFormulario && (
              <form className="servicio-form" onSubmit={manejarEnvio}>
                <h2>Agregar servicio</h2>

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
                    Agregar servicio
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => { setMostrarFormulario(false); setForm(formVacio) }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

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
                        <button className="btn btn-small btn-outline" onClick={() => abrirEditar(s)}>
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

            {editando && (
              <div className="modal-overlay" onClick={cancelar}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Modificar servicio</h2>
                    <button className="modal-close" onClick={cancelar}>
                      ✕
                    </button>
                  </div>

                  <form onSubmit={guardarEdicion}>
                    <div className="campo">
                      <label htmlFor="edit-nombre">Nombre del servicio</label>
                      <input
                        id="edit-nombre"
                        type="text"
                        required
                        value={formEdit.nombre}
                        onChange={(e) => setFormEdit({ ...formEdit, nombre: e.target.value })}
                        placeholder="Ej. Blanqueamiento dental"
                      />
                    </div>

                    <div className="campo">
                      <label htmlFor="edit-desc">Descripción</label>
                      <textarea
                        id="edit-desc"
                        value={formEdit.descripcion}
                        onChange={(e) => setFormEdit({ ...formEdit, descripcion: e.target.value })}
                        placeholder="Breve descripción del servicio"
                      />
                    </div>

                    <div className="campo-row">
                      <div className="campo">
                        <label htmlFor="edit-precio">Precio</label>
                        <input
                          id="edit-precio"
                          type="number"
                          required
                          min={0}
                          step="0.01"
                          value={formEdit.precio}
                          onChange={(e) => setFormEdit({ ...formEdit, precio: e.target.value })}
                          placeholder="20"
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="edit-moneda">Moneda</label>
                        <select
                          id="edit-moneda"
                          value={formEdit.moneda}
                          onChange={(e) => setFormEdit({ ...formEdit, moneda: e.target.value })}
                        >
                          <option value="USD">USD</option>
                          <option value="C$">C$</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-buttons">
                      <button type="submit" className="btn btn-primary">
                        Guardar cambios
                      </button>
                      <button type="button" className="btn btn-outline" onClick={cancelar}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )

      case 'clientes':
        return (
          <div className="admin-seccion">
            <header className="orders-header">
              <h2 className="orders-subtitle">Clientes</h2>
            </header>
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Última cita</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="table-empty" colSpan={6}>
                      No hay clientes registrados.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'citas':
        return (
          <div className="admin-seccion">
            <header className="orders-header">
              <h2 className="orders-subtitle">Citas</h2>
              <div className="filter-tabs">
                <button className="filter-tab active" type="button">
                  Allorders
                </button>
              </div>
            </header>
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="table-empty" colSpan={6}>
                      No hay citas registradas.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'entrada':
        return (
          <div className="admin-seccion">
            <div className="admin-section-header">
              <div>
                <h2>Productos Entrada</h2>
                <p className="page-subtitle">Registra las entradas de productos al inventario.</p>
              </div>
            </div>
            <div className="empty-box">
              <p className="empty">No hay entradas registradas todavía.</p>
            </div>
          </div>
        )

      case 'stock':
        return (
          <div className="admin-seccion">
            <div className="admin-section-header">
              <div>
                <h2>Stock</h2>
                <p className="page-subtitle">Controla el inventario de productos.</p>
              </div>
            </div>
            <div className="empty-box">
              <p className="empty">No hay productos registrados.</p>
            </div>
          </div>
        )

      case 'configuracion':
        return (
          <div className="admin-seccion admin-config-seccion">
            <h2>Configuración</h2>
            <p className="page-subtitle">
              Modifica la información que se muestra en Contáctenos. Los cambios se guardan y se
              aplican en todo el sitio.
            </p>

            {guardadoContacto && (
              <div className="success-box">
                ✅ Cambios guardados correctamente. Ya se reflejan en Contáctenos.
              </div>
            )}

            <form className="servicio-form admin-config-form" onSubmit={guardarContacto}>
              <div className="campo">
                <label htmlFor="c-nombre">Nombre de la clínica</label>
                <input
                  id="c-nombre"
                  type="text"
                  value={formContacto.name}
                  onChange={(e) => cambiarCampoContacto('name', e.target.value)}
                />
              </div>

              <div className="campo">
                <label htmlFor="c-direccion">Dirección</label>
                <input
                  id="c-direccion"
                  type="text"
                  value={formContacto.address}
                  onChange={(e) => cambiarCampoContacto('address', e.target.value)}
                  placeholder="Ej. Av. Principal #123, Sector El Centro, Ciudad"
                />
              </div>

              <div className="campo-row">
                <div className="campo">
                  <label htmlFor="c-telefono">Teléfono</label>
                  <input
                    id="c-telefono"
                    type="text"
                    value={formContacto.telephone}
                    onChange={(e) => cambiarCampoContacto('telephone', e.target.value)}
                    placeholder="Ej. +53 55912936"
                  />
                </div>
                <div className="campo">
                  <label htmlFor="c-correo">Correo electrónico</label>
                  <input
                    id="c-correo"
                    type="email"
                    value={formContacto.email}
                    onChange={(e) => cambiarCampoContacto('email', e.target.value)}
                    placeholder="Ej. contacto@clinica.com"
                  />
                </div>
              </div>

              <div className="campo">
                <label htmlFor="c-whatsapp">Número de WhatsApp</label>
                <input
                  id="c-whatsapp"
                  type="text"
                  value={formContacto.whatsapp}
                  onChange={(e) => cambiarCampoContacto('whatsapp', e.target.value)}
                  placeholder="Ej. 55912936 (solo número)"
                />
              </div>

              <div className="campo">
                <label htmlFor="c-whatsapp-url">Link de WhatsApp</label>
                <input
                  id="c-whatsapp-url"
                  type="url"
                  value={formContacto.whatsappUrl}
                  onChange={(e) => cambiarCampoContacto('whatsappUrl', e.target.value)}
                  placeholder="https://wa.me/55912936?text=..."
                />
              </div>

              <div className="campo-row">
                <div className="campo">
                  <label htmlFor="c-facebook">Link de Facebook</label>
                  <input
                    id="c-facebook"
                    type="url"
                    value={formContacto.facebook}
                    onChange={(e) => cambiarCampoContacto('facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="campo">
                  <label htmlFor="c-instagram">Link de Instagram</label>
                  <input
                    id="c-instagram"
                    type="url"
                    value={formContacto.instagram}
                    onChange={(e) => cambiarCampoContacto('instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div className="campo">
                <span className="campo-label">Horario de atención</span>
                {formContacto.schedule.length === 0 && (
                  <p className="empty">No hay horarios registrados.</p>
                )}
                <div className="horario-lista">
                  {formContacto.schedule.map((item, i) => (
                    <div key={`${item.days}-${i}`} className="horario-fila">
                      <input
                        type="text"
                        value={item.days}
                        onChange={(e) => cambiarHorario(i, 'days', e.target.value)}
                        placeholder="Días (ej. Lunes a Viernes)"
                      />
                      <input
                        type="text"
                        value={item.hours}
                        onChange={(e) => cambiarHorario(i, 'hours', e.target.value)}
                        placeholder="Horas (ej. 8:00 AM – 6:00 PM)"
                      />
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => eliminarHorario(i)}
                        aria-label={`Eliminar horario ${i + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-small btn-outline" onClick={agregarHorario}>
                  + Agregar horario
                </button>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    restablecerContacto()
                    setFormContacto(contacto)
                    setGuardadoContacto(false)
                  }}
                >
                  Restablecer valores
                </button>
              </div>
            </form>
          </div>
        )
    }
  }

  return (
    <section className="page administrador">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <span className="brand-logo">▤</span>
            <span className="brand-name">eProduct</span>
          </div>

          <nav className="sidebar-menu">
            {OPCIONES_MENU.map((opcion) => (
              <button
                key={opcion.id}
                className={`sidebar-link ${seccion === opcion.id ? 'active' : ''}`}
                onClick={() => setSeccion(opcion.id)}
              >
                <Icono nombre={opcion.icono} />
                {opcion.label}
              </button>
            ))}

            <div className="sidebar-divider" />

            {OPCIONES_SECUNDARIAS.map((opcion) => (
              <button
                key={opcion.id}
                className={`sidebar-link ${seccion === opcion.id ? 'active' : ''}`}
                onClick={() => setSeccion(opcion.id)}
              >
                <Icono nombre={opcion.icono} />
                {opcion.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="admin-user">
              <span className="admin-avatar">HM</span>
              <span className="admin-user-info">
                <span className="admin-user-name">hesanmoin</span>
                <span className="admin-user-cargo">Administrador</span>
              </span>
              <button className="sidebar-logout" onClick={cerrarSesion} title="Cerrar sesión">
                <Icono nombre="logout" size={20} />
              </button>
            </div>
          </div>
        </aside>

        <div className="admin-contenido">{renderSeccion()}</div>
      </div>
    </section>
  )
}