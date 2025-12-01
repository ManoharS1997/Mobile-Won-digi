import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "../../common/StatusModal";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import CustomDropdown from "@/components/common/CustomDropdown";
import { PostExam } from "@/services/ExamServices";

interface ExamFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

type TimetableItem = {
  id: string;
  date: string;
  subject: string;
  syllabus: string;
  timing: string;
  day: string;
  marks: string;
};

const ExamFormModal: React.FC<ExamFormModalProps> = ({
  visible,
  dataLen,
  onClose,
  onSubmit,
}) => {
  const { auth } = useAuth();
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<string | null>(
    null
  );
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [activeDateIndex, setActiveDateIndex] = useState<number | null>(null);

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      exam_id: generateExamId(dataLen),
      exam_created_by: auth.email,
      exam_modified_by: auth.email,
      exam_schoolid: auth.roleId,
      exam_status: "active",
      exam_classes: [],
    }));
  }, [dataLen]);

  const generateExamId = (length: number) => {
    return `EX${String(length + 1).padStart(6, "0")}`;
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const addTimetableItem = () => {
    setTimetable([
      ...timetable,
      {
        id: Date.now().toString(),
        date: "",
        subject: "",
        syllabus: "",
        timing: "",
        day: "",
        marks: "",
      },
    ]);
  };

  const updateTimetableItem = (index: number, field: string, value: string) => {
    const updated = [...timetable];
    (updated[index] as any)[field] = value;
    setTimetable(updated);
  };

  const deleteTimetableItem = (index: number) => {
    const updated = [...timetable];
    updated.splice(index, 1);
    setTimetable(updated);
  };

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "dd-MM-yyyy");
    if (selectedDateField) {
      handleChange(selectedDateField, dateStr);
    }
    setShowDatePicker(false);
  };

  const formFields = [
    "exam_id",
    "exam_name",
    "start_date",
    "end_date",
    "exam_classes",
    "exam_status",
  ];

  const handleClose = () => {
    onClose();
    setForm({
      exam_id: generateExamId(dataLen),
      exam_created_by: auth.email,
      exam_modified_by: auth.email,
      exam_schoolid: auth.roleId,
      exam_status: "active",
    });
  };

  const handleSubmit = async () => {
    const requiredFields = ["exam_id", "exam_name", "start_date", "end_date"];

    const missingField = requiredFields.find(
      (field) => !form[field] || form[field].toString().trim() === ""
    );

    if (missingField) {
      setMessageStatus(`Please fill out "${missingField.replace(/_/g, " ")}"`);
      setStatus("error");
      setVisible(true);
      return;
    }

    const formData = {
      ...form,
      timetable: JSON.stringify(timetable),
    };

    setModalSpinnerVisible(true);
    try {
      const response = await PostExam(formData);
      if (response?.data?.success) {
        setMessageStatus("Exam added successfully!");
        setStatus("success");
        setVisible(true);
        onSubmit(formData);
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (error: any) {
      setMessageStatus(error?.response?.data?.message || "Submission failed.");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Add Exam</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={handleClose}
              >
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {formFields.map((field) => (
                <View key={field} className="mb-4">
                  <Text className="text-sm text-gray-700 mb-1 capitalize">
                    {field.replace(/_/g, " ")}
                  </Text>
                  {field === "start_date" || field === "end_date" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedDateField(field);
                          setShowDatePicker(true);
                        }}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      >
                        <Text className="text-base text-black">
                          {form[field] || `Select ${field.replace(/_/g, " ")}`}
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
                          <Pressable
                            className="bg-red-500 p-5 rounded-2xl items-center"
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text className="text-white font-semibold">
                              Cancel
                            </Text>
                          </Pressable>
                        )}
                        customHeaderIOS={() => (
                          <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
                            <Text className="text-lg font-semibold text-primary">
                              Select Date
                            </Text>
                          </View>
                        )}
                      />
                    </>
                  ) : field === "exam_classes" ? (
                    <CustomDropdown
                      label=""
                      value={form.exam_classes || []}
                      onChange={(selected: any[]) =>
                        setForm({
                          ...form,
                          exam_classes: selected,
                        })
                      }
                      options={[
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
                        label: cls,
                        value: cls,
                      }))}
                      multiple
                    />
                  ) : field === "exam_status" ? (
                    <CustomDropdown
                      label={""}
                      value={form[field] || ""}
                      onChange={(val) => handleChange(field, val)}
                      options={[
                        { label: "active", value: "active" },
                        { label: "inactive", value: "inactive" },
                      ]}
                    />
                  ) : (
                    <TextInput
                      value={form[field] || ""}
                      onChangeText={(val) => handleChange(field, val)}
                      className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                      editable={field !== "exam_id"}
                      style={{
                        lineHeight: Platform.OS === "ios" ? 0 : -1,
                      }}
                    />
                  )}
                </View>
              ))}

              <Text className="text-base font-semibold mb-1">Timetable</Text>
              {timetable.map((item, index) => (
                <View
                  key={item.id}
                  className="mb-4 border border-gray-300 p-3 rounded-md"
                >
                  <View className="flex-row justify-between mb-2 w-full">
                    <View className="w-[49%]">
                      <Text className="text-sm text-gray-700 mb-1 capitalize">
                        Date
                      </Text>
                      <TouchableOpacity
                        onPress={() => setActiveDateIndex(index)}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      >
                        <Text className="text-base text-black">
                          {item.date || "Select date"}
                        </Text>
                        <Feather name="calendar" size={20} color="#026902" />
                      </TouchableOpacity>

                      <DateTimePickerModal
                        isVisible={activeDateIndex === index}
                        mode="date"
                        onConfirm={(date) => {
                          updateTimetableItem(
                            index,
                            "date",
                            format(date, "dd-MM-yyyy")
                          );
                          setActiveDateIndex(null);
                        }}
                        onCancel={() => setActiveDateIndex(null)}
                        themeVariant="light"
                        pickerContainerStyleIOS={{ backgroundColor: "white" }}
                        buttonTextColorIOS="#026902"
                        customCancelButtonIOS={() => (
                          <Pressable
                            className="bg-red-500 p-5 rounded-2xl items-center"
                            onPress={() => setActiveDateIndex(null)}
                          >
                            <Text className="text-white font-semibold">
                              Cancel
                            </Text>
                          </Pressable>
                        )}
                        customHeaderIOS={() => (
                          <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
                            <Text className="text-lg font-semibold text-primary">
                              Select Date
                            </Text>
                          </View>
                        )}
                      />
                    </View>
                    <View className="w-[49%]">
                      <Text className="text-sm text-gray-700 mb-1 capitalize">
                        Day
                      </Text>
                      <CustomDropdown
                        label={""}
                        value={item.day}
                        onChange={(val) =>
                          updateTimetableItem(index, "day", val)
                        }
                        options={[
                          { label: "Monday", value: "Monday" },
                          { label: "Tuesday", value: "Tuesday" },
                          { label: "Wednesday", value: "Wednesday" },
                          { label: "Thursday", value: "Thursday" },
                          { label: "Friday", value: "Friday" },
                          { label: "Saturday", value: "Saturday" },
                          { label: "Sunday", value: "Sunday" },
                        ]}
                      />
                    </View>
                  </View>
                  <View className="flex-row justify-between mb-2 w-full">
                    <View className="w-[49%]">
                      <Text className="text-sm text-gray-700 mb-1 capitalize">
                        Subject
                      </Text>
                      <TextInput
                        value={item.subject}
                        onChangeText={(text) =>
                          updateTimetableItem(index, "subject", text)
                        }
                        style={{
                          lineHeight: Platform.OS === "ios" ? 0 : -1,
                        }}
                        className="border h-12 border-gray-300 w-full rounded-md px-3 text-base text-black"
                      />
                    </View>
                    <View className="w-[49%]">
                      <Text className="text-sm text-gray-700 mb-1 capitalize">
                        Timing
                      </Text>
                      <TextInput
                        value={item.timing}
                        onChangeText={(text) =>
                          updateTimetableItem(index, "timing", text)
                        }
                        style={{
                          lineHeight: Platform.OS === "ios" ? 0 : -1,
                        }}
                        className="border h-12 border-gray-300 w-full rounded-md px-3 text-base text-black"
                      />
                    </View>
                  </View>
                  <View className="w-full mb-2">
                    <Text className="text-sm text-gray-700 mb-1 capitalize">
                      Syllabus
                    </Text>
                    <TextInput
                      value={item.syllabus}
                      onChangeText={(text) =>
                        updateTimetableItem(index, "syllabus", text)
                      }
                      style={{
                        lineHeight: Platform.OS === "ios" ? 0 : -1,
                      }}
                      className="border h-12 border-gray-300 w-full rounded-md px-3 text-base text-black"
                    />
                  </View>
                  <View className="flex-row justify-between items-end mb-2 w-full">
                    <View className="w-[49%]">
                      <Text className="text-sm text-gray-700 mb-1 capitalize">
                        Marks
                      </Text>
                      <TextInput
                        value={item.marks}
                        onChangeText={(text) =>
                          updateTimetableItem(index, "marks", text)
                        }
                        style={{
                          lineHeight: Platform.OS === "ios" ? 0 : -1,
                        }}
                        className="border h-12 border-gray-300 w-full rounded-md px-3 text-base text-black"
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteTimetableItem(index)}
                      className="flex items-center justify-center"
                    >
                      <Text>
                        <MaterialIcons
                          name="delete"
                          size={26}
                          color={"#ef4444"}
                        />
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={addTimetableItem} className="mb-4">
                <Text className="text-green-600">+ Add Timetable</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-green-700 py-3 rounded-md mt-3"
                onPress={handleSubmit}
              >
                {isModalSpinnerVisible ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
            <StatusModal
              visible={isVisible}
              status={status}
              message={messageStatus}
              onClose={() => {
                setVisible(false);
                if (status === "success") {
                  setTimeout(() => {
                    handleClose();
                  }, 200);
                }
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ExamFormModal;
