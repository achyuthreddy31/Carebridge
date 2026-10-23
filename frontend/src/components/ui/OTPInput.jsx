import React, { useRef, useEffect } from 'react';
import './OTPInput.css';

export const OTPInput = ({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^[0-9]*$/.test(val)) return;

    const newDigits = value.split('');
    // Fill up to length
    while (newDigits.length < length) newDigits.push('');

    if (val.length > 0) {
      newDigits[index] = val[val.length - 1]; // take the last entered char
      onChange(newDigits.join('').slice(0, length));
      // Focus next box
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      newDigits[index] = '';
      onChange(newDigits.join('').slice(0, length));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
    }
  };

  return (
    <div className={`curasync-otp-container ${error ? 'curasync-otp-container--error' : ''}`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="curasync-otp-box"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};
