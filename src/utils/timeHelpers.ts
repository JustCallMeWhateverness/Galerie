export function getRemainingTimeMessage(endTime: Date): string {
  const currentTime = new Date();
  const timeDifferenceMilli: number = endTime.getTime() - currentTime.getTime();

  if (timeDifferenceMilli < 0) {
    return "Auction has finished";
  }

  const remainingSeconds = Math.floor(timeDifferenceMilli / 1000);
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingDays = Math.floor(remainingHours / 24);

  if (remainingDays > 0) {
    return `${remainingDays} days`;
  } else if (remainingHours > 0) {
    return `${remainingHours} hours`;
  } else if (remainingMinutes > 0) {
    return `${remainingMinutes} minutes`;
  } else {
    return `${remainingSeconds} seconds`;
  }
}
