// components/ActionButton.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";

const ActionButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      className="bg-primary px-4 py-3 rounded-2xl"
      onPress={onPress}
    >
      <Text className="text-white text-sm font-semibold">{label}</Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
