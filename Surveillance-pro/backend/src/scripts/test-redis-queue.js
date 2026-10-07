import { redisClient, checkRedisHealth } from '../config/redis.js';
import { monitorQueue, addImmediateCheck, getQueueMetrics } from '../queues/monitor.queue.js';

console.log('🔍 [Test] Démarrage du diagnostic Redis & BullMQ...\n');

const runDiagnostic = async () => {
  try {
    // 1. Test Redis Ping
    console.log('1️⃣ Test de la connexion Redis...');
    const redisHealth = await checkRedisHealth();
    console.log('   Statut Redis:', redisHealth.status);
    console.log('   Latence Redis:', redisHealth.latencyMs, 'ms\n');

    if (redisHealth.status !== 'healthy') {
      throw new Error(`Redis non disponible: ${redisHealth.error || 'Statut dégradé'}`);
    }

    // 2. Test BullMQ Queue
    console.log('2️⃣ Test d\'injection d\'un job dans BullMQ...');
    const dummyMonitor = {
      id: 'diagnostic-' + Date.now(),
      url: 'https://httpbin.org/status/200',
      type: 'http',
      timeout: 3000
    };

    const job = await addImmediateCheck(dummyMonitor);
    console.log(`   ✅ Job BullMQ créé avec succès !`);
    console.log(`   Job ID: ${job.id}`);
    console.log(`   Queue: ${job.queueName}\n`);

    // 3. Métriques de la file
    console.log('3️⃣ Récupération des métriques de la file d\'attente...');
    const metrics = await getQueueMetrics();
    console.log('   Métriques:', JSON.stringify(metrics.counts, null, 2));

    console.log('\n🎉 [SUCCÈS] Redis et BullMQ fonctionnent parfaitement !');
  } catch (error) {
    console.error('\n❌ [ÉCHEC]', error.message);
    console.info('💡 Note: Assurez-vous que le conteneur Redis tourne (`docker compose up -d redis`).');
  } finally {
    await monitorQueue.close();
    await redisClient.quit();
    process.exit(0);
  }
};

runDiagnostic();
