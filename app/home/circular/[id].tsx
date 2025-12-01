import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/common/StatusModal";
import { useRolePermissions } from "@/constant/GetRoleAction";
import { GetCircularById } from "@/services/circularServices";
import EditCircularModal from "@/components/forms/circular/EditFormModal";
import { RichEditor } from "react-native-pell-rich-editor";

const statusColors: Record<string, string> = {
  active: "#16a34a",
  inactive: "#dc2626",
};

type CircularDetails = {
  circular_id: string;
  circular_title: string;
  circular_subject: string;
  circular_description: string;
  circular_date: string;
  circular_status: string;
  circular_receiver: string;
  circular_created_by: string;
  circular_modified_by: string;
  circular_roles?: string[];
  circular_classes?: string[];
  circular_sections?: string[];
};

const CircularDetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auth } = useAuth();
  const [allow, setAllow] = useState<String | string[] | null>("");
  const [details, setDetails] = useState<CircularDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const richTextRef = useRef<RichEditor>(null);

  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Circulars"
  );

  const fetchCircularDetails = async () => {
    if (!id || !auth.roleId) return;

    try {
      setLoading(true);
      const response = await GetCircularById(auth.roleId, id);
      const entry = response.data.circular[0];
      setDetails(entry);
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to fetch circular details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircularDetails();
  }, [id, auth.roleId]);

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const renderRow = (label: string, value?: string | number) => {
    if (!value) return null;
    return (
      <View className="py-3 border-b border-gray-200">
        <Text className="text-xs text-gray-500 uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-base text-gray-800 font-medium mt-1">
          {value}
        </Text>
      </View>
    );
  };

  const renderArrayRow = (label: string, values?: string[]) => {
    if (!values || values.length === 0) return null;
    return (
      <View className="py-3 border-b border-gray-200">
        <Text className="text-xs text-gray-500 uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-base text-gray-800 font-medium mt-1">
          {values.join(", ")}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/home/circular")}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Circular Details
        </Text>
        {auth.role === "staff" && allow === "Edit" && (
          <TouchableOpacity onPress={() => setShowForm(true)}>
            <FontAwesome name="edit" size={25} color="#026902" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="px-4 pt-5 pb-10"
      >
        {loading ? (
          <ActivityIndicator size="large" color="#026902" className="mt-10" />
        ) : details ? (
          <View className="space-y-4">
            <View className="border-b border-gray-200 pb-4">
              <Text className="text-xl font-bold text-gray-900">
                {details.circular_title}
              </Text>
              <View className="mt-2 flex-row items-center space-x-2">
                <Text className="text-sm text-gray-600 mr-5">Status:</Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      statusColors[details?.circular_status?.toLowerCase()] ||
                      "#9ca3af",
                  }}
                >
                  <Text className="text-white text-xs font-semibold">
                    {details?.circular_status?.toLowerCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-x-4 justify-between">
              <View className="flex-1 min-w-[48%]">
                {renderRow("Subject", details.circular_subject)}
                {renderRow("Circular ID", details.circular_id)}
              </View>

              <View className="flex-1 min-w-[48%]">
                {renderRow("Date", details.circular_date)}
                {renderRow("Receiver", details.circular_receiver)}
              </View>
            </View>
            {details.circular_receiver !== "all" && (
              <>
                {details.circular_receiver === "Staff" ? (
                  <>
                    {renderArrayRow("Roles", details.circular_roles)}
                    {renderArrayRow("Departments", details.circular_roles)}
                  </>
                ) : details.circular_receiver === "Students" ? (
                  <>
                    {renderArrayRow("Classes", details.circular_classes)}
                    {renderArrayRow("Sections", details.circular_sections)}
                  </>
                ) : null}
              </>
            )}

            {renderRow("Modified By", details.circular_modified_by)}

            <View className="py-3 mt-2.5 border-b border-gray-200">
              <Text className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                Description
              </Text>
              <View
                style={{
                  minHeight: 100,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 6,
                  padding: 10,
                }}
              >
                <RichEditor
                  ref={richTextRef}
                  initialContentHTML={
                    details.circular_description ||
                    "<p>No description available.</p>"
                  }
                  disabled={true}
                  editorStyle={{
                    backgroundColor: "white",
                    contentCSSText:
                      "font-size: 16px; color: #1f2937; line-height: 24px; padding: 0; margin: 0;",
                  }}
                  style={{
                    minHeight: 250,
                    backgroundColor: "white",
                  }}
                  useContainer={false}
                />
              </View>
            </View>
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            No circular found with ID: {id}
          </Text>
        )}
      </ScrollView>

      <EditCircularModal
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          richTextRef.current?.blurContentEditor?.();
        }}
        details={details}
        onSubmit={() => {
          fetchCircularDetails();
        }}
      />

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
};

export default CircularDetailPage;
