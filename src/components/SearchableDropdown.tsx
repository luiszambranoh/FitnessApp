import React from 'react';
import { View } from 'react-native';
import Input from './Input';
import { form } from '../styles/theme';

interface SearchableDropdownProps {
  onSearch: (query: string) => void;
  placeholder: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ onSearch, placeholder }) => {
  return (
    <View className="mb-4">
      <Input
        className={form.textInput}
        placeholder={placeholder}
        onChangeText={onSearch}
      />
    </View>
  );
};

export default SearchableDropdown;
