import { TextField } from '@mui/material';
import React, { useState, ChangeEvent } from 'react';

interface OtpInputProps {
  length: number;
  onChange: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length, onChange }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));

  const handleInputChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onChange(newOtp.join(''));
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {otp.map((digit, index) => (
        <TextField
          key={index}
          type="number"
          inputProps={{ maxLength: 1, style: { textAlign: 'center', width: 40 } }}
          value={digit}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(index, e.target.value)
          }
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};

export default OtpInput;
