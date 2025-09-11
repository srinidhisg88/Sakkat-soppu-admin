export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const escape = (v: any) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const lines = [
    headers.map(escape).join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ]
  return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
