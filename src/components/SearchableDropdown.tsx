import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import { form, dropdown } from '../styles/theme';

export interface DropdownItem {
  label: string;
  value: any;
}

interface SearchableDropdownProps {
  data: DropdownItem[];
  value: any; // The selected value (ID)
  onChange: (value: any) => void; // Function to call when an item is selected
  placeholder?: string;
}

export default function SearchableDropdown({ data, value, onChange, placeholder }: SearchableDropdownProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredData, setFilteredData] = useState<DropdownItem[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (value) {
      const selectedItem = data.find(item => item.value === value);
      if (selectedItem) {
        setInputValue(selectedItem.label);
      }
    } else {
      setInputValue('');
    }
  }, [value, data]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text) {
      const filtered = data.filter(item =>
        item.label.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
      setDropdownVisible(true);
    } else {
      setFilteredData([]);
      setDropdownVisible(false);
    }
  };

  const handleSelectItem = (item: DropdownItem) => {
    setInputValue(item.label);
    onChange(item.value);
    setDropdownVisible(false);
  };

  return (
    <View style={{ zIndex: 1 }}>
      <TextInput
        className={form.textInput}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor="#9CA3AF"
        value={inputValue}
        onChangeText={handleInputChange}
        onFocus={() => setDropdownVisible(true)}
      />
      {isDropdownVisible && filteredData.length > 0 && (
        <View className={dropdown.container}>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={dropdown.item}
                onPress={() => handleSelectItem(item)}
              >
                <Text className={dropdown.itemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}