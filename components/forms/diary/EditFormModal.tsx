import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomDropdown from "@/components/common/CustomDropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { UpdateDiary } from "@/services/diaryServices";
import StatusModal from "@/components/common/StatusModal";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { getSubjectList } from "@/constant/subject";

interface EditFormModalProps {
  visible: boolean;
  onClose: () => void;
  details: any;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string };

const EditFormModal: React.FC<EditFormModalProps> = ({
  visible,
  onClose,
  details,
  onSubmit,
}) => {
  const { auth } = useAuth();
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [subjectData, setSubjectData] = useState([]);
  const subjectList = async () => {
    const result = await getSubjectList(auth.roleId || "");

    if ("error" in result) {
      setMessageStatus(result.error || "Something went wrong.");
      setStatus("error");
      setVisible(true);
    } else {
      setSubjectData(result);
    }
  };
  const [form, setForm] = useState<any>({
    diary_id: "",
    staff_id: "",
    staff_name: "",
    diary_modified_by: "",
    diary_schoolid: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      diary_id: details?.diary_id,
      staff_id: details?.staff_id,
      staff_name: details?.staff_name,
      diary_modified_by: auth.email,
      diary_schoolid: details?.diary_schoolid,
      date: details?.date,
      diary_status: details?.diary_status,
      diarys: details?.diarys,
      section: details?.section,
      student_class: details?.student_class,
      subject: details?.subject,
    }));
    subjectList();
  }, [details]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "dd-MM-yyyy");
    handleChange("date", dateStr);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "diary_id",
      "staff_id",
      "staff_name",
      "date",
      "student_class",
      "section",
      "subject",
      "diarys",
      "diary_status",
      "diary_schoolid",
    ];

    const missingField = requiredFields.find(
      (field) => !form[field] || form[field].toString().trim() === ""
    );

    if (missingField) {
      setMessageStatus(`Please fill out "${missingField.replace(/_/g, " ")}"`);
      setStatus("error");
      setVisible(true);
      return;
    }
    setModalSpinnerVisible(true);
    try {
      const response = await UpdateDiary(
        details?.diary_schoolid,
        details?.diary_id,
        form
      );
      if (response?.data?.success) {
        setMessageStatus(
          response.data.message || "Diary updated successfully!"
        );
        setStatus("success");
        setVisible(true);
        onSubmit(form);
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data?.message || "Failed to update diary."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const diaryFields = [
    "diary_id",
    "date",
    "student_class",
    "section",
    "subject",
    "diarys",
    "diary_status",
  ];

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
    section: ["A", "B", "C", "D", "E"].map((sec) => ({
      label: sec,
      value: sec,
    })),
    subject: subjectData,
    diary_status: [
      { label: "active", value: "active" },
      { label: "inactive", value: "inactive" },
    ],
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
              <Text className="text-lg font-semibold">Edit Diary</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={onClose}
              >
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {diaryFields.map((field) => (
                <View key={field} className="mb-4">
                  <Text className="text-sm text-gray-700 mb-1 capitalize">
                    {field.replace(/_/g, " ")}
                  </Text>
                  {dropdownFields[field] ? (
                    <CustomDropdown
                      label={""}
                      value={form[field]}
                      onChange={(val) => handleChange(field, val)}
                      options={dropdownFields[field]}
                    />
                  ) : field === "date" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      >
                        <Text className="text-base text-black">
                          {form[field] ? form[field] : "Select date"}
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
                  ) : (
                    <TextInput
                      editable={field === "diary_id" ? false : true}
                      value={form[field] || ""}
                      onChangeText={(val) => handleChange(field, val)}
                      className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                      style={{
                        lineHeight: Platform.OS === "ios" ? 0 : -1,
                      }}
                    />
                  )}
                </View>
              ))}

              <TouchableOpacity
                className="bg-green-700 py-3 rounded-md mt-3"
                onPress={handleSubmit}
              >
                {isModalSpinnerVisible ? (
                  <ActivityIndicator size="small" className="text-[#fff]" />
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
                    onClose();
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

export default EditFormModal;
