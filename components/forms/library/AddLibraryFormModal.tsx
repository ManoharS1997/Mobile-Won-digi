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
import CustomDropdown from "@/components/common/CustomDropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "../../common/StatusModal";
import { Feather } from "@expo/vector-icons";
import { GetBookById, PostUser } from "@/services/libraryServices";
import { GetStaffById, GetStudentById } from "@/services/authServices";

interface LibraryFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string };

const LibraryFormModal: React.FC<LibraryFormModalProps> = ({
  visible,
  dataLen,
  onClose,
  onSubmit,
}) => {
  const { auth } = useAuth();

  const [form, setForm] = useState<any>({});
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [showDatePickerFor, setShowDatePickerFor] = useState<null | string>(
    null
  );

  const getUserData = async () => {
    setModalSpinnerVisible(true);
    try {
      if (typeof auth.userId !== "string" || typeof auth.roleId !== "string") {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Invalid user or ID");
        return;
      }

      const isStaff = form?.user_id?.startsWith("SF");
      const response = isStaff
        ? await GetStaffById(form?.user_id, auth.roleId)
        : await GetStudentById(form?.user_id, auth.roleId);

      const data = isStaff ? response.data.staff : response.data.students;

      if (!data || data?.length === 0) {
        setVisible(true);
        setStatus("error");
        setMessageStatus(isStaff ? "Staff not found" : "Student not found");
        return;
      }

      const userData = data[0];

      setForm({
        ...form,
        user_name: userData.staff_name || userData.student_name || "",
        user_role: userData.role || userData.role || "",
      });
    } catch (error: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const fetchBookEntries = async () => {
    try {
      setModalSpinnerVisible(true);
      const response = await GetBookById(form.book_id, auth.roleId || "");
      response.data;
      const entries = response.data.book[0] || {};

      setForm({
        ...form,
        sub_id: "1",
        book_name: entries.book_name,
        book_author: entries.book_author,
        book_category: entries.book_category,
        fine: "0",
        return_book: "no",
        return_date: "18-03-2025",
      });
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch book entries");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    if (form.user_id?.length === 8) {
      getUserData();
    }
  }, [form?.user_id]);

  useEffect(() => {
    if (form.book_id?.length === 8) {
      fetchBookEntries();
    }
  }, [form?.book_id]);

  useEffect(() => {
    setForm({
      ...form,
      book_added_by: auth.email,
      book_modified_by: auth.email,
      library_schoolid: auth.roleId,
    });
  }, [dataLen]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date: Date) => {
    if (!showDatePickerFor) return;
    handleChange(showDatePickerFor, format(date, "dd-MM-yyyy"));
    setShowDatePickerFor(null);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "user_id",
      "user_name",
      "user_role",
      "book_id",
      "sub_id",
      "book_name",
      "book_author",
      "book_category",
      "start_date",
      "end_date",
      "fine",
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
      const response = await PostUser(form);
      if (response?.data?.success) {
        setMessageStatus(
          response.data.message || "Library record added successfully!"
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
      setMessageStatus(error?.response?.data?.message || "Submission failed.");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const dropdownFields: Record<string, OptionType[]> = {
    return_book: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
  };

  const dateFields = ["start_date", "return_date", "end_date"];

  const bookFields = [
    "user_id",
    "user_name",
    "book_id",
    "sub_id",
    "book_name",
    "book_author",
    "book_category",
    "start_date",
    "end_date",
    "fine",
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Add Library Record</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={() => {
                  onClose();
                  setForm({
                    book_added_by: auth.email,
                    book_modified_by: auth.email,
                    library_schoolid: auth.roleId,
                  });
                }}
              >
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {bookFields.map((field) => {
                if (["user_name"].includes(field)) {
                  return (
                    <View key={field} className="mb-4">
                      <Text className="text-sm text-gray-700 mb-1 capitalize">
                        {field.replace(/_/g, " ")}
                      </Text>
                      <TextInput
                        value={form[field]}
                        editable={false}
                        style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                        className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                      />
                    </View>
                  );
                }

                return (
                  <View key={field} className="mb-4">
                    <Text className="text-sm text-gray-700 mb-1 capitalize">
                      {field.replace(/_/g, " ")}
                    </Text>
                    {dropdownFields[field] ? (
                      <CustomDropdown
                        label=""
                        value={form[field]}
                        onChange={(val) => handleChange(field, val)}
                        options={dropdownFields[field]}
                      />
                    ) : dateFields.includes(field) ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setShowDatePickerFor(field)}
                          className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                        >
                          <Text className="text-base text-black">
                            {form[field] ? form[field] : "Select date"}
                          </Text>
                          <Feather name="calendar" size={20} color="#026902" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TextInput
                        value={form[field]}
                        autoFocus={field === "user_id" && true}
                        autoCapitalize={
                          field === "user_id" || field === "book_id"
                            ? "characters"
                            : "none"
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
              isVisible={!!showDatePickerFor}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={() => setShowDatePickerFor(null)}
              themeVariant="light"
              pickerContainerStyleIOS={{ backgroundColor: "white" }}
              buttonTextColorIOS="#026902"
              customCancelButtonIOS={() => (
                <Pressable
                  className="bg-red-500 p-5 rounded-2xl items-center"
                  onPress={() => setShowDatePickerFor(null)}
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
                    setForm({
                      book_added_by: auth.email,
                      book_modified_by: auth.email,
                      library_schoolid: auth.roleId,
                    });
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

export default LibraryFormModal;
