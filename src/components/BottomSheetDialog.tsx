import React from 'react';
import { View, TouchableWithoutFeedback, Modal } from 'react-native';

interface BottomSheetDialogProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheetDialog: React.FC<BottomSheetDialogProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          <TouchableWithoutFeedback>
            <View className="bg-white dark:bg-gray-800 rounded-t-xl p-4 w-full max-h-[80%]">
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomSheetDialog;
