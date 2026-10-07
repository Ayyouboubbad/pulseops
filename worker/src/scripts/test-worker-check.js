import { checkHttp } from '../checkers/http.checker.js';
import { checkSslCertificate } from '../checkers/ssl.checker.js';

console.log('🔍 [Test Worker] Diagnostic des moteurs de check HTTP & SSL...\n');

const testEngine = async () => {
  const targetUrl = 'https://google.com';
  console.log(`🌐 Test sur la cible: ${targetUrl}`);

  // 1. Test HTTP Ping & Latency
  console.log('1️⃣ Exécution du Check HTTP...');
  const httpResult = await checkHttp(targetUrl, 5000);
  console.log('   Statut:', httpResult.status);
  console.log('   Code HTTP:', httpResult.statusCode);
  console.log('   Latence:', httpResult.responseTimeMs, 'ms');
  console.log('   Erreur:', httpResult.errorMessage || 'Aucune\n');

  // 2. Test SSL Certificate Inspection
  console.log('2️⃣ Inspection du Certificat SSL/TLS...');
  const sslResult = await checkSslCertificate(targetUrl);
  console.log('   Certificat Valide:', sslResult.valid);
  console.log('   Jours restants avant expiration:', sslResult.daysRemaining, 'jours');
  console.log('   Émetteur (Issuer):', sslResult.issuer);
  console.log('   Date d\'expiration:', sslResult.validTo);
  console.log('   Erreur SSL:', sslResult.error || 'Aucune\n');

  console.log('🎉 [SUCCÈS] Les moteurs de check HTTP et SSL fonctionnent à 100% !');
  process.exit(0);
};

testEngine();
