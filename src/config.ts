export const CLINIC = {
  name: 'Clínica Dental Sonrisa',
  whatsapp: '55912936',
  telephone: '+53 55912936',
  address: 'Av. Principal #123, Sector El Centro, Ciudad',
  email: 'contacto@clinicasonrisa.com',
  facebook: 'https://facebook.com/clinicadentalsonrisa',
  instagram: 'https://instagram.com/clinicadentalsonrisa',
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(message)}`
}
