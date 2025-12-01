import React, { useEffect, useState } from "react";
import { View, TextInput, Text, TouchableOpacity, Platform } from "react-native";

const StepGuardian = ({ onNext, onBack, formData }: any) => {
  const [data, setData] = useState({
    student_guardian_name: formData.student_guardian_name || "",
    relation_to_student: formData.relation_to_student || "",
    student_guardian_contact: formData.student_guardian_contact || "",
    parent_occupation: formData.parent_occupation || "",
    student_emergency_gurdian: formData.student_emergency_gurdian || "",
    student_emergency_relation: formData.student_emergency_relation || "",
    student_emergency_contact: formData.student_emergency_contact || "",
  });

  useEffect(() => {
    setData((prev) => {
      const updated = { ...prev };
      if (
        prev.student_guardian_contact.length === 10 &&
        !prev.student_guardian_contact.startsWith("91")
      ) {
        updated.student_guardian_contact = `91${prev.student_guardian_contact}`;
      }
      if (
        prev.student_emergency_contact.length === 10 &&
        !prev.student_emergency_contact.startsWith("91")
      ) {
        updated.student_emergency_contact = `91${prev.student_emergency_contact}`;
      }
      return updated;
    });
  }, [data.student_guardian_contact, data.student_emergency_contact]);

  return (
    <View>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} className="mb-2.5">
          <Text className="text-sm text-gray-700 mb-1 capitalize">
            {key.replace(/_/g, " ")}
          </Text>
          <TextInput
            className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
            style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
            value={value}
            onChangeText={(text) =>
              setData((prev) => ({ ...prev, [key]: text }))
            }
            maxLength={
              ["student_guardian_contact", "student_emergency_contact"].includes(key)
                ? 12
                : undefined
            }
            keyboardType={
              ["student_guardian_contact", "student_emergency_contact"].includes(key)
                ? "numeric"
                : "default"
            }
          />
        </View>
      ))}
      <View className="flex-row justify-between w-full">
        <TouchableOpacity
          className="bg-gray-400 py-3 px-10 rounded-md mt-3"
          onPress={onBack}
        >
          <Text className="text-white text-center font-semibold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-700 py-3 px-10 rounded-md mt-3"
          onPress={() => {
            onNext(data);
          }}
        >
          <Text className="text-white text-center font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepGuardian;
