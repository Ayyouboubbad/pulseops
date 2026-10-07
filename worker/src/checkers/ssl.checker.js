import tls from 'tls';
import { URL } from 'url';

/**
 * Inspect SSL / TLS certificate of an HTTPS target
 * @param {string} targetUrl
 * @param {number} timeoutMs
 * @returns {Promise<{ valid: boolean | null, daysRemaining: number | null, issuer: string | null, validTo: Date | null, error: string | null }>}
 */
export const checkSslCertificate = (targetUrl, timeoutMs = 8000) => {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      if (parsed.protocol !== 'https:') {
        return resolve({
          valid: null,
          daysRemaining: null,
          issuer: null,
          validTo: null,
          error: 'Not an HTTPS URL'
        });
      }

      const host = parsed.hostname;
      const port = parsed.port ? Number(parsed.port) : 443;

      const socket = tls.connect({
        host,
        port,
        servername: host, // Server Name Indication (SNI)
        rejectUnauthorized: false, // Don't throw immediately so we can inspect cert details
        timeout: timeoutMs
      }, () => {
        const cert = socket.getPeerCertificate();
        const isAuthorized = socket.authorized;
        socket.end();

        if (!cert || !cert.valid_to) {
          return resolve({
            valid: false,
            daysRemaining: 0,
            issuer: 'Unknown',
            validTo: null,
            error: 'No SSL certificate returned by host'
          });
        }

        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const diffMs = validTo.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const isValid = isAuthorized && daysRemaining > 0;
        const issuer = cert.issuer ? (cert.issuer.O || cert.issuer.CN || 'Unknown') : 'Unknown';

        resolve({
          valid: isValid,
          daysRemaining,
          issuer,
          validTo,
          error: socket.authorizationError ? socket.authorizationError.message : (daysRemaining <= 0 ? 'Certificate has expired' : null)
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          valid: false,
          daysRemaining: null,
          issuer: null,
          validTo: null,
          error: `SSL handshake timed out (${timeoutMs}ms)`
        });
      });

      socket.on('error', (err) => {
        resolve({
          valid: false,
          daysRemaining: null,
          issuer: null,
          validTo: null,
          error: err.message
        });
      });
    } catch (err) {
      resolve({
        valid: false,
        daysRemaining: null,
        issuer: null,
        validTo: null,
        error: err.message
      });
    }
  });
};
