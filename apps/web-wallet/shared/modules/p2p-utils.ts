export function maskCardNumber(cardNumber: string) {
  // Define the number of visible digits at the beginning and end
  const visibleDigits = 4;

  // Create the masked card number with asterisks
  const maskedPart = '**** ';
  const visibleEnd = cardNumber.substr(-visibleDigits);

  // Combine and return the masked card number
  const maskedCardNumber = maskedPart + visibleEnd;
  return maskedCardNumber;
}
