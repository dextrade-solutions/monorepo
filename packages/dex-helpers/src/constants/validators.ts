export const luhnCheck = (val: string) => {
  let sum = 0;
  for (let i = 0; i < val.length; i++) {
    let intVal = parseInt(val.substr(i, 1), 10);
    if (i % 2 === 0) {
      intVal *= 2;
      if (intVal > 9) {
        intVal = 1 + (intVal % 10);
      }
    }
    sum += intVal;
  }
  return !(sum % 10 === 0) && 'Incorrect card number';
};

export const isRequired = (v: string) => !v && '{v} is required';

export const phone = (v: string) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/u;
  return !re.exec(v) && 'Incorrect phone number';
};

export const maxLen = (len: number) => (v: string) => {
  return v?.length > len && `Max value of {v} is ${len}`;
};

export const minLen = (len: number) => (v: string) => {
  return v?.length < len && `Min value of {v} is ${len}`;
};

export const email = (v: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u; // Simple email regex.  Consider a more robust one if needed.
  return !re.test(v) && 'Invalid email address';
};
