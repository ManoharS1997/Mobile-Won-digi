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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format, differenceInCalendarDays, parse } from "date-fns";
import CustomDropdown from "@/components/common/CustomDropdown";
import StatusModal from "@/components/common/StatusModal";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { UpdateUser } from "@/services/libraryServices";
import { useRouter } from "expo-router";

interface EditLibraryModalProps {
  visible: boolean;
  onClose: () => void;
  details: any;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string };

const dropdownFields: Record<string, OptionType[]> = {
  return_book: [
    { label: "yes", value: "yes" },
    { label: "no", value: "no" },
  ],
};

const dateFields = ["start_date", "end_date", "return_date"];

const EditLibraryModal: React.FC<EditLibraryModalProps> = ({
  visible,
  onClose,
  details,
  onSubmit,
}) => {
  const router = useRouter();
  const { auth } = useAuth();
  const [form, setForm] = useState<any>({});
  const [showDatePicker, setShowDatePicker] = useState<null | string>(null);
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");

  useEffect(() => {
    if (details) {
      setForm({
        user_id: details.user_id || "",
        user_name: details.user_name || "",
        user_role: details.user_role || "",
        book_id: details.book_id || "",
        sub_id: details.sub_id || "",
        book_name: details.book_name || "",
        book_author: details.book_author || "",
        book_category: details.book_category || "",
        start_date: details.start_date || "",
        end_date: details.end_date || "",
        return_date: details.return_date || "",
        return_book: details.return_book || "",
        fine: details.fine?.toString() || "0",
        book_modified_by: auth.email,
        library_schoolid: details.library_schoolid,
      });
    }
  }, [details]);

  const handleChange = (field: string, value: string) => {
    const updatedForm = { ...form, [field]: value };
    if (field === "return_date" || field === "end_date") {
      const end = parse(updatedForm.end_date, "dd-MM-yyyy", new Date());
      const ret = parse(updatedForm.return_date, "dd-MM-yyyy", new Date());
      const lateDays = differenceInCalendarDays(ret, end);
      updatedForm.fine = lateDays > 0 ? `${lateDays * 5}` : "0";
    }

    setForm(updatedForm);
  };

  const handleDateConfirm = (date: Date) => {
    if (!showDatePicker) return;
    handleChange(showDatePicker, format(date, "dd-MM-yyyy"));
    setShowDatePicker(null);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "user_id",
      "user_name",
      "user_role",
      "book_id",
      "book_name",
      "book_author",
      "book_category",
      "start_date",
      "end_date",
      "return_date",
      "return_book",
      "library_schoolid",
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
      const response = await UpdateUser(
        form.library_schoolid,
        form.book_id,
        details.user_id,
        form
      );
      if (response?.data?.success) {
        setMessageStatus("Book record updated!");
        setStatus("success");
        setVisible(true);
        onSubmit(form);
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (err: any) {
      setMessageStatus("Update failed.");
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
              <Text className="text-lg font-semibold">Edit Book Record</Text>
              <TouchableOpacity
                onPress={onClose}
                disabled={isModalSpinnerVisible}
              >
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {Object.entries(form).map(([field, value]) => {
                if (
                  ["_id", "library_schoolid", "book_modified_by"].includes(
                    field
                  )
                )
                  return null;
                return (
                  <View key={field} className="mb-4">
                    <Text className="text-sm text-gray-700 mb-1 capitalize">
                      {field.replace(/_/g, " ")}
                    </Text>
                    {dropdownFields[field] ? (
                      <CustomDropdown
                        value={form[field]}
                        onChange={(val) => handleChange(field, val)}
                        options={dropdownFields[field]}
                      />
                    ) : dateFields.includes(field) ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(field)}
                          className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                        >
                          <Text className="text-base text-black">
                            {form[field] || "Select date"}
                          </Text>
                          <Feather name="calendar" size={20} color="#026902" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TextInput
                        value={form[field]}
                        editable={
                          field !== "fine" &&
                          field !== "user_id" &&
                          field !== "user_name" &&
                          field !== "user_role"
                        }
                        style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                        onChangeText={(val) => handleChange(field, val)}
                        className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                      />
                    )}
                  </View>
                );
              })}
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
            <DateTimePickerModal
              isVisible={!!showDatePicker}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={() => setShowDatePicker(null)}
              themeVariant="light"
              pickerContainerStyleIOS={{ backgroundColor: "white" }}
              buttonTextColorIOS="#026902"
              customCancelButtonIOS={() => (
                <Pressable
                  className="bg-red-500 p-5 rounded-2xl items-center"
                  onPress={() => setShowDatePicker(null)}
                >
                  <Text className="text-white font-semibold">Cancel</Text>
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
            <StatusModal
              visible={isVisible}
              status={status}
              message={messageStatus}
              onClose={() => {
                setVisible(false);
                if (status === "success") {
                  setTimeout(() => {
                    onClose();
                    router.back();
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

export default EditLibraryModal;
