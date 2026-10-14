import type { CustomerData, CustomerErrors } from '../types';

export const EMPTY_CUSTOMER: CustomerData = {
  name: '', email: '', phone: '', province: '', city: '', address: '', postalCode: '', notes: '',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// CP argentino: 4 dígitos (viejo) o CPA (letra + 4 dígitos + 3 letras).
const POSTAL = /^([A-Za-z]\d{4}[A-Za-z]{3}|\d{4})$/;

/** Devuelve un mensaje por cada campo inválido; vacío = formulario válido. */
export const validateCustomer = (data: CustomerData): CustomerErrors => {
  const errors: CustomerErrors = {};
  const v = (s: string) => s.trim();
  if (v(data.name).length < 2) errors.name = 'Decime tu nombre.';
  if (!EMAIL.test(v(data.email))) errors.email = 'Poné un email válido, así te mandamos el comprobante.';
  if (v(data.phone).replace(/\D/g, '').length < 8) errors.phone = 'Pasame un teléfono con código de área.';
  if (!v(data.province)) errors.province = 'Elegí tu provincia.';
  if (!v(data.city)) errors.city = 'Decime la ciudad.';
  if (v(data.address).length < 4) errors.address = 'Poné calle y número.';
  if (!POSTAL.test(v(data.postalCode))) errors.postalCode = 'El código postal tiene 4 dígitos (ej. 2600).';
  return errors;
};

export const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
] as const;
