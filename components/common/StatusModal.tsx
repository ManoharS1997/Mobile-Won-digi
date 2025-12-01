import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  status: "success" | "error";
  message: string;
  onClose: () => void;
}

const screenWidth = Dimensions.get("window").width;
const containerWidth =
  screenWidth >= 1024 ? "40%" : screenWidth >= 768 ? "60%" : "80%";

const StatusModal: React.FC<Props> = ({
  visible,
  status,
  message,
  onClose,
}) => {
  const isSuccess = status === "success";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/40">
        <View
          style={{ width: containerWidth }}
          className="w-4/5 bg-white rounded-2xl p-6 items-center shadow-lg"
        >
          <View
            className={`p-3 rounded-full mb-3 ${
              isSuccess ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Ionicons
              name={isSuccess ? "checkmark-circle" : "close-circle"}
              size={60}
              color={isSuccess ? "#16a34a" : "#dc2626"}
            />
          </View>

          <Text className="text-xl font-bold text-gray-800 mb-1">
            {isSuccess ? "Success" : "Error"}
          </Text>
          <Text className="text-center text-base text-gray-600 mb-5">
            {message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className={`px-6 py-3 rounded-xl ${
              isSuccess ? "bg-green-600" : "bg-red-600"
            }`}
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold text-base">Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StatusModal;
