import React from 'react';
import { Modal, View, Text, Pressable, TouchableWithoutFeedback } from 'react-native';
import { dropdown } from '../styles/theme';

interface DropdownMenuProps {
  isVisible: boolean;
  onClose: () => void;
  options: { label: string; onPress: () => void }[];
  anchorPosition: { top: number; left: number };
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isVisible,
  onClose,
  options,
  anchorPosition,
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, position: 'relative' }}>
          <View
            className={dropdown.container}
            style={{
              position: 'absolute',
              top: anchorPosition.top,
              left: anchorPosition.left,
              minWidth: 150, // Adjust as needed
            }}
          >
            {options.map((option, index) => (
              <Pressable
                key={index}
                className={dropdown.item}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
              >
                <Text className={dropdown.itemText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DropdownMenu;
