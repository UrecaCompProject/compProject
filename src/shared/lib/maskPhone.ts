export function maskPhone(phone: string) {
  const digits = phone.replace(/-/g, '');
  if (digits.length < 7) return digits;
  return `${digits.slice(0, 3)}-${'*'.repeat(digits.length - 7)}-${digits.slice(-4)}`;
}
