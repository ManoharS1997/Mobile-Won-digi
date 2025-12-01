import React, { useEffect, useState } from "react";
import { View, TextInput, Text, TouchableOpacity, Platform } from "react-native";
import CustomDropdown from "../common/CustomDropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";

const StepPersonal = ({ onNext, formData }: any) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [data, setData] = useState({
    student_id: formData.student_id || "",
    student_name: formData.student_name || "",
    student_gender: formData.student_gender || "",
    student_date_of_birth: formData.student_date_of_birth || "",
    student_contact: formData.student_contact || "",
    student_email: formData.student_email || "",
    student_status: formData.student_status || "",
  });

  useEffect(() => {
    setData((prev) => ({ ...prev, student_id: formData.student_id }));
  }, [formData.student_id]);

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "dd-MM-yyyy");
    setData((prev) => ({ ...prev, student_date_of_birth: dateStr }));
    setShowDatePicker(false);
  };

  useEffect(() => {
    if (data.student_contact.length === 10)
      setData((prev) => ({
        ...prev,
        student_contact: `91${data.student_contact}`,
      }));
  }, [data.student_contact]);

  return (
    <View>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} className="mb-2.5">
          <Text className="text-sm text-gray-700 mb-1 capitalize">
            {key.replace(/_/g, " ")}
          </Text>
          {key === "student_gender" ? (
            <CustomDropdown
              label=""
              value={value}
              onChange={(text: any) =>
                setData((prev) => ({ ...prev, [key]: text }))
              }
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
            />
          ) : key === "student_status" ? (
            <CustomDropdown
              label=""
              value={value}
              onChange={(text: any) =>
                setData((prev) => ({ ...prev, [key]: text }))
              }
              options={[
                { label: "active", value: "active" },
                { label: "inactive", value: "inactive" },
              ]}
            />
          ) : key === "student_date_of_birth" ? (
            <>
              <TouchableOpacity
                className="w-full h-12 px-5 bg-white text-black rounded-lg border border-gray-300 flex-row items-center justify-between"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-gray-700">
                  {value || "Select Date of Birth"}
                </Text>
                <Feather name="calendar" size={20} color="#026902" />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={() => setShowDatePicker(false)}
                themeVariant="light"
                pickerContainerStyleIOS={{ backgroundColor: "white" }}
                buttonTextColorIOS="#026902"
                customCancelButtonIOS={() => (
                  <TouchableOpacity
                    className="bg-red-500 p-5 rounded-2xl items-center"
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text className="text-white font-semibold ">Cancel</Text>
                  </TouchableOpacity>
                )}
                customHeaderIOS={() => (
                  <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
                    <Text className="text-lg font-semibold text-primary">
                      Select date of birth
                    </Text>
                  </View>
                )}
              />
            </>
          ) : (
            <TextInput
              editable={key !== "student_id"}
              className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
              value={value}
              style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
              onChangeText={(text) =>
                setData((prev) => ({ ...prev, [key]: text }))
              }
              maxLength={key === "student_contact" ? 12 : undefined}
              keyboardType={key === "student_contact" ? "numeric" : "default"}
            />
          )}
        </View>
      ))}
      <TouchableOpacity
        className="bg-green-700 py-3 rounded-md mt-3"
        onPress={() => {
          onNext(data);
        }}
      >
        <Text className="text-white text-center font-semibold">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StepPersonal;
