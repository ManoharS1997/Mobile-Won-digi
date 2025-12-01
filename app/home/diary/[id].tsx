import React, { useEffect, useState } from "react";
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
import { GetDiaryById } from "@/services/diaryServices";
import EditFormModal from "@/components/forms/diary/EditFormModal";
import StatusModal from "@/components/common/StatusModal";
import { useRolePermissions } from "@/constant/GetRoleAction";

type DiaryEntry = {
  diary_id: string;
  staff_id: string;
  staff_name: string;
  date: string;
  student_class: string;
  section: string;
  subject: string;
  diarys: string;
  diary_status: string;
  diary_modified_by: string;
};

const statusColors: Record<string, string> = {
  active: "#16a34a",
  inactive: "#dc2626",
};

const DetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auth } = useAuth();
  const [details, setDetails] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const { permissions, error } = useRolePermissions(auth.title || "", "Diary");
  const [allow, setAllow] = useState<String | string[] | null>("");

  const fetchDiary = async () => {
    if (!id || !auth.roleId) return;

    try {
      setLoading(true);
      const response = await GetDiaryById(id, auth.roleId);
      const entry = response.data.diary[0];
      setDetails(entry);
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to fetch diary details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiary();
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/home/diary")}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Diary Details
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
                {details.subject}
              </Text>
              <View className="mt-2 flex-row items-center space-x-2">
                <Text className="text-sm text-gray-600 mr-5">Status:</Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      statusColors[details.diary_status.toLowerCase()] ||
                      "#9ca3af",
                  }}
                >
                  <Text className="text-white text-xs font-semibold">
                    {details.diary_status.toLowerCase()}
                  </Text>
                </View>
              </View>
            </View>

            {renderRow("Diary ID", details.diary_id)}
            {renderRow("Staff Name", details.staff_name)}
            {renderRow("Date", details.date)}
            {renderRow("Subject", details.subject)}
            {renderRow(
              "Class-Section",
              `${details.student_class.startsWith("Class") ? "" : "Class"} ${
                details.student_class
              } - ${details.section}`
            )}
            {renderRow("Diary", details.diarys)}
            {renderRow("Modified By", details.diary_modified_by)}
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            No details found for ID: {id}
          </Text>
        )}
      </ScrollView>
      <EditFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        details={details}
        onSubmit={() => {
          fetchDiary();
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

export default DetailPage;
