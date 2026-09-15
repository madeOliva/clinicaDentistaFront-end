import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useContacto, whatsappLink } from '../contactConfig'
import { PAISES } from '../paises'
import CalendarioCitas from '../components/CalendarioCitas'
import { getServicios, getClientePorCi, createCliente, crearCita, getDiasInhabilitados } from '../api'
import type { ServicioBackend } from '../api'
import type { Cita } from '../types'
import { ciValido, soloLetras, soloNumeros, soloLetrasInput, soloNumerosInput, ciInput } from '../validaciones'

const vacio: Cita = { ci: '', nombre: '', apellidos: '', edad: '', celular: '', servicio: '', fecha: '' }

export default function Citas({ servicioInicial = '' }: { servicioInicial?: string }) {
  const { contacto } = useContacto()
  const [form, setForm] = useState<Cita>({ ...vacio })
  const [servicios, setServicios] = useState<ServicioBackend[]>([])
  const [cargandoServicios, setCargandoServicios] = useState(true)
  const [enviado, setEnviado] = useState(false)
  const [pais, setPais] = useState('+53')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [fechasInhabilitadas, setFechasInhabilitadas] = useState<Set<string>>(new Set())

  useEffect(() => {
    let activo = true
    getDiasInhabilitados()
      .then((data) => {
        if (activo) setFechasInhabilitadas(new Set(data.map((d) => d.fecha.slice(0, 10))))
      })
      .catch(() => {
        if (activo) setFechasInhabilitadas(new Set())
      })
    return () => {
      activo = false
    }
  }, [])

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
    let limpio = valor
    if (campo === 'ci') limpio = ciInput(valor)
    else if (campo === 'nombre' || campo === 'apellidos') limpio = soloLetrasInput(valor)
    else if (campo === 'edad' || campo === 'celular') limpio = soloNumerosInput(valor)
    setErrores((prev) => ({ ...prev, [campo]: '' }))
    setForm((f) => ({ ...f, [campo]: limpio }))
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    const erroresLocal: Record<string, string> = {}
    if (!ciValido(form.ci)) erroresLocal.ci = 'El CI debe tener 11 dígitos y una fecha de nacimiento válida (mes 01-12 y día válido)'
    if (!soloLetras(form.nombre)) erroresLocal.nombre = 'El nombre solo puede contener letras'
    if (!soloLetras(form.apellidos)) erroresLocal.apellidos = 'Los apellidos solo pueden contener letras'
    if (!soloNumeros(form.edad) || Number(form.edad) < 1 || Number(form.edad) > 120) erroresLocal.edad = 'La edad debe ser un número entre 1 y 120'
    if (!soloNumeros(form.celular)) erroresLocal.celular = 'El celular solo puede contener números'
    setErrores(erroresLocal)
    if (Object.keys(erroresLocal).length > 0) return

    const celularCompleto = `${pais} ${form.celular}`
    const servicioSeleccionado = servicios.find((s) => s._id === form.servicio)
    const nombreServicio = servicioSeleccionado?.nombreServicio ?? form.servicio

    try {
      const ciLimpio = form.ci.trim()
      let clienteId: string
      try {
        const cliente = await getClientePorCi(ciLimpio)
        clienteId = cliente._id
      } catch {
        const nuevo = await createCliente({
          ci: ciLimpio,
          nombre: form.nombre,
          apellidos: form.apellidos,
          telefono: celularCompleto,
        })
        clienteId = nuevo._id
      }

      await crearCita({
        cliente: clienteId,
        servicio: form.servicio,
        fecha: form.fecha,
      })

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
          ✅ Tu cita quedó registrada y la solicitud se envió por WhatsApp. Te contactaremos para confirmar.
        </div>
      )}

      <form className="cita-form" onSubmit={manejarEnvio}>
        <div className="campo">
          <label htmlFor="ci">Carné de identidad</label>
          <input
            id="ci"
            type="text"
            inputMode="numeric"
            required
            value={form.ci}
            onChange={(e) => cambiar('ci', e.target.value)}
            placeholder="Ej. 92051234785"
            className={errores.ci ? 'input-error' : ''}
          />
          {errores.ci && <p className="campo-error">{errores.ci}</p>}
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
            className={errores.nombre ? 'input-error' : ''}
          />
          {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
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
            className={errores.apellidos ? 'input-error' : ''}
          />
          {errores.apellidos && <p className="campo-error">{errores.apellidos}</p>}
        </div>

        <div className="campo">
          <label htmlFor="edad">Edad</label>
          <input
            id="edad"
            type="text"
            inputMode="numeric"
            required
            value={form.edad}
            onChange={(e) => cambiar('edad', e.target.value)}
            placeholder="Tu edad"
            className={errores.edad ? 'input-error' : ''}
          />
          {errores.edad && <p className="campo-error">{errores.edad}</p>}
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
              inputMode="numeric"
              required
              value={form.celular}
              onChange={(e) => cambiar('celular', e.target.value)}
              placeholder="Tu número de celular"
              className={errores.celular ? 'input-error' : ''}
            />
          </div>
          {errores.celular && <p className="campo-error">{errores.celular}</p>}
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
          <span className="campo-label">Fecha deseada</span>
          <CalendarioCitas
            fechasInhabilitadas={fechasInhabilitadas}
            fechaSeleccionada={form.fecha}
            bloquearInhabilitados
            bloquearPasados
            onSeleccionarDia={(fecha) => cambiar('fecha', fecha)}
          />
          <p className="campo-ayuda">
            Los días en rojo están inhabilitados. {form.fecha ? `Fecha seleccionada: ${form.fecha}` : 'Selecciona un día del calendario.'}
          </p>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={!form.fecha}>
          Enviar solicitud por WhatsApp
        </button>
      </form>
    </section>
  )
}