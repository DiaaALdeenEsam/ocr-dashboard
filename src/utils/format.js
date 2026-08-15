export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) {
    return '—';
  }
  const value = Number(bytes);
  if (value === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / Math.pow(1024, index);
  const decimals = index === 0 || size >= 10 ? 0 : 1;
  return `${size.toFixed(decimals)} ${units[index]}`;
}

export function userDisplayName(user = {}) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.name || user.username || 'Unknown user';
}

export function initialsOf(name = '') {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}
