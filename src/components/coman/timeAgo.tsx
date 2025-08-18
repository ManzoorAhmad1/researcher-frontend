export function timeAgo(dateString: string, timeZone: string = "UTC") {
  const now = new Date();
  const pastDate = new Date(dateString);

  const nowInTimeZone = new Date(now.toLocaleString("en-US", { timeZone }));
  const pastDateInTimeZone = new Date(
    pastDate.toLocaleString("en-US", { timeZone })
  );

  const seconds = Math.floor(
    (nowInTimeZone.getTime() - pastDateInTimeZone.getTime()) / 1000
  );

  const years = Math.floor(seconds / (60 * 60 * 24 * 365));
  const months = Math.floor(seconds / (60 * 60 * 24 * 30));
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor(seconds / (60 * 60));
  const minutes = Math.floor(seconds / 60);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;

  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;

  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
}
