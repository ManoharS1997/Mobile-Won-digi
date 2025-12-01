import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { GetExam } from "@/services/ExamServices";
import Loader from "@/components/common/Loader";
import CustomDropdown from "@/components/common/CustomDropdown";

const ExamDashboard = ({ setVisible, setStatus, setMessageStatus }: any) => {
  const { auth } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [upcomingTimetable, setUpcomingTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const parseTimetable = (timetableStr: any) => {
    try {
      const parsed =
        typeof timetableStr === "string"
          ? JSON.parse(timetableStr)
          : Array.isArray(timetableStr)
          ? timetableStr
          : [];
      return Array.isArray(parsed)
        ? parsed.map((item: any, index: number) => ({
            id: `${index + 1}`,
            ...item,
          }))
        : [];
    } catch (error) {
      return [];
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      if (!auth.roleId) {
        throw new Error("School ID is missing");
      }

      const response = await GetExam(auth.roleId);
      const examData = response.data.exams || [];

      const formattedExams = examData.map((exam: any) => ({
        label: exam.exam_name,
        value: exam.exam_id,
        start_date: exam.start_date,
        end_date: exam.end_date,
        timetable: parseTimetable(exam.timetable),
      }));

      setExams(formattedExams);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch exams");
      setStatus("error");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (_field: string, val: string) => {
    setSelectedExamId(val);
    const exam = exams.find((e) => e.value === val || e.label === val);
    if (exam) {
      const today = new Date();
      const upcoming = exam.timetable.filter((entry: any) => {
        return new Date(entry.date) >= today;
      });
      setUpcomingTimetable(upcoming);
    } else {
      setUpcomingTimetable([]);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [auth.roleId]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="py-6">
        <Text className="text-2xl font-bold text-green-700 text-center mb-6">
          📘 Upcoming Exams
        </Text>

        <View className="mb-4">
          <CustomDropdown
            label=""
            value={selectedExamId}
            onChange={(val) => handleChange("exam", val)}
            options={exams}
            placeholder="Select an Exam"
          />
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-5">
          <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
            🗓️ Exam Timetable
          </Text>

          {selectedExamId === "" ? (
            <Text className="text-center text-gray-500">
              Please select an exam to view the timetable.
            </Text>
          ) : upcomingTimetable.length === 0 ? (
            <Text className="text-center text-gray-500">
              No upcoming timetable found.
            </Text>
          ) : (
            <View className="space-y-4">
              {upcomingTimetable.map((item, index) => (
                <View
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <Text className="text-sm text-black font-semibold mb-1">
                    📅 Date: {item.date} ({item.day})
                  </Text>
                  <Text className="text-sm text-gray-800 mb-1">
                    📘 Subject: {item.subject}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    📄 Syllabus: {item.syllabus}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <Loader
        isModalSpinnerVisible={loading}
        setModalSpinnerVisible={setLoading}
      />
    </View>
  );
};

export default ExamDashboard;
