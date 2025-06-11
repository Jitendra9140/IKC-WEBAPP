/**
 * Fee structure for different classes and streams
 */
const feeStructure = {
  '11': {
    'science': 30000,
    'commerce': 20000
  },
  '12': {
    'science': 45000,
    'commerce': 40000
  }
};

/**
 * Get the total fees for a student based on class and stream
 * @param {string} classLevel - '11' or '12'
 * @param {string} stream - 'science' or 'commerce'
 * @returns {number} - Total fees amount
 */
const getTotalFees = (classLevel, stream) => {
  if (!feeStructure[classLevel] || !feeStructure[classLevel][stream]) {
    throw new Error(`Invalid class (${classLevel}) or stream (${stream})`);
  }
  
  return feeStructure[classLevel][stream];
};

/**
 * Calculate installment amount based on total fees and number of installments
 * @param {number} totalFees - Total fees amount
 * @param {number} totalInstallments - Number of installments
 * @param {number} installmentNumber - Current installment number (1-based)
 * @returns {number} - Installment amount
 */
const calculateInstallmentAmount = (totalFees, totalInstallments, installmentNumber) => {
  if (installmentNumber > totalInstallments) {
    throw new Error(`Invalid installment number: ${installmentNumber} exceeds total installments: ${totalInstallments}`);
  }
  
  // For simplicity, divide equally. You could implement more complex logic if needed
  // (e.g., first installment is 50%, remaining divided equally)
  return Math.ceil(totalFees / totalInstallments);
};

module.exports = {
  feeStructure,
  getTotalFees,
  calculateInstallmentAmount
};