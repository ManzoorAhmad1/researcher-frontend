import { format } from "date-fns";
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "dd.MM.yyyy HH:mm");
};

export const formatTableDate = (date: string) => {
  const new_date = new Date(date);

  const formattedDate = new_date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return formattedDate;
};

export function timeSinceUpdated(dateString: string) {
  const givenDate: any = new Date(dateString);
  const currentDate: any = new Date();

  const timeDifference = currentDate - givenDate;

  const totalSeconds = Math.floor(timeDifference / 1000);

  if (totalSeconds < 60) {
    const seconds = totalSeconds < 0 ? 0 : totalSeconds;
    return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} ${totalMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours} ${totalHours === 1 ? "hour" : "hours"} ago`;
  }

  const totalDays = Math.floor(totalHours / 24);
  return `${totalDays} ${totalDays === 1 ? "day" : "days"} ago`;
}
