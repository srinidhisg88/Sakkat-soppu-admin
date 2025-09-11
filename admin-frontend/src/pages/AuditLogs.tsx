import { useEffect, useState } from 'react'
import { AuditLog, getAuditLogs } from '@/api/auditApi'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'

export default function AuditLogs() {
  const [list, setList] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAuditLogs({ limit: 100 })
      setList(res.data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Audit logs</h1>
      </div>

      {loading ? <div className="text-sm text-gray-500">Loading...</div> : list.length === 0 ? (
        <div className="bg-white border rounded p-6 text-center text-gray-600">No audit entries</div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>When</TH><TH>Actor</TH><TH>Action</TH><TH>Resource</TH><TH>IP</TH><TH></TH>
            </TR>
          </THead>
          <TBody>
            {list.map((e) => (
              <TR key={e._id}>
                <TD className="whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</TD>
                <TD className="text-sm">{e.actor?.name || e.actor?.email || 'System'}</TD>
                <TD className="font-medium">{e.action}</TD>
                <TD className="text-sm text-gray-700">{e.resource || '-'} {e.resourceId ? `(${e.resourceId})` : ''}</TD>
                <TD className="text-sm">{e.ip || '-'}</TD>
                <TD className="text-right text-xs text-gray-500">{e.userAgent?.slice(0,40)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
