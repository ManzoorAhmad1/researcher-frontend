export function convertToTimestamp(relativeDate: string) {
  const now = new Date();
  const [quantity, unit] = relativeDate.split(" ");
  const amount = parseInt(quantity);

  switch (unit) {
    case "hour":
    case "hours":
      return new Date(now.getTime() - amount * 60 * 60 * 1000).getTime();
    case "day":
    case "days":
      return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000).getTime();
    case "week":
    case "weeks":
      return new Date(
        now.getTime() - amount * 7 * 24 * 60 * 60 * 1000
      ).getTime();
    case "month":
    case "months":
      return new Date(now.setMonth(now.getMonth() - amount)).getTime();
    case "year":
    case "years":
      return new Date(now.setFullYear(now.getFullYear() - amount)).getTime();
    default:
      return now.getTime();
  }
}
