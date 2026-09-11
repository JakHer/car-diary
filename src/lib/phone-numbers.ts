export const getTelephoneHref = (phoneNumber: string): string => {
  const normalizedNumber = phoneNumber
    .trim()
    .replace(/[^\d+]/g, '')
    .replace(/(?!^)\+/g, '')

  return `tel:${normalizedNumber}`
}
