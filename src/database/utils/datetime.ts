export const getCurrentDateTime = (): { date: string; time: string } => {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0]; // HH:MM:SS
  return { date, time };
};