import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import CustomDropdown from "@/components/common/CustomDropdown";
import StatusModal from "@/components/common/StatusModal";
import { UpdateCircular } from "@/services/circularServices";
import { useAuth } from "@/context/AuthContext";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { GetRole } from "@/services/authServices";

interface Props {
  visible: boolean;
  onClose: () => void;
  details: any;
  onSubmit: (data: any) => void;
}

const EditCircularModal: React.FC<Props> = ({
  visible,
  onClose,
  details,
  onSubmit,
}) => {
  const { auth } = useAuth();
  const [form, setForm] = useState<any>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const richTextRef = useRef<RichEditor>(null);

  const statusOptions = [
    { label: "active", value: "active" },
    { label: "inactive", value: "inactive" },
  ];

  const receiverOptions = [
    { label: "All", value: "All" },
    { label: "Students", value: "Students" },
    { label: "Staff", value: "Staff" },
  ];
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
    if (details) {
      setForm({
        circular_id: details.circular_id || "",
        circular_title: details.circular_title || "",
        circular_subject: details.circular_subject || "",
        circular_description: details.circular_description || "",
        circular_date: details.circular_date || "",
        circular_status: details.circular_status || "",
        circular_receiver: details.circular_receiver || "",
        circular_modified_by: auth?.email || "",
        circular_schoolid: details.circular_schoolid || "",
        circular_classes: details.circular_classes || [],
        circular_sections: details.circular_sections || [],
        circular_roles: details.circular_roles || [],
        circular_departments: details.circular_departments || [],
      });
    }
    fetchRole();
  }, [details]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date: Date) => {
    handleChange("circular_date", format(date, "dd-MM-yyyy"));
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "circular_id",
      "circular_title",
      "circular_subject",
      "circular_description",
      "circular_date",
      "circular_status",
      "circular_receiver",
      "circular_modified_by",
      "circular_schoolid",
    ];

    const missing = requiredFields.find((f) => !form[f]);
    if (missing) {
      setStatus("error");
      setMessageStatus(`Please fill "${missing.replace(/_/g, " ")}"`);
      setVisible(true);
      return;
    }

    setLoading(true);
    try {
      const res = await UpdateCircular(
        form.circular_schoolid,
        form.circular_id,
        form
      );
      if (res?.data?.success) {
        setStatus("success");
        setMessageStatus("Circular updated successfully!");
        setVisible(true);
        onSubmit(form);
      } else {
        throw new Error(res?.data?.message || "Failed to update");
      }
    } catch (err: any) {
      setStatus("error");
      setMessageStatus(err?.message || "Something went wrong");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Edit Circular</Text>
              <TouchableOpacity onPress={onClose} disabled={loading}>
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {[
                { key: "circular_title", label: "Title" },
                { key: "circular_subject", label: "Subject" },
              ].map(({ key, label }) => (
                <View key={key} className="mb-4">
                  <Text className="mb-1 text-gray-700">{label}</Text>
                  <TextInput
                    value={form[key]}
                    onChangeText={(text) => handleChange(key, text)}
                    className="border border-gray-300 rounded-md h-12 px-3 text-base"
                    style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                  />
                </View>
              ))}

              <View className="mb-4">
                <Text className="mb-1 text-gray-700">Circular Description</Text>
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
                      contentCSSText: "font-size: 16px; min-height: 150px;",
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
              </View>

              <View className="mb-4">
                <Text className="mb-1 text-gray-700">Date</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-md h-12 px-4 flex-row justify-between items-center"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{form.circular_date || "Select date"}</Text>
                  <Feather name="calendar" size={20} />
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
              </View>

              <View className="mb-4">
                <Text className="mb-1 text-gray-700">Receiver</Text>
                <CustomDropdown
                  label=""
                  value={form.circular_receiver}
                  onChange={(val) => handleChange("circular_receiver", val)}
                  options={receiverOptions}
                />
              </View>
              {form.circular_receiver === "Students" && (
                <>
                  <View className="mb-4">
                    <Text className="text-sm text-gray-700 mb-1">Classes</Text>
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
                  <View className="mb-4">
                    <Text className="text-sm text-gray-700 mb-1">Sections</Text>
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
                      options={["A", "B", "C", "D", "E"].map((cls) => ({
                        label: cls,
                        value: cls,
                      }))}
                      multiple
                    />
                  </View>
                </>
              )}
              {form.circular_receiver === "Staff" && (
                <>
                  <View className="mb-4">
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
                  <View className="mb-4">
                    <Text className="text-sm text-gray-700 mb-1">Role</Text>
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
              <View className="mb-4">
                <Text className="mb-1 text-gray-700">Status</Text>
                <CustomDropdown
                  label=""
                  value={form.circular_status}
                  onChange={(val) => handleChange("circular_status", val)}
                  options={statusOptions}
                />
              </View>

              <TouchableOpacity
                className="bg-green-700 py-3 rounded-md mt-2"
                onPress={handleSubmit}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Update Circular
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

export default EditCircularModal;
