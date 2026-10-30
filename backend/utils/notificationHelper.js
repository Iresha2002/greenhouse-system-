const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  linkTab = 'consultations',
  referenceId = ''
}) => {
  try {
    if (!recipient || !type || !title || !message) return null;
    const notif = await Notification.create({
      recipient,
      type,
      title: String(title).trim(),
      message: String(message).trim(),
      linkTab,
      referenceId: String(referenceId || '')
    });
    return notif;
  } catch (err) {
    console.error('Create notification error:', err.message);
    return null;
  }
};

module.exports = { createNotification };
