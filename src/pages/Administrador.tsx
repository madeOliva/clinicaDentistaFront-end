import { useState, useEffect } from 'react'
import type { FormEvent, ReactElement } from 'react'
import fondoLogin from '../pictures/Fondo.jpeg'
import iconob from '../pictures/iconob.png'
import { useContacto, VALORES_INICIALES } from '../contactConfig'
import CalendarioCitas from '../components/CalendarioCitas'
import {
  getServicios,
  getMonedas,
  getClientes,
  getCitas,
  createServicio,
  updateServicio,
  deleteServicio,
  getDiasInhabilitados,
  crearDiaInhabilitado,
  eliminarDiaInhabilitado,
  createCliente,
  crearCita,
  deleteCliente,
  deleteCita,
} from '../api'
import type { Servicio } from '../types'
import type { ContactoConfig, HorarioItem } from '../contactConfig'
import type {
  CitaBackend,
  ClienteBackend,
  DiaInhabilitadoBackend,
  MonedaBackend,
  ServicioBackend,
} from '../api'

const formVacio = { nombre: '', descripcion: '', precio: '', moneda: '', disponible: true }
const clienteVacio = { ci: '', nombre: '', apellidos: '', telefono: '', direccion: '' }
const citaVacio = { cliente: '', servicio: '', fecha: '' }

interface ModalResultado {
  tipo: 'exito' | 'error'
  titulo: string
  mensaje: string
}

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

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

function GraficoCitas({ datos }: { datos: { nombre: string; cantidad: number }[] }) {
  const POR_PAGINA = 5
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.max(1, Math.ceil(datos.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaSegura * POR_PAGINA
  const visibles = datos.slice(inicio, inicio + POR_PAGINA)
  const maximo = Math.max(...datos.map((d) => d.cantidad), 1)

  return (
    <div className="grafico-barras">
      {visibles.map((d) => (
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

      {datos.length > POR_PAGINA && (
        <div className="grafico-paginacion">
          <button
            type="button"
            className="btn btn-small btn-outline"
            disabled={paginaSegura === 0}
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            aria-label="Anterior"
          >
            ←
          </button>
          <span className="grafico-pagina-info">
            {inicio + 1}–{Math.min(inicio + POR_PAGINA, datos.length)} de {datos.length}
          </span>
          <button
            type="button"
            className="btn btn-small btn-outline"
            disabled={paginaSegura >= totalPaginas - 1}
            onClick={() => setPagina((p) => p + 1)}
            aria-label="Siguiente"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}

export default function Administrador({ onVolverAlSitio }: { onVolverAlSitio?: () => void }) {
  const [form, setForm] = useState(formVacio)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null)
  const [clienteAEliminar, setClienteAEliminar] = useState<ClienteBackend | null>(null)
  const [citaAEliminar, setCitaAEliminar] = useState<CitaBackend | null>(null)
  const [formEdit, setFormEdit] = useState(formVacio)
  const [formCliente, setFormCliente] = useState(clienteVacio)
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false)
  const [guardandoCliente, setGuardandoCliente] = useState(false)
  const [formCita, setFormCita] = useState(citaVacio)
  const [mostrarFormCita, setMostrarFormCita] = useState(false)
  const [guardandoCita, setGuardandoCita] = useState(false)
  const [autenticado, setAutenticado] = useState(() => localStorage.getItem(LOGIN_STORAGE_KEY) === 'true')
  const [login, setLogin] = useState({ usuario: '', contraseña: '' })
  const [errorLogin, setErrorLogin] = useState('')
  const [seccion, setSeccion] = useState<Seccion>('dashboard')
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [serviciosBackend, setServiciosBackend] = useState<ServicioBackend[]>([])
  const [monedas, setMonedas] = useState<MonedaBackend[]>([])
  const [clientes, setClientes] = useState<ClienteBackend[]>([])
  const [citas, setCitas] = useState<CitaBackend[]>([])
  const [diasInhabilitados, setDiasInhabilitados] = useState<DiaInhabilitadoBackend[]>([])
  const [diaModal, setDiaModal] = useState<{ fecha: string; inhabilitado: boolean } | null>(null)
  const [guardandoDia, setGuardandoDia] = useState(false)
  const [datosCargados, setDatosCargados] = useState(false)
  const [cargandoDashboard, setCargandoDashboard] = useState(false)
  const [errorDashboard, setErrorDashboard] = useState('')
  const [revisionDashboard, setRevisionDashboard] = useState(0)

  const { contacto, actualizarContacto, restablecerContacto } = useContacto()
  const [formContacto, setFormContacto] = useState<ContactoConfig>(contacto)
  const [editandoConfig, setEditandoConfig] = useState(false)
  const [guardandoConfig, setGuardandoConfig] = useState(false)
  const [modalConfig, setModalConfig] = useState<ModalResultado | null>(null)

  const fechasInhabilitadas = new Set(diasInhabilitados.map((d) => d.fecha.slice(0, 10)))

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

  function abrirModalDia(fecha: string) {
    setDiaModal({ fecha, inhabilitado: fechasInhabilitadas.has(fecha) })
  }

  async function confirmarModalDia() {
    if (!diaModal) return
    setGuardandoDia(true)
    try {
      if (diaModal.inhabilitado) {
        const ids = diasInhabilitados
          .filter((d) => d.fecha.slice(0, 10) === diaModal.fecha)
          .map((d) => d._id)
        for (const id of ids) await eliminarDiaInhabilitado(id)
      } else {
        await crearDiaInhabilitado(diaModal.fecha)
      }
      const data = await getDiasInhabilitados()
      setDiasInhabilitados(data)
      setDiaModal(null)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'No se pudo actualizar el día',
        mensaje: 'No se pudo conectar con el backend. Inténtalo de nuevo.',
      })
    } finally {
      setGuardandoDia(false)
    }
  }

  function idMoneda(moneda: string): string | undefined {
    return monedas.find((m) => m.tipoMoneda === moneda)?._id
  }

  async function agregarServicio(s: Omit<Servicio, 'id'>) {
    const monedaServicio = idMoneda(s.moneda)
    if (!monedaServicio) throw new Error('Moneda no válida')
    await createServicio({
      nombreServicio: s.nombre,
      descripcionServicio: s.descripcion,
      precioServicio: s.precio,
      monedaServicio,
      disponible: s.disponible,
    })
  }

  async function modificarServicio(s: Servicio) {
    const monedaServicio = idMoneda(s.moneda)
    if (!monedaServicio) throw new Error('Moneda no válida')
    await updateServicio(s.id, {
      nombreServicio: s.nombre,
      descripcionServicio: s.descripcion,
      precioServicio: s.precio,
      monedaServicio,
      disponible: s.disponible,
    })
  }

  async function eliminarServicio(id: string) {
    await deleteServicio(id)
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    const precio = Number(form.precio)
    if (!form.nombre || Number.isNaN(precio) || precio < 0) return

    try {
      await agregarServicio({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio,
        moneda: form.moneda || monedas[0]?.tipoMoneda || '',
        disponible: form.disponible,
      })
      setForm(formVacio)
      setMostrarFormulario(false)
      setRevisionDashboard((prev) => prev + 1)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'Error al guardar',
        mensaje: 'No se pudo guardar el servicio. Verifica que el backend esté disponible.',
      })
    }
  }

  async function manejarCrearCliente(e: FormEvent) {
    e.preventDefault()
    if (!formCliente.ci.trim() || !formCliente.nombre.trim() || !formCliente.apellidos.trim() || !formCliente.telefono.trim()) return

    setGuardandoCliente(true)
    try {
      await createCliente({
        ci: formCliente.ci.trim(),
        nombre: formCliente.nombre.trim(),
        apellidos: formCliente.apellidos.trim(),
        telefono: formCliente.telefono.trim(),
        direccion: formCliente.direccion.trim() || undefined,
      })
      setFormCliente(clienteVacio)
      setMostrarFormCliente(false)
      setRevisionDashboard((prev) => prev + 1)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'Error al guardar',
        mensaje: 'No se pudo registrar el cliente. Verifica que el backend esté disponible.',
      })
    } finally {
      setGuardandoCliente(false)
    }
  }

  async function manejarCrearCita(e: FormEvent) {
    e.preventDefault()
    if (!formCita.cliente || !formCita.servicio || !formCita.fecha) return

    setGuardandoCita(true)
    try {
      await crearCita({
        cliente: formCita.cliente,
        servicio: formCita.servicio,
        fecha: formCita.fecha,
      })
      setFormCita(citaVacio)
      setMostrarFormCita(false)
      setRevisionDashboard((prev) => prev + 1)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'Error al guardar',
        mensaje: 'No se pudo registrar la cita. Verifica el backend y que el cliente no tenga otra cita en esa fecha.',
      })
    } finally {
      setGuardandoCita(false)
    }
  }

  function abrirEditar(s: Servicio) {
    setEditando(s)
    setFormEdit({
      nombre: s.nombre,
      descripcion: s.descripcion,
      precio: String(s.precio),
      moneda: s.moneda,
      disponible: s.disponible,
    })
  }

  async function guardarEdicion(e: FormEvent) {
    e.preventDefault()
    if (!editando) return
    const precio = Number(formEdit.precio)
    if (!formEdit.nombre || Number.isNaN(precio) || precio < 0) return

    try {
      await modificarServicio({
        ...editando,
        nombre: formEdit.nombre,
        descripcion: formEdit.descripcion,
        precio,
        moneda: formEdit.moneda,
        disponible: formEdit.disponible,
      })
      setEditando(null)
      setFormEdit(formVacio)
      setRevisionDashboard((prev) => prev + 1)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'Error al guardar',
        mensaje: 'No se pudo modificar el servicio. Verifica que el backend esté disponible.',
      })
    }
  }

  async function eliminarServicioClick(id: string) {
    try {
      await eliminarServicio(id)
      setRevisionDashboard((prev) => prev + 1)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'Error al eliminar',
        mensaje: 'No se pudo eliminar el servicio. Verifica que el backend esté disponible.',
      })
    }
  }

  function cancelar() {
    setEditando(null)
    setFormEdit(formVacio)
  }

  function confirmarEliminarServicio() {
    if (!servicioAEliminar) return
    eliminarServicioClick(servicioAEliminar.id)
    setServicioAEliminar(null)
  }

  async function confirmarEliminarCliente() {
    if (!clienteAEliminar) return
    try {
      await deleteCliente(clienteAEliminar._id)
      setClienteAEliminar(null)
      setRevisionDashboard((prev) => prev + 1)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'Error al eliminar',
        mensaje: 'No se pudo eliminar el cliente. Verifica que el backend esté disponible.',
      })
    }
  }

  async function confirmarEliminarCita() {
    if (!citaAEliminar) return
    try {
      await deleteCita(citaAEliminar._id)
      setCitaAEliminar(null)
      setRevisionDashboard((prev) => prev + 1)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'Error al eliminar',
        mensaje: 'No se pudo eliminar la cita. Verifica que el backend esté disponible.',
      })
    }
  }

  useEffect(() => {
    if (seccion === 'configuracion' && !editandoConfig) {
      setFormContacto(contacto)
    }
  }, [seccion, contacto, editandoConfig])

  useEffect(() => {
    if (!autenticado) return
    let activo = true

    async function cargarDatos() {
      try {
        const [serviciosData, monedasData, clientesData, citasData, diasData] = await Promise.all([
          getServicios(),
          getMonedas(),
          getClientes(),
          getCitas(),
          getDiasInhabilitados(),
        ])
        if (!activo) return
        const monedaPorId = new Map(monedasData.map((m) => [m._id, m.tipoMoneda]))
        setMonedas(monedasData)
        setServiciosBackend(serviciosData)
        setServicios(
          serviciosData.map((s) => ({
            id: s._id,
            nombre: s.nombreServicio,
            descripcion: s.descripcionServicio,
            precio: s.precioServicio,
            moneda: monedaPorId.get(s.monedaServicio) ?? '',
            disponible: s.disponible !== false,
          })),
        )
        setClientes(clientesData)
        setCitas(citasData)
        setDiasInhabilitados(diasData)
        setDatosCargados(true)
        setErrorDashboard('')
      } catch {
        if (activo) setErrorDashboard('No se pudo conectar con el backend.')
      } finally {
        if (activo) setCargandoDashboard(false)
      }
    }

    setCargandoDashboard(true)
    cargarDatos()
    const intervalo = setInterval(cargarDatos, 10000)

    return () => {
      activo = false
      clearInterval(intervalo)
    }
  }, [autenticado, revisionDashboard])

  if (!autenticado) {
    return (
      <section
        className="page administrador login-page"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(${fondoLogin})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <h1>Administrador</h1>
        <p className="page-subtitle">Inicia sesión para acceder a la administración.</p>

        <img src={iconob} alt="Icono de la clínica" className="login-icono" />

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

  function cambiarCampoContacto(campo: keyof ContactoConfig, valor: string) {
    setEditandoConfig(true)
    setFormContacto((prev) => ({ ...prev, [campo]: valor }))
  }

  function cambiarHorario(index: number, campo: keyof HorarioItem, valor: string) {
    setEditandoConfig(true)
    setFormContacto((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
    }))
  }

  function agregarHorario() {
    setEditandoConfig(true)
    setFormContacto((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { days: '', hours: '' }],
    }))
  }

  function eliminarHorario(index: number) {
    setEditandoConfig(true)
    setFormContacto((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }))
  }

  async function guardarContacto(e: FormEvent) {
    e.preventDefault()
    const horarioLimpio = formContacto.schedule
      .map((item) => ({ days: item.days.trim(), hours: item.hours.trim() }))
      .filter((item) => item.days || item.hours)
    setGuardandoConfig(true)
    const exito = await actualizarContacto({ ...formContacto, schedule: horarioLimpio })
    setGuardandoConfig(false)
    if (exito) {
      setEditandoConfig(false)
      setModalConfig({
        tipo: 'exito',
        titulo: 'Cambios guardados',
        mensaje: 'La configuración se guardó correctamente.',
      })
    } else {
      setModalConfig({
        tipo: 'error',
        titulo: 'Error al guardar',
        mensaje: 'No se pudo conectar con el backend. Inténtalo de nuevo.',
      })
    }
  }

  function renderSeccion() {
    switch (seccion) {
      case 'dashboard': {
        const fechasConCita = new Set(citas.map((c) => c.fecha.slice(0, 10)))

        const serviciosPorId = new Map(
          serviciosBackend.map((s) => [s._id, s.nombreServicio]),
        )
        const conteoPorServicio = new Map<string, number>()
        for (const cita of citas) {
          const nombreServicio = serviciosPorId.get(cita.servicio)
          if (!nombreServicio) continue
          conteoPorServicio.set(nombreServicio, (conteoPorServicio.get(nombreServicio) ?? 0) + 1)
        }
        const datosGrafico = [...conteoPorServicio.entries()].map(
          ([nombre, cantidad]) => ({ nombre, cantidad }),
        )

        const totalServicios = servicios.length
        const totalClientes = clientes.length
        const totalCitas = citas.length

        return (
          <div className="admin-seccion dashboard-seccion">
            {cargandoDashboard && !datosCargados && (
              <p className="empty">Cargando datos del panel...</p>
            )}

            {errorDashboard && !datosCargados && (
              <div className="login-error" role="alert">
                {errorDashboard}
                <button
                  type="button"
                  className="btn btn-small btn-outline"
                  onClick={() => setRevisionDashboard((prev) => prev + 1)}
                >
                  Reintentar
                </button>
              </div>
            )}

            {datosCargados && (
              <>
                <div className="resumen-tarjetas">
                  <div className="resumen-card">
                    <span className="resumen-label">Total de servicios</span>
                    <span className="resumen-valor">{totalServicios ?? '—'}</span>
                  </div>
                  <div className="resumen-card">
                    <span className="resumen-label">Total de clientes</span>
                    <span className="resumen-valor">{totalClientes ?? '—'}</span>
                  </div>
                  <div className="resumen-card">
                    <span className="resumen-label">Total de citas</span>
                    <span className="resumen-valor">{totalCitas ?? 0}</span>
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="panel panel-calendario">
                    <h3 className="panel-titulo">Almanaque</h3>
                    <p className="panel-ayuda">
                      Haz clic en un día para inhabilitarlo o habilitarlo. Los días en rojo están inhabilitados.
                    </p>
                    <CalendarioCitas
                      fechasInhabilitadas={fechasInhabilitadas}
                      resaltarConCita={fechasConCita}
                      onSeleccionarDia={(fecha) => abrirModalDia(fecha)}
                    />
                  </div>
                  <div className="panel panel-grafico">
                    <h3 className="panel-titulo">Citas por servicio</h3>
                    <GraficoCitas datos={datosGrafico} />
                  </div>
                </div>
              </>
            )}
          </div>
        )
      }

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
              <div className="modal-overlay" onClick={() => { setMostrarFormulario(false); setForm(formVacio) }}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Agregar servicio</h2>
                    <button className="modal-close" onClick={() => { setMostrarFormulario(false); setForm(formVacio) }} aria-label="Cerrar">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={manejarEnvio}>
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
                          value={form.moneda || monedas[0]?.tipoMoneda || ''}
                          onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                        >
                          {monedas.length === 0 ? (
                            <option value="" disabled>
                              No hay monedas registradas
                            </option>
                          ) : (
                            monedas.map((m) => (
                              <option key={m._id} value={m.tipoMoneda}>
                                {m.tipoMoneda}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="campo">
                      <label htmlFor="s-disponible">Disponibilidad</label>
                      <select
                        id="s-disponible"
                        value={form.disponible ? '1' : '0'}
                        onChange={(e) => setForm({ ...form, disponible: e.target.value === '1' })}
                      >
                        <option value="1">Disponible</option>
                        <option value="0">No disponible</option>
                      </select>
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
                </div>
              </div>
            )}

            <div className="lista-servicios">
              <h2>Servicios actuales</h2>
              {servicios.length === 0 ? (
                <p className="empty">
                  {cargandoDashboard && !datosCargados
                    ? 'Cargando servicios...'
                    : 'No hay servicios registrados.'}
                </p>
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
                        <span className={`estado-servicio ${s.disponible ? 'disponible' : 'no-disponible'}`}>
                          {s.disponible ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                      <div className="servicio-acciones">
                        <button className="btn btn-small btn-outline" onClick={() => abrirEditar(s)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => setServicioAEliminar(s)}
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
                          value={monedas.some((m) => m.tipoMoneda === formEdit.moneda) ? formEdit.moneda : monedas[0]?.tipoMoneda || ''}
                          onChange={(e) => setFormEdit({ ...formEdit, moneda: e.target.value })}
                        >
                          {monedas.length === 0 ? (
                            <option value="" disabled>
                              No hay monedas registradas
                            </option>
                          ) : (
                            monedas.map((m) => (
                              <option key={m._id} value={m.tipoMoneda}>
                                {m.tipoMoneda}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="campo">
                      <label htmlFor="edit-disponible">Disponibilidad</label>
                      <select
                        id="edit-disponible"
                        value={formEdit.disponible ? '1' : '0'}
                        onChange={(e) => setFormEdit({ ...formEdit, disponible: e.target.value === '1' })}
                      >
                        <option value="1">Disponible</option>
                        <option value="0">No disponible</option>
                      </select>
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

            {servicioAEliminar && (
              <div className="modal-overlay" onClick={() => setServicioAEliminar(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Eliminar servicio</h2>
                    <button
                      className="modal-close"
                      onClick={() => setServicioAEliminar(null)}
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>

                  <p>
                    ¿Estás seguro de que deseas borrar el servicio{' '}
                    <strong>{servicioAEliminar.nombre}</strong>?
                  </p>

                  <div className="form-buttons">
                    <button type="button" className="btn btn-danger" onClick={confirmarEliminarServicio}>
                      Sí, eliminar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setServicioAEliminar(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'clientes':
        return (
          <div className="admin-seccion">
            <div className="admin-section-header">
              <div>
                <h2>Clientes</h2>
                <p className="page-subtitle">Administra los clientes registrados en la clínica.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setMostrarFormCliente(!mostrarFormCliente)}>
                {mostrarFormCliente ? 'Cerrar formulario' : '+ Agregar cliente'}
              </button>
            </div>

            {mostrarFormCliente && (
              <div className="modal-overlay" onClick={() => { setMostrarFormCliente(false); setFormCliente(clienteVacio) }}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Agregar cliente</h2>
                    <button
                      className="modal-close"
                      onClick={() => { setMostrarFormCliente(false); setFormCliente(clienteVacio) }}
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={manejarCrearCliente}>
                    <div className="campo">
                      <label htmlFor="ac-ci">Carné de identidad</label>
                      <input
                        id="ac-ci"
                        type="text"
                        required
                        value={formCliente.ci}
                        onChange={(e) => setFormCliente({ ...formCliente, ci: e.target.value })}
                        placeholder="Ej. 03074563666"
                      />
                    </div>

                    <div className="campo-row">
                      <div className="campo">
                        <label htmlFor="ac-nombre">Nombre</label>
                        <input
                          id="ac-nombre"
                          type="text"
                          required
                          value={formCliente.nombre}
                          onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
                          placeholder="Ej. Juan"
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="ac-apellidos">Apellidos</label>
                        <input
                          id="ac-apellidos"
                          type="text"
                          required
                          value={formCliente.apellidos}
                          onChange={(e) => setFormCliente({ ...formCliente, apellidos: e.target.value })}
                          placeholder="Ej. Pérez Gómez"
                        />
                      </div>
                    </div>

                    <div className="campo">
                      <label htmlFor="ac-telefono">Teléfono</label>
                      <input
                        id="ac-telefono"
                        type="text"
                        required
                        value={formCliente.telefono}
                        onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })}
                        placeholder="Ej. +51 999 888 777"
                      />
                    </div>

                    <div className="campo">
                      <label htmlFor="ac-direccion">Dirección</label>
                      <input
                        id="ac-direccion"
                        type="text"
                        value={formCliente.direccion}
                        onChange={(e) => setFormCliente({ ...formCliente, direccion: e.target.value })}
                        placeholder="Ej. Av. Los Olivos 123"
                      />
                    </div>

                    <div className="form-buttons">
                      <button type="submit" className="btn btn-primary" disabled={guardandoCliente}>
                        {guardandoCliente ? 'Guardando...' : 'Agregar cliente'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={guardandoCliente}
                        onClick={() => { setMostrarFormCliente(false); setFormCliente(clienteVacio) }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>CI</th>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.length === 0 ? (
                    <tr>
                      <td className="table-empty" colSpan={5}>
                        {cargandoDashboard && !datosCargados
                          ? 'Cargando clientes...'
                          : 'No hay clientes registrados.'}
                      </td>
                    </tr>
                  ) : (
                    clientes.map((c) => (
                      <tr key={c._id}>
                        <td>{c.ci}</td>
                        <td>
                          {c.nombre} {c.apellidos}
                        </td>
                        <td>{c.telefono}</td>
                        <td>{c.direccion || '—'}</td>
                        <td>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => setClienteAEliminar(c)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {clienteAEliminar && (
              <div className="modal-overlay" onClick={() => setClienteAEliminar(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Eliminar cliente</h2>
                    <button
                      className="modal-close"
                      onClick={() => setClienteAEliminar(null)}
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>

                  <p>
                    ¿Estás seguro de que deseas borrar el cliente{' '}
                    <strong>
                      {clienteAEliminar.nombre} {clienteAEliminar.apellidos}
                    </strong>{' '}
                    (CI {clienteAEliminar.ci})?
                  </p>

                  <div className="form-buttons">
                    <button type="button" className="btn btn-danger" onClick={confirmarEliminarCliente}>
                      Sí, eliminar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setClienteAEliminar(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'citas': {
        const clientePorId = new Map(
          clientes.map((c) => [c._id, `${c.nombre} ${c.apellidos}`]),
        )
        const servicioPorId = new Map(
          serviciosBackend.map((s) => [s._id, s.nombreServicio]),
        )

        return (
          <div className="admin-seccion">
            <div className="admin-section-header">
              <div>
                <h2>Citas</h2>
                <p className="page-subtitle">Administra las citas agendadas en la clínica.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setMostrarFormCita(!mostrarFormCita)}>
                {mostrarFormCita ? 'Cerrar formulario' : '+ Agregar cita'}
              </button>
            </div>

            {mostrarFormCita && (
              <div className="modal-overlay" onClick={() => { setMostrarFormCita(false); setFormCita(citaVacio) }}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Agregar cita</h2>
                    <button
                      className="modal-close"
                      onClick={() => { setMostrarFormCita(false); setFormCita(citaVacio) }}
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={manejarCrearCita}>
                    <div className="campo">
                      <label htmlFor="cita-cliente">Cliente</label>
                      <select
                        id="cita-cliente"
                        required
                        value={formCita.cliente}
                        onChange={(e) => setFormCita({ ...formCita, cliente: e.target.value })}
                      >
                        <option value="" disabled>
                          {clientes.length === 0 ? 'No hay clientes registrados' : 'Selecciona un cliente'}
                        </option>
                        {clientes.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.ci} – {c.nombre} {c.apellidos}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo">
                      <label htmlFor="cita-servicio">Servicio</label>
                      <select
                        id="cita-servicio"
                        required
                        value={formCita.servicio}
                        onChange={(e) => setFormCita({ ...formCita, servicio: e.target.value })}
                      >
                        <option value="" disabled>
                          {serviciosBackend.length === 0 ? 'No hay servicios registrados' : 'Selecciona un servicio'}
                        </option>
                        {serviciosBackend.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.nombreServicio}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo">
                      <span className="campo-label">Fecha</span>
                      <CalendarioCitas
                        fechasInhabilitadas={fechasInhabilitadas}
                        fechaSeleccionada={formCita.fecha}
                        bloquearInhabilitados
                        bloquearPasados
                        onSeleccionarDia={(fecha) => setFormCita({ ...formCita, fecha })}
                      />
                      <p className="campo-ayuda">
                        Los días en rojo están inhabilitados.{' '}
                        {formCita.fecha
                          ? `Fecha seleccionada: ${formCita.fecha}`
                          : 'Selecciona un día del calendario.'}
                      </p>
                    </div>

                    <div className="form-buttons">
                      <button type="submit" className="btn btn-primary" disabled={guardandoCita}>
                        {guardandoCita ? 'Guardando...' : 'Agregar cita'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={guardandoCita}
                        onClick={() => { setMostrarFormCita(false); setFormCita(citaVacio) }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.length === 0 ? (
                    <tr>
                      <td className="table-empty" colSpan={4}>
                        {cargandoDashboard && !datosCargados
                          ? 'Cargando citas...'
                          : 'No hay citas registradas.'}
                      </td>
                    </tr>
                  ) : (
                    citas.map((cita) => (
                      <tr key={cita._id}>
                        <td>{clientePorId.get(cita.cliente) ?? cita.cliente}</td>
                        <td>
                          {servicioPorId.has(cita.servicio) ? (
                            servicioPorId.get(cita.servicio)
                          ) : (
                            <span className="servicio-eliminado">Servicio eliminado</span>
                          )}
                        </td>
                        <td>{formatearFecha(cita.fecha)}</td>
                        <td>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => setCitaAEliminar(cita)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {citaAEliminar && (
              <div className="modal-overlay" onClick={() => setCitaAEliminar(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Eliminar cita</h2>
                    <button
                      className="modal-close"
                      onClick={() => setCitaAEliminar(null)}
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>

                  <p>
                    ¿Estás seguro de que deseas borrar la cita del{' '}
                    <strong>{clientePorId.get(citaAEliminar.cliente) ?? citaAEliminar.cliente}</strong>{' '}
                    del día <strong>{formatearFecha(citaAEliminar.fecha)}</strong>?
                  </p>

                  <div className="form-buttons">
                    <button type="button" className="btn btn-danger" onClick={confirmarEliminarCita}>
                      Sí, eliminar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setCitaAEliminar(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }

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

            {guardandoConfig && (
              <div className="success-box">Guardando cambios...</div>
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
                <button type="submit" className="btn btn-primary" disabled={guardandoConfig}>
                  {guardandoConfig ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={guardandoConfig}
                  onClick={async () => {
                    setGuardandoConfig(true)
                    const exito = await restablecerContacto()
                    setGuardandoConfig(false)
                    if (exito) {
                      setFormContacto(VALORES_INICIALES)
                      setEditandoConfig(false)
                      setModalConfig({
                        tipo: 'exito',
                        titulo: 'Valores restablecidos',
                        mensaje: 'La configuración volvió a los valores por defecto.',
                      })
                    } else {
                      setModalConfig({
                        tipo: 'error',
                        titulo: 'Error al restablecer',
                        mensaje: 'No se pudo conectar con el backend. Inténtalo de nuevo.',
                      })
                    }
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
            {onVolverAlSitio && (
              <button type="button" className="sidebar-link sidebar-volver" onClick={onVolverAlSitio}>
                <Icono nombre="home" />
                Volver al sitio
              </button>
            )}
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

      {diaModal && (
        <div className="modal-overlay" onClick={() => !guardandoDia && setDiaModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{diaModal.inhabilitado ? 'Habilitar día' : 'Inhabilitar día'}</h2>
              <button
                className="modal-close"
                onClick={() => setDiaModal(null)}
                aria-label="Cerrar"
                disabled={guardandoDia}
              >
                ✕
              </button>
            </div>
            <p className="modal-texto">
              {diaModal.inhabilitado
                ? `¿Deseas habilitar el día ${formatearFecha(diaModal.fecha)}? Se podrán agendar citas nuevamente.`
                : `¿Deseas inhabilitar el día ${formatearFecha(diaModal.fecha)}? No se podrán agendar citas en esa fecha.`}
            </p>
            <div className="form-buttons">
              <button
                type="button"
                className="btn btn-primary"
                disabled={guardandoDia}
                onClick={confirmarModalDia}
              >
                {guardandoDia
                  ? 'Guardando...'
                  : diaModal.inhabilitado
                    ? 'Sí, habilitar'
                    : 'Sí, inhabilitar'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={guardandoDia}
                onClick={() => setDiaModal(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfig && (
        <div className="modal-overlay" onClick={() => setModalConfig(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalConfig.titulo}</h2>
              <button className="modal-close" onClick={() => setModalConfig(null)} aria-label="Cerrar">
                ✕
              </button>
            </div>
            <p className={modalConfig.tipo === 'exito' ? 'success-box' : 'login-error'}>
              {modalConfig.mensaje}
            </p>
            <div className="form-buttons">
              <button type="button" className="btn btn-primary" onClick={() => setModalConfig(null)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}