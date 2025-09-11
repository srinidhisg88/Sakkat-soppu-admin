import api from './axios'

export type AuditLog = {
  _id: string
  actor?: { id: string; name?: string; email?: string }
  action: string
  resource?: string
  resourceId?: string
  details?: any
  ip?: string
  userAgent?: string
  createdAt: string
}

export const getAuditLogs = async (params?: { page?: number; limit?: number }) =>
  (await api.get('/admin/audit-logs', { params })).data as { data: AuditLog[]; page?: number; total?: number }
