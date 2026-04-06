import { useState, useRef } from 'react'
import { Bell, BellOff, Download, Upload, Trash2, Moon, ChevronRight, Info } from 'lucide-react'
import { useStore, useSettings } from '../store/useStore'
import { useToast } from '../components/UI/Toast'
import { downloadJSON, readJSONFile } from '../utils/storage'
import { requestNotificationPermission, getNotificationStatus } from '../utils/notifications'

export function SettingsPage() {
  const settings = useSettings()
  const { updateSettings, exportData, importData, resetData } = useStore()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const notifStatus = getNotificationStatus()
  const [requestingNotif, setRequestingNotif] = useState(false)

  const handleRequestNotifications = async () => {
    setRequestingNotif(true)
    const granted = await requestNotificationPermission()
    updateSettings({ notificationsPermission: granted })
    setRequestingNotif(false)
    if (granted) {
      showToast('Notificaciones activadas', 'success')
    } else {
      showToast('Permiso denegado. Actívalo en Configuración del sistema.', 'error')
    }
  }

  const handleExport = () => {
    const json = exportData()
    const date = new Date().toISOString().split('T')[0]
    downloadJSON(`skincare-backup-${date}.json`, json)
    showToast('Datos exportados', 'success')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const json = await readJSONFile(file)
      const ok = importData(json)
      if (ok) {
        showToast('Datos importados correctamente', 'success')
      } else {
        showToast('Archivo inválido', 'error')
      }
    } catch {
      showToast('Error al leer el archivo', 'error')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleReset = () => {
    if (confirm('¿Restaurar datos? Se eliminarán todos los cambios.')) {
      resetData()
      showToast('Datos restaurados', 'info')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-white text-xl font-bold">Configuración</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6">

        {/* Notifications */}
        <Section title="Notificaciones">
          {/* Permission status */}
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/60 rounded-2xl border border-zinc-700/40 mb-3">
            <div className={`p-2 rounded-xl ${
              notifStatus === 'granted' ? 'bg-green-900/60' :
              notifStatus === 'denied'  ? 'bg-red-900/60' :
              'bg-zinc-700/60'
            }`}>
              {notifStatus === 'granted'
                ? <Bell size={18} className="text-green-400" />
                : <BellOff size={18} className="text-zinc-400" />
              }
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                {notifStatus === 'granted' ? 'Notificaciones activas' :
                 notifStatus === 'denied'  ? 'Notificaciones bloqueadas' :
                 notifStatus === 'unsupported' ? 'No disponible' :
                 'Notificaciones desactivadas'}
              </p>
              <p className="text-zinc-500 text-xs">
                {notifStatus === 'denied'
                  ? 'Ve a Configuración del sistema para activarlas'
                  : 'Recordatorio de tu rutina diaria'}
              </p>
            </div>
            {notifStatus !== 'granted' && notifStatus !== 'denied' && notifStatus !== 'unsupported' && (
              <button
                onClick={handleRequestNotifications}
                disabled={requestingNotif}
                className="px-3 py-1.5 bg-skin-400 rounded-xl text-zinc-950 text-xs font-semibold
                  hover:bg-skin-300 disabled:opacity-50 transition-all"
              >
                {requestingNotif ? '...' : 'Activar'}
              </button>
            )}
          </div>

          {/* Morning */}
          <ToggleRow
            label="Recordatorio de mañana"
            subtitle={`Recordatorio a las ${settings.morningTime}`}
            checked={settings.morningNotification}
            onChange={v => updateSettings({ morningNotification: v })}
            disabled={notifStatus !== 'granted'}
          />
          {settings.morningNotification && (
            <TimeInput
              label="Hora de mañana"
              value={settings.morningTime}
              onChange={v => updateSettings({ morningTime: v })}
            />
          )}

          {/* Night */}
          <ToggleRow
            label="Recordatorio de noche"
            subtitle={`Recordatorio a las ${settings.nightTime}`}
            checked={settings.nightNotification}
            onChange={v => updateSettings({ nightNotification: v })}
            disabled={notifStatus !== 'granted'}
          />
          {settings.nightNotification && (
            <TimeInput
              label="Hora de noche"
              value={settings.nightTime}
              onChange={v => updateSettings({ nightTime: v })}
            />
          )}
        </Section>

        {/* Data */}
        <Section title="Datos">
          <ActionRow
            icon={<Download size={18} className="text-blue-400" />}
            label="Exportar datos"
            subtitle="Guardar como archivo JSON"
            onClick={handleExport}
          />
          <ActionRow
            icon={<Upload size={18} className="text-green-400" />}
            label="Importar datos"
            subtitle="Restaurar desde archivo JSON"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <ActionRow
            icon={<Trash2 size={18} className="text-red-400" />}
            label="Restaurar datos"
            subtitle="Volver a los productos predeterminados"
            onClick={handleReset}
            danger
          />
        </Section>

        {/* About */}
        <Section title="Acerca de">
          <div className="px-4 py-3 space-y-2">
            <InfoRow label="Versión" value="1.0.0" />
            <InfoRow label="Almacenamiento" value="Local (dispositivo)" />
            <InfoRow label="Backend" value="Sin servidor" />
          </div>
          <div className="flex items-start gap-3 px-4 py-3 bg-zinc-800/40 rounded-2xl mx-0 mt-3">
            <Info size={16} className="text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-zinc-500 text-xs leading-relaxed">
              Todos tus datos se guardan localmente en tu dispositivo.
              Nadie más tiene acceso a tu información. Exporta regularmente para hacer copias de seguridad.
            </p>
          </div>
          <div className="flex items-center justify-center px-4 py-3 mt-2">
            <p className="text-zinc-600 text-xs text-center">
              Desarrollado por{' '}
              <a
                href="https://github.com/alerysm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Alejandro Martinez
              </a>
              {' '}· GitHub{' '}
              <a
                href="https://github.com/alerysm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                @alerysm
              </a>
            </p>
          </div>
        </Section>

        {/* iOS install hint */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Instalar en iOS
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            En Safari: toca el botón Compartir → "Añadir a pantalla de inicio"
            para instalar la app y recibir notificaciones.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
        {title}
      </p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800">
        {children}
      </div>
    </div>
  )
}

function ToggleRow({
  label, subtitle, checked, onChange, disabled,
}: {
  label: string; subtitle: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-zinc-500 text-xs">{subtitle}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-all duration-200
          ${checked && !disabled ? 'bg-skin-400' : 'bg-zinc-700'}`}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200
          ${checked ? 'left-6' : 'left-1'}`}
        />
      </button>
    </div>
  )
}

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/40">
      <p className="text-zinc-400 text-sm flex-1">{label}</p>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-zinc-700 border border-zinc-600 rounded-xl px-3 py-1.5 text-white text-sm
          focus:outline-none focus:border-skin-400 transition-colors"
      />
    </div>
  )
}

function ActionRow({
  icon, label, subtitle, onClick, danger,
}: {
  icon: React.ReactNode; label: string; subtitle: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors
        ${danger ? 'hover:bg-red-950/30' : 'hover:bg-zinc-800/60'}`}
    >
      <div className="p-2 bg-zinc-800 rounded-xl">{icon}</div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
        <p className="text-zinc-500 text-xs">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-zinc-600" />
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-zinc-500 text-sm">{label}</p>
      <p className="text-zinc-300 text-sm font-medium">{value}</p>
    </div>
  )
}
