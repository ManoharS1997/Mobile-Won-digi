// CircularFormModal.tsx
import React, { useEffect, useState, useRef } from "react";
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
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "../../common/StatusModal";
import { Feather } from "@expo/vector-icons";
import CustomDropdown from "@/components/common/CustomDropdown";
import { PostCircular } from "@/services/circularServices"; // assume this is your API service
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { GetRole } from "@/services/authServices";

interface CircularFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string };

const CircularFormModal: React.FC<CircularFormModalProps> = ({
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
  const richTextRef = useRef<RichEditor>(null);

  const generateCircularId = (length: number) => {
    return `C${String(length + 1).padStart(7, "0")}`;
  };

  const [form, setForm] = useState<any>({});
  const [roles, setRoles] = useState<any>([]);

  const fetchRole = async () => {
    try {
      if (!auth.roleId) {
        setMessageStatus("School ID missing");
        setStatus("error");
        setVisible(true);
        return;
      }

      const response = await GetRole(auth.roleId);
      let entries = response.data.roles;
      const structuredData = entries.map((entry: any) => ({
        label: entry.role_name,
        value: entry.role_name?.toLowerCase() || "",
      }));
      setRoles(structuredData);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch roles");
      setStatus("error");
      setVisible(true);
    }
  };

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      circular_id: generateCircularId(dataLen),
      circular_created_by: auth.email,
      circular_modified_by: auth.email,
      circular_schoolid: auth.roleId,
      circular_status: "active",
      circular_classes: [],
      circular_sections: [],
      circular_departments: [],
      circular_roles: [],
      circular_description: `<p>Dear Parents/Guardians,</p>
     <p><br/></p>
<p>This is to inform you that the school will remain closed for the upcoming public holidays from [Date] to [Date]. Regular classes will resume on [Date].</p>
<p>Please ensure that your child is informed of these dates and prepares accordingly for the following school days.</p>
<p>Thank you for your cooperation.</p>
<p><br></p>
<p>Sincerely,</p>
<p>[Your Name]</p>
<p>Principal</p>
<p>[School Name]</p>
`,
    }));
    fetchRole();
  }, [dataLen]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "dd-MM-yyyy");
    handleChange("circular_date", dateStr);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "circular_id",
      "circular_title",
      "circular_subject",
      "circular_receiver",
      "circular_status",
      "circular_date",
      "circular_description",
      "circular_created_by",
      "circular_modified_by",
      "circular_schoolid",
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
      const response = await PostCircular(form);
      if (response?.data?.success) {
        setMessageStatus("Circular added successfully!");
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
    circular_receiver: [
      { label: "All", value: "all" },
      { label: "Students", value: "students" },
      { label: "Staff", value: "staff" },
    ],
  };

  const formFields = [
    "circular_id",
    "circular_title",
    "circular_subject",
    "circular_receiver",
    "circular_date",
    "circular_description",
  ];

  const handleClose = () => {
    onClose();
    setForm({
      circular_id: generateCircularId(dataLen),
      circular_created_by: auth.email,
      circular_modified_by: auth.email,
      circular_schoolid: auth.roleId,
      circular_description: `<p>Dear Parents/Guardians,</p>
<p>This is to inform you that the school will remain closed for the upcoming public holidays from [Date] to [Date]. Regular classes will resume on [Date].</p>
<p>Please ensure that your child is informed of these dates and prepares accordingly for the following school days.</p>
<p>Thank you for your cooperation.</p>
<p><br></p>
<p>Sincerely,</p>
<p>[Your Name]</p>
<p>Principal</p>
<p>[School Name]</p>
`,
    });
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
              <Text className="text-lg font-semibold">Add Circular</Text>
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

                  {dropdownFields[field] ? (
                    <>
                      <CustomDropdown
                        label=""
                        value={form[field]}
                        onChange={(val) => handleChange(field, val)}
                        options={dropdownFields[field]}
                      />

                      {field === "circular_receiver" &&
                        form.circular_receiver === "Students" && (
                          <>
                            <View className="mt-4">
                              <Text className="text-sm text-gray-700 mb-1">
                                Classes
                              </Text>
                              <CustomDropdown
                                label=""
                                value={form.circular_classes || []}
                                onChange={(selected: any[]) =>
                                  setForm({
                                    ...form,
                                    circular_classes: selected,
                                    circular_departments: [],
                                    circular_roles: [],
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
                            </View>
                            <View className="mt-4">
                              <Text className="text-sm text-gray-700 mb-1">
                                Sections
                              </Text>
                              <CustomDropdown
                                label=""
                                value={form.circular_sections || []}
                                onChange={(selected: any[]) =>
                                  setForm({
                                    ...form,
                                    circular_sections: selected,
                                    circular_departments: [],
                                    circular_roles: [],
                                  })
                                }
                                options={["A", "B", "C", "D", "E"].map(
                                  (cls) => ({
                                    label: cls,
                                    value: cls,
                                  })
                                )}
                                multiple
                              />
                            </View>
                          </>
                        )}

                      {field === "circular_receiver" &&
                        form.circular_receiver === "Staff" && (
                          <>
                            <View className="mt-4">
                              <Text className="text-sm text-gray-700 mb-1">
                                Department
                              </Text>
                              <CustomDropdown
                                label=""
                                value={form.circular_departments}
                                onChange={(selected: any[]) =>
                                  setForm({
                                    ...form,
                                    circular_departments: selected,
                                    circular_sections: [],
                                    circular_classes: [],
                                  })
                                }
                                options={[
                                  { value: "telugu", label: "Telugu" },
                                  { value: "hindi", label: "Hindi" },
                                  { value: "english", label: "English" },
                                  { value: "maths", label: "Maths" },
                                  { value: "science", label: "Science" },
                                  { value: "social", label: "Social" },
                                  { value: "others", label: "Others" },
                                ]}
                                multiple
                              />
                            </View>
                            <View className="mt-4">
                              <Text className="text-sm text-gray-700 mb-1">
                                Role
                              </Text>
                              <CustomDropdown
                                label=""
                                value={form.circular_roles}
                                onChange={(selected: any[]) =>
                                  setForm({
                                    ...form,
                                    circular_roles: selected,
                                    circular_sections: [],
                                    circular_classes: [],
                                  })
                                }
                                options={roles}
                                multiple
                              />
                            </View>
                          </>
                        )}
                    </>
                  ) : field === "circular_date" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      >
                        <Text className="text-base text-black">
                          {form[field] || "Select date"}
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
                  ) : field === "circular_description" ? (
                    <ScrollView
                      contentContainerStyle={{
                        minHeight: 100,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 6,
                        padding: 10,
                      }}
                    >
                      <RichEditor
                        ref={richTextRef}
                        initialContentHTML={form.circular_description}
                        onChange={(html) =>
                          handleChange("circular_description", html)
                        }
                        placeholder="Enter circular description..."
                        editorStyle={{
                          backgroundColor: "#fff",
                          color: "#000",
                          placeholderColor: "#ccc",
                          contentCSSText: "font-size: 16px; min-height: 250px;",
                        }}
                        style={{
                          minHeight: 250,
                          backgroundColor: "white",
                        }}
                      />
                      <RichToolbar
                        editor={richTextRef}
                        actions={[
                          actions.setBold,
                          actions.setItalic,
                          actions.setUnderline,
                          actions.insertBulletsList,
                          actions.insertOrderedList,
                          actions.insertLink,
                        ]}
                        iconTint="#333"
                        selectedIconTint="#007bff"
                        style={{
                          borderTopWidth: 1,
                          borderColor: "#ccc",
                          marginTop: 8,
                        }}
                      />
                    </ScrollView>
                  ) : (
                    <TextInput
                      key={field}
                      value={form[field] || ""}
                      onChangeText={(val) => handleChange(field, val)}
                      className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                      editable={field !== "circular_id"}
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

export default CircularFormModal;
