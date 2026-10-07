import { sendTelegramAlert } from '../notifiers/telegram.notifier.js';
import { sendDiscordAlert } from '../notifiers/discord.notifier.js';
import dotenv from 'dotenv';

dotenv.config();

const GLOBAL_TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GLOBAL_TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GLOBAL_DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

/**
 * Handle alert dispatching on status transitions (UP -> DOWN or DOWN -> UP)
 */
export const dispatchAlertsIfNeeded = async (monitor, previousStatus, checkResult) => {
  const isDownIncident = previousStatus !== 'DOWN' && checkResult.status === 'DOWN';
  const isRecovery = previousStatus === 'DOWN' && checkResult.status === 'UP';

  if (!isDownIncident && !isRecovery) {
    return; // No status transition, avoid alert spamming
  }

  const telegramToken = GLOBAL_TELEGRAM_TOKEN;
  const telegramChatId = monitor.alertConfig?.telegram?.chatId || GLOBAL_TELEGRAM_CHAT_ID;
  const discordWebhook = monitor.alertConfig?.discord?.webhookUrl || GLOBAL_DISCORD_WEBHOOK;

  const now = new Date().toISOString();

  if (isDownIncident) {
    console.warn(`🚨 [ALERT] Monitor '${monitor.name}' is DOWN! Cause: ${checkResult.errorMessage || 'Check failed'}`);

    // Telegram HTML Format
    const tgMessage = `
🚨 <b>[PulseOps ALERT] Le service est DOWN</b>
━━━━━━━━━━━━━━━━━━
🎯 <b>Cible:</b> ${monitor.name}
🌐 <b>URL:</b> <code>${monitor.url}</code>
⚠️ <b>Erreur:</b> ${checkResult.errorMessage || 'Timeout'}
⏱️ <b>Latence:</b> ${checkResult.responseTimeMs} ms
🕒 <b>Horodatage:</b> ${now}
    `.trim();

    // Discord Embed Format
    const discordEmbed = {
      title: `🚨 [ALERT] ${monitor.name} is DOWN`,
      description: `La cible ne répond plus aux sondes de surveillance.`,
      color: 0xE74C3C, // Rouge
      fields: [
        { name: 'URL', value: monitor.url, inline: true },
        { name: 'Erreur', value: checkResult.errorMessage || 'Inconnue', inline: true },
        { name: 'Latence', value: `${checkResult.responseTimeMs} ms`, inline: true },
        { name: 'Code HTTP', value: checkResult.statusCode ? `${checkResult.statusCode}` : 'N/A', inline: true }
      ],
      timestamp: now,
      footer: { text: 'PulseOps Alert Engine' }
    };

    if (telegramToken && telegramChatId) {
      await sendTelegramAlert(telegramToken, telegramChatId, tgMessage);
    }
    if (discordWebhook) {
      await sendDiscordAlert(discordWebhook, discordEmbed);
    }
  }

  if (isRecovery) {
    console.log(`✅ [RECOVERY] Monitor '${monitor.name}' is back UP!`);

    // Telegram HTML Format
    const tgMessage = `
✅ <b>[PulseOps RECOVERY] Le service est RÉTABLI</b>
━━━━━━━━━━━━━━━━━━
🎯 <b>Cible:</b> ${monitor.name}
🌐 <b>URL:</b> <code>${monitor.url}</code>
⏱️ <b>Latence:</b> ${checkResult.responseTimeMs} ms
🕒 <b>Horodatage:</b> ${now}
    `.trim();

    // Discord Embed Format
    const discordEmbed = {
      title: `✅ [RECOVERY] ${monitor.name} is UP`,
      description: `Le service est de nouveau opérationnel et répond normalement.`,
      color: 0x2ECC71, // Vert
      fields: [
        { name: 'URL', value: monitor.url, inline: true },
        { name: 'Code HTTP', value: `${checkResult.statusCode || 200}`, inline: true },
        { name: 'Latence', value: `${checkResult.responseTimeMs} ms`, inline: true }
      ],
      timestamp: now,
      footer: { text: 'PulseOps Recovery Engine' }
    };

    if (telegramToken && telegramChatId) {
      await sendTelegramAlert(telegramToken, telegramChatId, tgMessage);
    }
    if (discordWebhook) {
      await sendDiscordAlert(discordWebhook, discordEmbed);
    }
  }
};
