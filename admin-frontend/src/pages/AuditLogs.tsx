import { useEffect, useState } from 'react'
import { AuditLog, getAuditLogs } from '@/api/auditApi'
import Pagination from '@/components/ui/Pagination'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'

export default function AuditLogs() {
  const [list, setList] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState<number | undefined>(undefined)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAuditLogs({ page, limit })
      setList(res.data)
      setTotal(res.total)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [page, limit])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Audit logs</h1>
      </div>

      {loading ? <div className="text-sm text-gray-500">Loading...</div> : list.length === 0 ? (
        <div className="bg-white border rounded p-6 text-center text-gray-600">No audit entries</div>
      ) : (
  <>
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
  <Pagination page={page} limit={limit} total={total} onPageChange={(p) => setPage(Math.max(1, p))} />
  </>
      )}
    </div>
  )
}
