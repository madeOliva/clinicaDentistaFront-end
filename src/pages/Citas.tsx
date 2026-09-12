import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useServicios } from '../data'
import { useContacto, whatsappLink } from '../contactConfig'
import { PAISES } from '../paises'
import { getServicios, getClientes, crearCliente, crearCita } from '../api'
import type { ClienteBackend, ServicioBackend } from '../api'
import type { Cita } from '../types'

const vacio: Cita = {
  ci: '',
  nombre: '',
  apellidos: '',
  edad: '',
  celular: '',
  servicio: '',
  fecha: '',
}

export default function Citas({ servicioInicial = '' }: { servicioInicial?: string }) {
  const { servicios } = useServicios()
  const { contacto } = useContacto()
  const [form, setForm] = useState<Cita>({ ...vacio, servicio: servicioInicial })
  const [enviado, setEnviado] = useState(false)
  const [pais, setPais] = useState('+53')
  const [serviciosBackend, setServiciosBackend] = useState<ServicioBackend[]>([])
  const [clientesBackend, setClientesBackend] = useState<ClienteBackend[]>([])
  const [error, setError] = useState('')

  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    let activo = true

    Promise.all([getServicios(), getClientes()])
      .then(([servs, clis]) => {
        if (!activo) return
        setServiciosBackend(servs)
        setClientesBackend(clis)
      })
      .catch(() => {})

    return () => {
      activo = false
    }
  }, [])

  const opcionesServicio =
    serviciosBackend.length > 0
      ? serviciosBackend.map((s) => ({ key: s._id, nombre: s.nombreServicio }))
      : servicios.map((s) => ({ key: s.id, nombre: s.nombre }))

  function cambiar(campo: keyof Cita, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function registrarEnBackend() {
    const servicioId = serviciosBackend.find((s) => s.nombreServicio === form.servicio)?._id
    if (!servicioId) {
      throw new Error('servicio-no-encontrado')
    }

    const ci = form.ci.trim()
    const telefono = `${pais} ${form.celular}`

    let clienteId = clientesBackend.find((c) => c.ci === ci)?._id
    if (!clienteId) {
      try {
        const nuevo = await crearCliente({ ci, nombre: form.nombre, apellidos: form.apellidos, telefono })
        clienteId = nuevo._id
        setClientesBackend((prev) => [...prev, nuevo])
      } catch {
        const existentes = await getClientes()
        const existente = existentes.find((c) => c.ci === ci)
        if (existente) {
          clienteId = existente._id
          setClientesBackend(existentes)
        } else {
          throw new Error('no-se-pudo-cliente')
        }
      }
    }

    await crearCita({ cliente: clienteId, servicio: servicioId, fecha: `${form.fecha}T10:00:00.000Z` })
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    setError('')
    const celularCompleto = `${pais} ${form.celular}`
    const mensaje =
      `Hola ${contacto.name}, deseo agendar una cita.\n\n` +
      `👤 Nombre: ${form.nombre}\n` +
      `👤 Apellidos: ${form.apellidos}\n` +
      `🎂 Edad: ${form.edad}\n` +
      `📱 Celular: ${celularCompleto}\n` +
      `🦷 Servicio: ${form.servicio}\n` +
      `📅 Fecha deseada: ${form.fecha}\n\n` +
      `¿Está disponible mi fecha? De no ser posible, por favor indíqueme un turno en otra fecha.`
    window.open(whatsappLink(contacto.whatsapp, mensaje), '_blank')

    try {
      await registrarEnBackend()
    } catch {
      setError('No se pudo registrar la cita en el sistema. Tu solicitud fue enviada por WhatsApp.')
    }

    setEnviado(true)
    setForm(vacio)
  }

  return (
    <section className="page citas citas-page">
      <h1>Agenda tu cita</h1>
      <p className="page-subtitle">
        Completa el formulario y presiona enviar. Tu solicitud se enviará por WhatsApp a nuestro
        equipo, quien te confirmará el turno y fecha disponible.
      </p>

      {enviado && (
        <div className="success-box">
          ✅ Solicitud enviada a través de WhatsApp. Te contactaremos para confirmar tu cita.
        </div>
      )}

      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      <form className="cita-form" onSubmit={manejarEnvio}>
        <div className="campo">
          <label htmlFor="ci">Cédula de identidad</label>
          <input
            id="ci"
            type="text"
            required
            value={form.ci}
            onChange={(e) => cambiar('ci', e.target.value)}
            placeholder="Tu CI o documento de identidad"
          />
        </div>

        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        <div className="campo">
          <label htmlFor="apellidos">Apellidos</label>
          <input
            id="apellidos"
            type="text"
            required
            value={form.apellidos}
            onChange={(e) => cambiar('apellidos', e.target.value)}
            placeholder="Tus apellidos"
          />
        </div>

        <div className="campo">
          <label htmlFor="edad">Edad</label>
          <input
            id="edad"
            type="number"
            required
            min={1}
            max={120}
            value={form.edad}
            onChange={(e) => cambiar('edad', e.target.value)}
            placeholder="Tu edad"
          />
        </div>

        <div className="campo">
          <label htmlFor="celular">Número de celular</label>
          <div className="campo-row tel-row">
            <select
              id="pais"
              aria-label="Código de país"
              className="tel-pais"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
            >
              {PAISES.map((p) => (
                <option key={p.nombre} value={p.codigo}>
                  {p.bandera} {p.nombre} ({p.codigo})
                </option>
              ))}
            </select>
            <input
              id="celular"
              type="tel"
              required
              value={form.celular}
              onChange={(e) => cambiar('celular', e.target.value)}
              placeholder="Tu número de celular"
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="servicio">Servicio</label>
          <select
            id="servicio"
            required
            value={form.servicio}
            onChange={(e) => cambiar('servicio', e.target.value)}
          >
            <option value="" disabled>
              Selecciona un servicio
            </option>
            {opcionesServicio.map((s) => (
              <option key={s.key} value={s.nombre}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="fecha">Fecha deseada</label>
          <input
            id="fecha"
            type="date"
            required
            min={hoy}
            value={form.fecha}
            onChange={(e) => cambiar('fecha', e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Enviar solicitud por WhatsApp
        </button>
      </form>
    </section>
  )
}