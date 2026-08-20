const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const carName = "VOLKSWAGEN T-CROSS 1.0 200 TSI TOTAL FLEX AUTOMÁTICO";
const normalizedCarName = normalizeString(carName);

const key = "VOLKSWAGEN T-CROSS 1.0 200 TSI TOTAL FLEX AUTOMÁTICO";
const normalizedKey = normalizeString(key);

console.log(normalizedCarName, normalizedKey);
console.log(normalizedCarName.includes(normalizedKey));
