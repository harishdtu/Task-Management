import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy');
  } catch { return '—'; }
};

export const formatRelative = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true });
  } catch { return ''; }
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return isPast(typeof dueDate === 'string' ? parseISO(dueDate) : dueDate);
};

export const getStatusLabel = (status) => {
  const map = { todo: 'To Do', 'in-progress': 'In Progress', 'in-review': 'In Review', done: 'Done' };
  return map[status] || status;
};

export const getPriorityDot = (priority) => {
  const map = { low: '🟢', medium: '🟡', high: '🔴', critical: '🚨' };
  return map[priority] || '⚪';
};

export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getProgressPercent = (total, done) => {
  if (!total) return 0;
  return Math.round((done / total) * 100);
};

export const STATUS_COLORS = {
  todo: '#4a4a6a',
  'in-progress': '#e8a020',
  'in-review': '#5b8def',
  done: '#27c97a',
};

export const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };