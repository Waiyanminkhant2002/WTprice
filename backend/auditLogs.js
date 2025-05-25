import fs from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const auditLogPath = join(__dirname, 'auditLogs.json');

let auditLogs = [];

// Load audit logs from file on startup (if exists)
try {
  auditLogs = JSON.parse(fs.readFileSync(auditLogPath, 'utf-8'));
} catch {
  auditLogs = [];
}

// Save audit logs to file helper
function saveAuditLogsToFile() {
  fs.writeFile(auditLogPath, JSON.stringify(auditLogs, null, 2), (err) => {
    if (err) console.error('Error saving audit logs:', err);
  });
}

/**
 * Add audit log entry and persist to file
 * @param {Object} entry { category, id, field, oldValue, newValue, timestamp }
 */
function saveAuditLog(entry) {
  auditLogs.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  saveAuditLogsToFile();
}

/**
 * Return all audit logs
 */
function getAuditLogs() {
  return auditLogs;
}

export { saveAuditLog, getAuditLogs };
