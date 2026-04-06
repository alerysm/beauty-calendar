# Skincare Calendar PWA

Calendario de rutina de cuidado de la piel con validación de compatibilidad entre productos.

## Instalación y uso

```bash
npm install
npm run dev        # Desarrollo en http://localhost:5173
npm run build      # Build de producción → dist/
npm run preview    # Preview del build en local
```

## Despliegue en Cloudflare Pages

1. Sube el repositorio a GitHub
2. En Cloudflare Pages → "Connect to Git"
3. Configuración:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Deploy

## Instalar como PWA en iPhone

1. Abre la app en Safari
2. Toca el botón Compartir (cuadrado con flecha)
3. Selecciona "Añadir a pantalla de inicio"
4. La app se instala como nativa

## Estructura del proyecto

```
src/
├── components/
│   ├── Calendar/
│   │   ├── MonthView.tsx      # Vista mensual con dots de productos
│   │   ├── WeekView.tsx       # Vista semanal
│   │   └── DayModal.tsx       # Modal para gestionar un día
│   ├── Navigation/
│   │   └── BottomNav.tsx      # Barra de navegación inferior
│   ├── Products/
│   │   ├── ProductCard.tsx    # Tarjeta de producto
│   │   └── ProductForm.tsx    # Formulario crear/editar
│   └── UI/
│       ├── Modal.tsx          # Modal genérico tipo iOS
│       ├── Toast.tsx          # Notificaciones toast
│       └── ValidationAlert.tsx # Alerta de conflictos
├── pages/
│   ├── TodayPage.tsx          # Rutina del día de hoy
│   ├── Dashboard.tsx          # Calendario (mes/semana)
│   ├── ProductsPage.tsx       # Gestión de productos
│   ├── RulesPage.tsx          # Reglas de compatibilidad
│   └── SettingsPage.tsx       # Configuración y notificaciones
├── store/
│   └── useStore.ts            # Estado global con Zustand + persistencia
├── types/
│   └── index.ts               # Tipos TypeScript
└── utils/
    ├── rulesEngine.ts         # Motor de reglas de compatibilidad
    ├── dateUtils.ts           # Utilidades de fecha
    ├── notifications.ts       # API de notificaciones
    └── storage.ts             # Export/Import JSON
```

## Reglas de compatibilidad implementadas

| Regla | Descripción |
|-------|-------------|
| Ácido Azelaico + Retinol | ❌ No el mismo día |
| Ácido Azelaico + Dermaplaning | ❌ No el mismo día |
| Retinol + Dermaplaning | ❌ No el mismo día |
| Máscara AHA-BHA-PHA | ❌ Conflicta con los 3 anteriores, máx 2×/semana |
| Aceite Limpiador | ⚠️ Máx 1 vez/semana |
| Ácido Glicólico | ⚠️ Máx 2 veces/semana |
| Niacinamida | ✅ Diario, sin conflictos |
| PDRN | ✅ Diario, sin conflictos |
| Crema | ✅ Diario |

## Stack técnico

- React 18 + TypeScript
- Vite 5 (build tool)
- Tailwind CSS (estilos)
- Zustand + persist (estado local)
- date-fns (fechas)
- vite-plugin-pwa (PWA + Service Worker)
- Cloudflare Pages (hosting)
