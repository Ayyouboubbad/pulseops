import axios from 'axios';

/**
 * Send an alert message via Telegram Bot API
 * @param {string} token - Bot Token
 * @param {string} chatId - Target Chat ID
 * @param {string} message - Text message (HTML or Markdown)
 */
export const sendTelegramAlert = async (token, chatId, message) => {
  if (!token || !chatId) {
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    }, { timeout: 5000 });

    console.log(`📨 [Telegram] Alert delivered to chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error('❌ [Telegram] Delivery failed:', error.response?.data?.description || error.message);
    return false;
  }
};
