import React, { useEffect, useState } from "react";
import { View, TextInput, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type TimetableItem = {
  id: string;
  school: string;
  class: string;
};

const StepEducation = ({ onNext, formData, onBack }: any) => {
  const [data, setData] = useState({
    student_previous_school: formData.student_previous_school || "",
  });

  const [timetable, setTimetable] = useState<TimetableItem[]>([
    {
      id: Date.now().toString(),
      school: "",
      class: "",
    },
  ]);

  useEffect(() => {
    setTimetable(formData.student_previous_school || []);
  }, [formData.student_previous_school]);

  const addTimetableItem = () => {
    setTimetable([
      ...timetable,
      {
        id: Date.now().toString(),
        school: "",
        class: "",
      },
    ]);
  };

  const updateTimetableItem = (
    index: number,
    field: keyof TimetableItem,
    value: string
  ) => {
    const updated = [...timetable];
    updated[index][field] = value;
    setTimetable(updated);
  };

  const deleteTimetableItem = (index: number) => {
    const updated = [...timetable];
    updated.splice(index, 1);
    setTimetable(updated);
  };

  useEffect(() => {
    setData((prev) => ({ ...prev, student_previous_school: timetable }));
  }, [timetable]);

  return (
    <View>
      {timetable.map((item, index) => (
        <View
          key={item.id || index}
          className="mb-4 border border-gray-300 p-3 rounded-md"
        >
          <View className="flex-row justify-between mb-2 w-full">
            <View className="w-[49%]">
              <Text className="text-sm text-gray-700 mb-1 capitalize">
                School
              </Text>
              <TextInput
                value={item.school}
                onChangeText={(text) =>
                  updateTimetableItem(index, "school", text)
                }
                style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                className="border h-12 border-gray-300 w-full rounded-md px-3 text-base text-black"
              />
            </View>
            <View className="w-[49%]">
              <Text className="text-sm text-gray-700 mb-1 capitalize">
                Class
              </Text>
              <TextInput
                value={item.class}
                onChangeText={(text) =>
                  updateTimetableItem(index, "class", text)
                }
                keyboardType="numeric"
                style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                className="border h-12 border-gray-300 w-full rounded-md px-3 text-base text-black"
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => deleteTimetableItem(index)}
            className="flex items-end"
          >
            <MaterialIcons name="delete" size={26} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addTimetableItem} className="mb-4">
        <Text className="text-green-600">+ Add Education</Text>
      </TouchableOpacity>

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

export default StepEducation;
