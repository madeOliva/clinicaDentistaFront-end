import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useContacto, whatsappLink } from '../contactConfig'
import { PAISES } from '../paises'
import { getServicios, getClientePorCi, createCliente } from '../api'
import type { ServicioBackend } from '../api'
import type { Cita } from '../types'

const vacio: Cita = { ci: '', nombre: '', apellidos: '', edad: '', celular: '', servicio: '', fecha: '' }

export default function Citas({ servicioInicial = '' }: { servicioInicial?: string }) {
  const { contacto } = useContacto()
  const [form, setForm] = useState<Cita>({ ...vacio })
  const [servicios, setServicios] = useState<ServicioBackend[]>([])
  const [cargandoServicios, setCargandoServicios] = useState(true)
  const [enviado, setEnviado] = useState(false)
  const [pais, setPais] = useState('+53')

  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    let activo = true
    getServicios()
      .then((data) => {
        if (!activo) return
        setServicios(data)
        if (servicioInicial) {
          const match = data.find((s) => s.nombreServicio === servicioInicial)
          if (match) setForm((f) => ({ ...f, servicio: match._id }))
        }
      })
      .catch(() => {
        if (activo) setServicios([])
      })
      .finally(() => {
        if (activo) setCargandoServicios(false)
      })
    return () => { activo = false }
  }, [servicioInicial])

  function cambiar(campo: keyof Cita, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    const celularCompleto = `${pais} ${form.celular}`
    const servicioSeleccionado = servicios.find((s) => s._id === form.servicio)
    const nombreServicio = servicioSeleccionado?.nombreServicio ?? form.servicio

    try {
      const ciLimpio = form.ci.trim()
      try {
        await getClientePorCi(ciLimpio)
      } catch {
        await createCliente({
          ci: ciLimpio,
          nombre: form.nombre,
          apellidos: form.apellidos,
          telefono: celularCompleto,
        })
      }

      const mensaje =
        `Hola ${contacto.name}, deseo agendar una cita.\n\n` +
        `🪪 CI: ${form.ci}\n` +
        `👤 Nombre: ${form.nombre}\n` +
        `👤 Apellidos: ${form.apellidos}\n` +
        `🎂 Edad: ${form.edad}\n` +
        `📱 Celular: ${celularCompleto}\n` +
        `🦷 Servicio: ${nombreServicio}\n` +
        `📅 Fecha deseada: ${form.fecha}\n\n` +
        `¿Está disponible mi fecha? De no ser posible, por favor indíqueme un turno en otra fecha.`
      window.open(whatsappLink(contacto.whatsapp, mensaje), '_blank')
      setEnviado(true)
      setForm({ ...vacio })
    } catch {
      // Si no hay backend disponible, aún así abrimos WhatsApp para no bloquear la solicitud.
      window.open(whatsappLink(contacto.whatsapp, `Hola ${contacto.name}, deseo agendar una cita.\n\n🪪 CI: ${form.ci}\n👤 Nombre: ${form.nombre}\n👤 Apellidos: ${form.apellidos}\n🎂 Edad: ${form.edad}\n📱 Celular: ${celularCompleto}\n🦷 Servicio: ${nombreServicio}\n📅 Fecha deseada: ${form.fecha}\n\n¿Está disponible mi fecha? De no ser posible, por favor indíqueme un turno en otra fecha.`), '_blank')
      setEnviado(true)
      setForm({ ...vacio })
    }
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

      <form className="cita-form" onSubmit={manejarEnvio}>
        <div className="campo">
          <label htmlFor="ci">Carné de identidad</label>
          <input
            id="ci"
            type="text"
            required
            value={form.ci}
            onChange={(e) => cambiar('ci', e.target.value)}
            placeholder="Ej. 03074563666"
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
              {cargandoServicios ? 'Cargando servicios...' : 'Selecciona un servicio'}
            </option>
            {servicios.map((s) => (
              <option key={s._id} value={s._id}>
                {s.nombreServicio}
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