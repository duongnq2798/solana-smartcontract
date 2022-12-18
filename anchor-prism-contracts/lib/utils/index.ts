const numbers: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const generateId = (): number => {
  const maxCharacters = 15;
  var id = "";
  while (id.length < maxCharacters) {
    id += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return Number(id);
};

export const generateOrderId = (): number => {
  return Number(generateId());
};

export const generateProductId = (): number => {
  return Number(generateId());
};
