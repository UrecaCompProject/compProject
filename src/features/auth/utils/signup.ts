const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isValidBirth(birth: string) {
  if (!/^\d{6}$/.test(birth)) return false;
  const month = Number(birth.slice(2, 4));
  const day = Number(birth.slice(4, 6));
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= DAYS_IN_MONTH[month - 1];
}

export function isValidPhone(phone: string) {
  const digits = phone.replace(/-/g, '');
  return /^\d{10,11}$/.test(digits);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}

export function maskName(name: string) {
  return `${name[0]}***`;
}

export function maskBirth(birth: string) {
  return `${birth.slice(0, 2)}****`;
}
