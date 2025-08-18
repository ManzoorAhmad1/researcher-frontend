import React, { useState ,FC } from 'react';
import Select,{SingleValue } from 'react-select';
import makeAnimated from 'react-select/animated';

interface OptionType {
   label: string;
   value: string;
 }

interface SelectUserProps {
   options: OptionType[];
   value: SingleValue<OptionType[]> | null;
   handleChange: any;
   placeholder:string;
   closeMenuOnSelect?:boolean;
   isSearchable?:boolean;
 }

 
const fakeData = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

const SelectUser: FC<SelectUserProps> = ({ options = fakeData, value, handleChange, placeholder, closeMenuOnSelect = true, isSearchable = true }) => {

  return (
    <Select
      closeMenuOnSelect={closeMenuOnSelect}
      components={makeAnimated()}
      isClearable
      isMulti
      onChange={handleChange}
      value={value}
      options={options}
      placeholder={placeholder}
      isSearchable={isSearchable}
      getOptionLabel={(e) => e.label}
      formatOptionLabel={(e) => (
        <div title={e.label}>
          {e.label}
        </div>
      )}
    />
  );
};

export default SelectUser;
