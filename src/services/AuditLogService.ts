export interface AuditLogEntry {
  action: string;
  incidentId: string;
  hospitalId?: string | null;
  adminId?: string | null;
  timestamp: string;
  metadata?: Record<string, any>;
}

export async function recordAuditLog(entry: AuditLogEntry): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.ok;
  } catch (err) {
    console.warn('Audit logging non-blocking error:', err);
    return false;
  }
}
