/**
 * Helper utility to manage persistent notifications using localStorage and reactive window events
 */

const STORAGE_KEY = 'ifesporte_notifications';

export const getNotifications = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao buscar notificações:', e);
    return [];
  }
};

export const addNotification = (title, message, type = 'info') => {
  try {
    const list = getNotifications();
    const newNotif = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      title,
      message,
      type,
      date: new Date().toISOString(),
      unread: true
    };
    const updated = [newNotif, ...list].slice(0, 50); // Keep max 50 recent notifications
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('notifications_updated'));
    return newNotif;
  } catch (e) {
    console.error('Erro ao adicionar notificação:', e);
  }
};

export const markAllAsRead = () => {
  try {
    const list = getNotifications();
    const updated = list.map(n => ({ ...n, unread: false }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('notifications_updated'));
  } catch (e) {
    console.error('Erro ao marcar notificações como lidas:', e);
  }
};

export const clearNotifications = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('notifications_updated'));
  } catch (e) {
    console.error('Erro ao limpar notificações:', e);
  }
};

export const getUnreadCount = () => {
  const list = getNotifications();
  return list.filter(n => n.unread).length;
};
