import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { GetResultById } from "@/services/resultServices";
import DynamicCard from "@/components/common/DynamicCard";
import Ionicons from "@expo/vector-icons/Ionicons";
import StatusModal from "@/components/common/StatusModal";
type StudentDetails = {
  student_id: string;
  ID: string;
  exam_name: string;
  student_name: string;
  student_class?: string;
  student_section?: string;
};

const ResultPage = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [details, setDetails] = useState<StudentDetails | null>(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const studentDetails = JSON.parse(id);
    if (studentDetails && typeof studentDetails === "object") {
      setDetails({
        ID: studentDetails.ID,
        exam_name: studentDetails.examName,
        student_id: studentDetails.student_id,
        student_name: studentDetails.student_name,
        student_class: studentDetails.student_class,
        student_section: studentDetails.student_section,
      });
    }
  }, [id]);

  const fetchResults = async () => {
    if (!id || !auth.roleId) return;
    try {
      const response = await GetResultById(
        auth.roleId,
        details?.ID || "",
        details?.student_id || ""
      );
      const results = response.data.results || [];
      const structuredData = results.map((entry: any) => ({
        Title: entry.subject,
        "Total Marks": entry.total_marks,
        Grade: entry.grade,
        "Marks Scored": entry.marks,
        Remarks: entry.remarks,
      }));

      setData(structuredData);
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to fetch result details.");
    }
  };

  useEffect(() => {
    if (details) fetchResults();
  }, [details]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Results Details</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="p-4"
      >
        <View className="flex-row mb-5 justify-between items-start border-b border-gray-200 pb-4">
          <View>
            <Text className="text-xl mb-2 font-bold text-gray-900">
              {details?.student_name} (
              {details?.student_class?.startsWith("Class") ? "" : "Class"}{" "}
              {details?.student_class} - {details?.student_section})
            </Text>
          </View>
          <View className="flex-col items-start">
            <View className="px-3 py-1 rounded-full bg-primary">
              <Text className="text-white text-xs font-semibold">
                {details?.exam_name}
              </Text>
            </View>
          </View>
        </View>
        {data.length > 0 ? (
          <View className="border border-gray-300 rounded-lg overflow-hidden">
            <View className="flex-row bg-primary">
              {[
                "Subject",
                "Total",
                "Scored",
                "Grade",
                "Remarks",
              ].map((header, index) => (
                <Text
                  key={index}
                  className="flex-1 px-2 py-3 text-white font-semibold text-sm text-center border-r border-white last:border-r-0"
                >
                  {header}
                </Text>
              ))}
            </View>

            {data.map((row, idx) => (
              <View
                key={idx}
                className={`flex-row ${
                  idx % 2 === 0 ? "bg-gray-100" : "bg-white"
                } border-t border-gray-200`}
              >
                <Text className="flex-1 px-2 py-3 text-sm text-center text-gray-800 border-r border-gray-200">
                  {row.Title}
                </Text>
                <Text className="flex-1 px-2 py-3 text-sm text-center text-gray-800 border-r border-gray-200">
                  {row["Total Marks"]}
                </Text>
                <Text className="flex-1 px-2 py-3 text-sm text-center text-gray-800 border-r border-gray-200">
                  {row["Marks Scored"]}
                </Text>
                <Text className="flex-1 px-2 py-3 text-sm text-center text-gray-800 border-r border-gray-200">
                  {row.Grade}
                </Text>
                <Text className="flex-1 px-2 py-3 text-sm text-center text-gray-800">
                  {row.Remarks}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-4">
            No result entries found.
          </Text>
        )}
      </ScrollView>
      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ResultPage;
