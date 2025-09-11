import { ReactNode, MouseEventHandler } from 'react'

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto bg-white border rounded shadow-sm">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-gray-50 text-left text-gray-600 sticky top-0 md:relative z-10">
      {children}
    </thead>
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y">{children}</tbody>
}

export function TR({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: MouseEventHandler<HTMLTableRowElement> }) {
  return <tr className={`odd:bg-white even:bg-gray-50/40 hover:bg-gray-50 transition-colors ${className}`} onClick={onClick}>{children}</tr>
}

export function TH({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold border-b ${className}`}>{children}</th>
}

export function TD({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-2 align-top ${className}`}>{children}</td>
}
