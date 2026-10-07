import axios from 'axios';

/**
 * Send a rich embed alert via Discord Webhook
 * @param {string} webhookUrl - Discord Webhook URL
 * @param {Object} embed - Discord Embed object
 */
export const sendDiscordAlert = async (webhookUrl, embed) => {
  if (!webhookUrl) {
    return false;
  }

  try {
    await axios.post(webhookUrl, {
      username: 'PulseOps Bot',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3593/3593452.png',
      embeds: [embed]
    }, { timeout: 5000 });

    console.log(`📨 [Discord] Alert delivered via Webhook`);
    return true;
  } catch (error) {
    console.error('❌ [Discord] Delivery failed:', error.response?.data || error.message);
    return false;
  }
};
