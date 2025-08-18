import React, { useRef } from 'react';
import { Filter } from "lucide-react";

interface CustomInputProps {
  onClick?: () => void;
}
const ExampleCustomInput = ({ onClick }: CustomInputProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  return (
    <span ref={buttonRef} onClick={onClick}>
      <Filter width={15} height={15} style={{ marginLeft: '5px', marginTop: '5px' }} />
    </span>);
};

export default ExampleCustomInput;