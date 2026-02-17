// export const formatDateWithOffset = () => {
//   const now = new Date();

//   // Get timezone offset in ±HH:MM
//   const offsetMinutes = now.getTimezoneOffset();
//   const sign = offsetMinutes > 0 ? "-" : "+";
//   const absOffset = Math.abs(offsetMinutes);
//   const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
//   const minutes = String(absOffset % 60).padStart(2, "0");

//   // Format: YYYY-MM-DDTHH:mm:ss±HH:MM
//   const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
//     now.getDate()
//   ).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(
//     now.getMinutes()
//   ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}${sign}${hours}:${minutes}`;

//   return formatted;
// };

export function formatDateWithOffset(date = new Date()) {
  const pad = (n, z = 2) => String(n).padStart(z, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds(), 3);

  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}:${offsetMinutes}`;
}

export function formatDateWithZRTP(date = new Date()) {
  const pad = (n, z = 2) => String(n).padStart(z, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  const milliseconds = pad(date.getUTCMilliseconds(), 3);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
}