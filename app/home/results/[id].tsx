import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { GetExam } from "@/services/ExamServices";
import StatusModal from "@/components/common/StatusModal";

type ExamEntry = {
  student_id: string;
  ID: string;
  student_name: string;
  student_class?: string;
  student_section?: string;
};

type Exam = {
  exam_id: string;
  exam_name: string;
  start_date: string;
  end_date: string;
  timetable: string;
};

const Results = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { auth } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [details, setDetails] = useState<ExamEntry | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);

  const fetchExams = async () => {
    if (!id || !auth.roleId) return;

    try {
      setLoading(true);
      const response = await GetExam(auth.roleId);
      setExams(response.data.exams || []);
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to fetch exam details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const studentDetails = JSON.parse(id);
    if (studentDetails && typeof studentDetails === "object") {
      setDetails({
        ID: studentDetails.id,
        student_id: studentDetails.student_id,
        student_name: studentDetails.student_name,
        student_class: studentDetails.student_class,
        student_section: studentDetails.student_section,
      });
    }
    fetchExams();
  }, [id]);

  const renderExamCard = (exam: Exam, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() =>
          router.push({
            pathname: "/home/results/result/[id]",
            params: {
              id: JSON.stringify({
                ...details,
                ID: exam?.exam_id,
                examName: exam?.exam_name,
              }),
            },
          })
        }
        className="border border-gray-300 p-4 rounded-xl mb-4 bg-white"
      >
        <Text className="text-lg font-bold text-gray-900">
          {exam.exam_name}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Exam ID: {exam.exam_id}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Duration: {exam.start_date} to {exam.end_date}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/home/results")}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Results Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#026902"
                className="mt-10"
              />
            ) : (
              <>
                {details && (
                  <View className="px-4 pt-5 space-y-4 border-b border-gray-200 pb-4 mb-6">
                    <Text className="text-sm text-gray-600 mr-5">
                      Id: {details.student_id}
                    </Text>
                    <Text className="text-xl my-1.5 font-bold text-gray-900">
                      {details.student_name}
                    </Text>
                    <Text className="text-lg font-medium text-gray-900">
                      Class:{" "}
                      {details.student_class?.startsWith("Class")
                        ? ""
                        : "Class"}{" "}
                      {details.student_class}-{details.student_section}
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        }
        data={exams}
        keyExtractor={(item) => item.exam_id}
        renderItem={({ item, index }) => renderExamCard(item, index)}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center text-gray-500 mt-4">
              No exams found.
            </Text>
          ) : null
        }
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

export default Results;
