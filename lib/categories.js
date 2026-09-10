export const CATEGORIES = [
  { id: 'hoteles', label: 'Hoteles y alojamientos' },
  { id: 'agencias', label: 'Agencias de viajes' },
  { id: 'aerolineas', label: 'Aerolíneas y vuelos' },
  { id: 'cruceros', label: 'Cruceros' },
  { id: 'tours', label: 'Tours y excursiones' },
  { id: 'autos', label: 'Alquiler de vehículos' },
  { id: 'traslados', label: 'Traslados y transporte turístico' },
  { id: 'seguros', label: 'Seguros y asistencia al viajero' },
  { id: 'gastronomia', label: 'Gastronomía y experiencias locales' },
  { id: 'entretenimiento', label: 'Parques, atracciones y entretenimiento' },
];

export function categoryLabel(id) {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : id;
}
