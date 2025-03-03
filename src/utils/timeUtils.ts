
export const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
export const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
export const periods = ["AM", "PM"];

export const parseTime = (timeString: string) => {
  const matches = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!matches) return { hours: "12", minutes: "00", period: "AM" };
  
  const [, hours, mins, period] = matches;
  return {
    hours: hours,
    minutes: mins,
    period: period.toUpperCase()
  };
};

export const formatTime = (value: string) => {
  const cleanValue = value.replace(/[^\w\s]/g, "").toUpperCase();
  const matches = cleanValue.match(/(\d{1,2})(?:\s*:\s*(\d{1,2}))?\s*(AM|PM)?/i);
  
  if (!matches) return "12:00 AM";
  
  let [, hours, minutes = "00", period = ""] = matches;
  
  let numHours = parseInt(hours);
  if (numHours === 0) numHours = 12;
  if (numHours > 12) {
    numHours = numHours % 12;
    if (numHours === 0) numHours = 12;
    if (!period) period = "PM";
  }
  if (numHours === 12 && !period) period = "PM";
  
  const numMinutes = Math.min(parseInt(minutes) || 0, 59);
  
  if (!period) {
    period = "AM";
  }
  
  return `${numHours}:${numMinutes.toString().padStart(2, "0")} ${period}`;
};
