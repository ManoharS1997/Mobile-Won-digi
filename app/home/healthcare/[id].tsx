import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GetCareById, PostCare } from "@/services/careServices";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/common/StatusModal";
import Loader from "@/components/common/Loader";
import CustomDropdown from "@/components/common/CustomDropdown";
import { useRolePermissions } from "@/constant/GetRoleAction";

const highlightLinks = (text: string) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, index) =>
    part.match(/https?:\/\/[^\s]+/) ? (
      <Text
        key={index}
        style={{ color: "#1E90FF", textDecorationLine: "underline" }}
        onPress={() => Linking.openURL(part)}
      >
        {part}
      </Text>
    ) : (
      <Text key={index}>{part}</Text>
    )
  );
};

const HealthcarePage = () => {
  const { auth } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const student = JSON.parse(id as string);
  const { permissions, error } = useRolePermissions(auth.title || "", "Care");

  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [careData, setCareData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [allow, setAllow] = useState<String | string[] | null>("");
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");

  const generateCareId = (length: number) => {
    return `CR${String(length + 1).padStart(6, "0")}`;
  };

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const [formData, setFormData] = useState({
    student_id: student.student_id,
    student_name: student.student_name,
    student_class: student.student_class,
    student_section: student.student_section,
    care_id: "",
    care_name: "",
    care_description: "",
    care_status: "",
    care_created_by: auth.email,
    care_modified_by: auth.email,
    care_schoolid: auth.roleId,
  });

  const fetchCareData = async () => {
    if (!student.student_id || !auth.roleId) return;

    try {
      setModalSpinnerVisible(true);
      const response = await GetCareById(auth.roleId, student.student_id);
      setCareData(response.data.cares || []);
    } catch (error: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(
        error.response?.data?.message || "Failed to fetch student details."
      );
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "care_name",
      "care_description",
      "care_status",
    ] as const;

    const missingField = requiredFields.find(
      (field) => !formData[field] || formData[field].toString().trim() === ""
    );

    if (missingField) {
      setMessageStatus(`Please fill out "${missingField.replace(/_/g, " ")}"`);
      setStatus("error");
      setVisible(true);
      return;
    }

    const newCareId = generateCareId(careData.length);
    const payload = {
      ...formData,
      care_id: newCareId,
    };

    setLoading(true);
    try {
      const response = await PostCare(payload);
      if (response?.data?.success) {
        setMessageStatus("Care entry created successfully!");
        setStatus("success");
        setVisible(true);
        fetchCareData();
        setFormData((prev) => ({
          ...prev,
          care_id: generateCareId(careData.length + 1),
          care_name: "",
          care_description: "",
          care_status: "",
        }));
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data?.message || "Failed to submit care entry."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareData();
  }, [student.student_id, auth.roleId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/home/healthcare")}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Care Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} className="p-4 flex-1">
        {careData.length > 0 ? (
          careData.map((care, index) => (
            <View
              key={care.care_id || index}
              className="bg-gray-100 rounded-lg p-4 mb-4"
            >
              <Text className="text-lg font-bold text-green-800 mb-2">
                {care.care_name || "Care Entry"}
              </Text>
              <Text className="text-gray-700">
                {highlightLinks(care.care_description || "")}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            No existing care records found.
          </Text>
        )}
      </ScrollView>

      {auth.role === "staff" && allow === "Edit" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="p-4 border-t border-gray-200 bg-white">
            <View className="mb-2.5">
              <Text className="text-sm text-gray-700 mb-1 capitalize">
                Care Description
              </Text>
              <TextInput
                value={formData.care_description}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    care_description: text,
                  }))
                }
                textAlignVertical="top"
                numberOfLines={4}
                className="border h-[6rem] border-gray-300 w-full rounded-md px-3 text-base text-black"
                multiline
              />
            </View>
            <View className="mb-2.5">
              <Text className="text-sm text-gray-700 mb-1 capitalize">
                Care Name
              </Text>
              <CustomDropdown
                label=""
                value={formData.care_name}
                onChange={(text) =>
                  setFormData((prev) => ({ ...prev, care_name: text }))
                }
                options={[
                  {
                    value: "Health and Wellness",
                    label: "Health and Wellness",
                  },
                  {
                    value: "Emotional and Behavior Support",
                    label: "Emotional and Behavior Support",
                  },
                  {
                    value: "Social Development",
                    label: "Social Development",
                  },
                  {
                    value: "Attendance and Punctuality",
                    label: "Attendance and Punctuality",
                  },
                  {
                    value: "Extracurricular Activities",
                    label: "Extracurricular Activities",
                  },
                ]}
              />
            </View>
            <View className="mb-4">
              <Text className="text-sm text-gray-700 mb-1 capitalize">
                Care Status
              </Text>
              <CustomDropdown
                label=""
                value={formData.care_status}
                onChange={(text) =>
                  setFormData((prev) => ({ ...prev, care_status: text }))
                }
                options={[
                  { value: "active", label: "active" },
                  { value: "inactive", label: "inactive" },
                ]}
              />
            </View>
            <TouchableOpacity
              disabled={loading}
              className="bg-green-700 py-3 rounded-md mt-3"
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  {careData.length > 0 ? "Update" : "Create"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />

      <Loader
        isModalSpinnerVisible={isModalSpinnerVisible}
        setModalSpinnerVisible={setModalSpinnerVisible}
      />
    </SafeAreaView>
  );
};

export default HealthcarePage;
