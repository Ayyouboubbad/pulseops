import axios from 'axios';
import { performance } from 'perf_hooks';

/**
 * Perform an HTTP / HTTPS check on a target URL
 * @param {string} url - Target URL
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<{ status: 'UP' | 'DOWN', statusCode: number | null, responseTimeMs: number, errorMessage: string | null }>}
 */
export const checkHttp = async (url, timeoutMs = 10000) => {
  const startTime = performance.now();

  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
      // Accept any status code so we can inspect 4xx, 5xx without throwing Axios error
      validateStatus: () => true,
      headers: {
        'User-Agent': 'PulseOps-Monitoring-Bot/1.0 (+https://pulseops.dev)',
        'Accept': '*/*'
      },
      maxRedirects: 5
    });

    const responseTimeMs = Math.round(performance.now() - startTime);
    const statusCode = response.status;
    const isUp = statusCode >= 200 && statusCode < 400;

    return {
      status: isUp ? 'UP' : 'DOWN',
      statusCode,
      responseTimeMs,
      errorMessage: isUp ? null : `HTTP status code ${statusCode}`
    };
  } catch (error) {
    const responseTimeMs = Math.round(performance.now() - startTime);

    let errorMessage = error.message;
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = `Request timed out after ${timeoutMs}ms`;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS lookup failed (Domain not found)';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused by target server';
    }

    return {
      status: 'DOWN',
      statusCode: null,
      responseTimeMs,
      errorMessage
    };
  }
};
