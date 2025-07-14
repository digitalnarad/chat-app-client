export function parseTimeAndDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();

  // Format time: "2:05 PM"
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
  const time = date.toLocaleTimeString("en-US", timeOptions);

  // Check date difference
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  // Format date: "Yesterday", "Today", or "Jul 10"
  let dateLabel;
  if (isToday) {
    dateLabel = time; // Use time for today
  } else if (isYesterday) {
    dateLabel = "Yesterday";
  } else {
    const dateOptions = { month: "short", day: "numeric" };
    dateLabel = date.toLocaleDateString("en-US", dateOptions);
  }

  return dateLabel;
}
