import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { GetService } from "@/services/studentServices";
import { useAuth } from "@/context/AuthContext";
import CustomDropdown from "../common/CustomDropdown";
import { ActivityIndicator } from "react-native-paper";

type OptionType = { label: string; value: string };

const StepEnrollment = ({
  onNext,
  onBack,
  formData,
  setFormData,
  isModalSpinnerVisible,
}: any) => {
  const { auth } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [servicesData, setServicesData] = useState([]);

  const [data, setData] = useState({
    student_class: formData.student_class || "",
    student_section: formData.student_section || "",
    student_roll: formData.student_roll || "",
    student_preffered_date: formData.student_preffered_date || "",
    student_medical: formData.student_medical || "",
    student_specify: formData.student_specify || "",
    student_services: formData.student_specify || [],
  });

  const fetchServicesEntries = async () => {
    const response = await GetService(auth.roleId || "");
    let entries = response.data.services;

    const structuredData = entries.map((service: any) => ({
      value: service.service_id,
      label: `${service.service_id} - ${service.service_name} - ${service.service_class}`,
    }));

    setServicesData(structuredData);
  };

  useEffect(() => {
    fetchServicesEntries();
  }, [auth.roleId]);

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "dd-MM-yyyy");
    setData((prev) => ({ ...prev, student_preffered_date: dateStr }));
    setShowDatePicker(false);
  };

  const dropdownFields: Record<string, OptionType[]> = {
    student_class: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ].map((cls) => ({
      label: `Class ${cls}`,
      value: `Class ${cls}`,
    })),
    student_section: ["A", "B", "C", "D", "E"].map((sec) => ({
      label: sec,
      value: sec,
    })),
  };

  useEffect(() => {
    setFormData({
      ...formData,
      student_class: data.student_class || "",
      student_section: data.student_section || "",
      student_roll: data.student_roll || "",
      student_preffered_date: data.student_preffered_date || "",
      student_medical: data.student_medical || "",
      student_specify: data.student_specify || "",
      student_services: data.student_services || [],
    });
  }, [data]);

  return (
    <View>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} className="mb-2.5">
          <Text className="text-sm text-gray-700 mb-1 capitalize">
            {key.replace(/_/g, " ")}
          </Text>
          {key === "student_preffered_date" ? (
            <TouchableOpacity
              className="border h-12 border-gray-300 rounded-md px-3 text-base text-black flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{value || "Select Date"}</Text>
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
                      Select date
                    </Text>
                  </View>
                )}
              />
            </TouchableOpacity>
          ) : dropdownFields[key] ? (
            <CustomDropdown
              label=""
              value={value}
              onChange={(text) => setData((prev) => ({ ...prev, [key]: text }))}
              options={dropdownFields[key]}
            />
          ) : key === "student_services" ? (
            <CustomDropdown
              label=""
              value={value}
              onChange={(selected: any[]) =>
                setData((prev) => ({
                  ...prev,
                  student_services: selected.map(
                    (item: string) => item.split(" - ")[0]
                  ),
                }))
              }
              options={servicesData || []}
              multiple
            />
          ) : (
            <TextInput
              className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
              value={value}
              style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
              onChangeText={(text) =>
                setData((prev) => ({ ...prev, [key]: text }))
              }
              autoCapitalize={key === "student_roll" ? "characters" : "none"}
            />
          )}
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
          {isModalSpinnerVisible ? (
            <ActivityIndicator size={15} color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepEnrollment;
