import { ReactNode } from 'react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'

export default function Modal({ open, onClose, title, children, size = 'lg' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: ModalSize }) {
  if (!open) return null
  const sizeClass =
    size === 'sm' ? 'max-w-sm' :
    size === 'md' ? 'max-w-md' :
    size === 'lg' ? 'max-w-lg' :
    size === 'xl' ? 'max-w-xl' :
    size === '2xl' ? 'max-w-2xl' :
    size === '3xl' ? 'max-w-3xl' :
    'max-w-[90vw]'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className={`bg-white rounded shadow-lg w-full ${sizeClass} max-h-[90vh] animate-scale-in flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
