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
