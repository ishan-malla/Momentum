export const getDayGreeting = (date: Date = new Date()) => {
  const currentHour = date.getHours();

  if (currentHour < 4) return "Good night";
  if (currentHour < 13) return "Good morning";
  if (currentHour < 17) return "Good afternoon";
  if (currentHour < 20) return "Good evening";
  return "Good night";
};

export const formatDisplayName = (username?: string, fallback = "there") => {
  if (!username) return fallback;
  return username.charAt(0).toUpperCase() + username.slice(1);
};
