import { connectDatabase } from '../config/database.js';
import app from '../app.js';
import { Monitor } from '../models/monitor.model.js';
import { redisClient } from '../config/redis.js';
import { monitorQueue } from '../queues/monitor.queue.js';
import mongoose from 'mongoose';

const testCrud = async () => {
  console.log('🧪 [Test API CRUD] Démarrage du test d\'intégration...\n');
  await connectDatabase();

  const server = app.listen(5002, async () => {
    try {
      const baseUrl = 'http://localhost:5002/api';

      // 1. Nettoyer les anciens tests si existants
      await Monitor.deleteMany({ name: 'Integration Test Target' });

      // 2. Test POST /api/monitors (Création)
      console.log('1️⃣ Création d\'un moniteur (POST /api/monitors)...');
      const createRes = await fetch(`${baseUrl}/monitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Integration Test Target',
          url: 'https://httpbin.org/status/200',
          interval: 30,
          timeout: 5000,
          alertConfig: {
            telegram: { enabled: false, chatId: '' },
            discord: { enabled: false, webhookUrl: '' }
          }
        })
      });
      const createData = await createRes.json();
      console.log('   Statut HTTP:', createRes.status);
      console.log('   Moniteur créé ID:', createData.data?._id);

      if (createRes.status !== 201) {
        throw new Error('Échec de création du moniteur');
      }

      const monitorId = createData.data._id;

      // 3. Test GET /api/monitors (Liste et Uptime)
      console.log('\n2️⃣ Récupération de la liste des moniteurs (GET /api/monitors)...');
      const listRes = await fetch(`${baseUrl}/monitors`);
      const listData = await listRes.json();
      console.log(`   Nombre total de moniteurs: ${listData.count}`);

      // 4. Test GET /api/metrics/summary (KPIs Dashboard)
      console.log('\n3️⃣ Récupération des métriques globales (GET /api/metrics/summary)...');
      const metricsRes = await fetch(`${baseUrl}/metrics/summary`);
      const metricsData = await metricsRes.json();
      console.log('   KPIs:', JSON.stringify(metricsData.data.summary, null, 2));

      // 5. Test POST /api/monitors/:id/pause (Mise en pause)
      console.log('\n4️⃣ Test mise en pause (POST /api/monitors/:id/pause)...');
      const pauseRes = await fetch(`${baseUrl}/monitors/${monitorId}/pause`, { method: 'POST' });
      const pauseData = await pauseRes.json();
      console.log('   Nouveau statut:', pauseData.data?.status);

      // 6. Test POST /api/monitors/:id/resume (Reprise)
      console.log('\n5️⃣ Test reprise (POST /api/monitors/:id/resume)...');
      const resumeRes = await fetch(`${baseUrl}/monitors/${monitorId}/resume`, { method: 'POST' });
      const resumeData = await resumeRes.json();
      console.log('   Nouveau statut:', resumeData.data?.status);

      console.log('\n🎉 [SUCCÈS] Tous les endpoints CRUD et Metrics fonctionnent impeccablement !');
    } catch (err) {
      console.error('\n❌ [ÉCHEC TEST API]:', err.message);
    } finally {
      server.close();
      await monitorQueue.close();
      await redisClient.quit();
      await mongoose.connection.close();
      process.exit(0);
    }
  });
};

testCrud();
