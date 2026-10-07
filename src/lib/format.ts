// Backend stores money in paise; this is the one place that knows that.
export const paiseToRupees = (paise: number) => paise / 100;
export const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);

export const formatMoney = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
