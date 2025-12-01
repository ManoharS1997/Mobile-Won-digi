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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Feather } from "@expo/vector-icons";
import CustomDropdown from "@/components/common/CustomDropdown";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/common/StatusModal";
import { PostClassnotes } from "@/services/notesServices";
import { GetFileUrl } from "@/services/notesServices";
import * as FileSystem from "expo-file-system";
import { getSubjectList } from "@/constant/subject";

interface NotesFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string };

const NotesFormModal: React.FC<NotesFormModalProps> = ({
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
  const [isLoading, setLoading] = useState(false);
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
    notes_id: "",
    student_class: "",
    section: "",
    subject: "",
    file_name: "",
    notes_url: "",
    notes_created_by: "",
    notes_modified_by: "",
    notes_schoolid: "",
  });

  const generateNoteId = (length: number) => {
    return `CN${String(length + 1).padStart(6, "0")}`;
  };

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      notes_id: generateNoteId(dataLen),
      notes_created_by: auth.email,
      notes_modified_by: auth.email,
      notes_schoolid: auth.roleId,
    }));
    subjectList();
  }, [dataLen]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
      });

      if (!res.canceled && res.assets.length > 0) {
        const file = res.assets[0];
        setLoading(true);

        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        if (!fileInfo.exists) {
          return;
        }

        const fileType = file.mimeType || "application/octet-stream";
        const fileUri = file.uri;

        const fileData = new FormData();
        fileData.append("image", {
          uri: fileUri,
          name: file.name,
          type: fileType,
        } as any);

        const uploadRes = await GetFileUrl(fileData);
        if (uploadRes?.data?.success) {
          handleChange("notes_url", uploadRes.data.fileUrl);
        } else {
          throw new Error("File upload failed");
        }
      }
    } catch (error: any) {
      setMessageStatus("File upload failed");
      setStatus("error");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "notes_id",
      "student_class",
      "section",
      "subject",
      "file_name",
      "notes_url",
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
      const response = await PostClassnotes(form);
      if (response?.data?.success) {
        setMessageStatus("Note added successfully!");
        setStatus("success");
        setVisible(true);
        onSubmit(form);
      } else {
        throw new Error(response?.data?.message || "Something went wrong.");
      }
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to submit note.");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
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
    section: ["A", "B", "C", "D", "E"].map((sec) => ({
      label: sec,
      value: sec,
    })),
    subject: subjectData,
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
              <Text className="text-lg font-semibold">Add Note</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={() => {
                  onClose();
                  setForm({
                    notes_id: generateNoteId(dataLen),
                    student_class: "",
                    section: "",
                    subject: "",
                    file_name: "",
                    notes_url: "",
                    notes_created_by: auth.email,
                    notes_modified_by: auth.email,
                    notes_schoolid: auth.roleId,
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
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-1">Note ID</Text>
                <TextInput
                  value={form.notes_id}
                  editable={false}
                  style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                  className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-1">Upload File</Text>
                <TouchableOpacity
                  onPress={handleFilePick}
                  className="flex-row justify-between items-center border border-gray-300 px-4 py-3 rounded-md"
                >
                  <Text className="text-black flex-1">
                    {form.notes_url.length > 0
                      ? `${form.notes_url.slice(0, 40)}...`
                      : "Pick a file"}
                  </Text>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#026902" />
                  ) : (
                    <Feather name="upload-cloud" size={20} color="#026902" />
                  )}
                </TouchableOpacity>
              </View>

              {Object.keys(form).map((field) => {
                if (
                  [
                    "notes_id",
                    "notes_url",
                    "notes_created_by",
                    "notes_created_at",
                    "notes_modified_by",
                    "notes_modified_at",
                    "notes_schoolid",
                  ].includes(field)
                ) {
                  return null;
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
                    ) : (
                      <TextInput
                        value={form[field] || ""}
                        onChangeText={(val) => handleChange(field, val)}
                        className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                        style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
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
                      notes_id: generateNoteId(dataLen),
                      student_class: "",
                      section: "",
                      subject: "",
                      file_name: "",
                      notes_url: "",
                      notes_created_by: auth.email,
                      notes_modified_by: auth.email,
                      notes_schoolid: auth.roleId,
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

export default NotesFormModal;
