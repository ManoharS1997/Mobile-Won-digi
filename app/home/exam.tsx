import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Image,
  SafeAreaView,
  Switch,
  findNodeHandle,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddExamModal from "@/components/forms/exam/ExamFormModal";
import { useRouter } from "expo-router";
import Images from "@/constant/Images";
import { useRolePermissions } from "@/constant/GetRoleAction";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import StatusModal from "@/components/common/StatusModal";
import { GetExam, UpdateExam } from "@/services/ExamServices";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import EditExamModal from "@/components/forms/exam/EditFormModal";

const Exam = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const { permissions, error } = useRolePermissions(auth.title || "", "Diary");
  const [showForm, setShowForm] = useState(false);

  const [allow, setAllow] = useState<String | string[] | null>("");
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const animatedWidth = useRef(new Animated.Value(200)).current;
  const [data, setData] = useState<any[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);
  const detailRef = useRef(null);
  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    Animated.timing(animatedWidth, {
      toValue: searchVisible ? 200 : 250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

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

  const handleExamPress = (exam: any) => {
    setSelectedExam(exam);

    // Allow state to update
    setTimeout(() => {
      const detailNode = findNodeHandle(detailRef.current);
      const scrollNode = findNodeHandle(scrollRef.current);

      if (detailNode && scrollNode) {
        UIManager.measureLayout(
          detailNode,
          scrollNode,
          () => {
            setMessageStatus("Measurement failed");
            setStatus("error");
            setVisible(true);
          },
          (x, y) => {
            scrollRef.current?.scrollTo({ y: y - 10, animated: true });
          }
        );
      }
    }, 100);
  };

  const fetchExamEntries = async () => {
    try {
      setModalSpinnerVisible(true);

      if (!auth.roleId) {
        setMessageStatus("School ID missing");
        setStatus("error");
        setVisible(true);
        return;
      }

      const response = await GetExam(auth.roleId);
      const exams = response.data.exams || [];
      const structuredExams = exams.map((exam: any) => ({
        ID: exam.exam_id,
        Title: exam.exam_name,
        Status: exam.exam_status,
        examId: exam.exam_id,
        examName: exam.exam_name,
        examTitle: exam.exam_name,
        start_date: exam.start_date,
        end_date: exam.end_date,
        exam_classes: exam.exam_classes,
        timetable: parseTimetable(exam?.timetable),
      }));

      setData(structuredExams);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch exam entries");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    fetchExamEntries();
  }, [auth.roleId]);

  const handleSort = () => {
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.timetable[0]?.date || "2100-01-01").getTime();
      const dateB = new Date(b.timetable[0]?.date || "2100-01-01").getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
    setSortAsc(!sortAsc);
    setData(sorted);
  };

  const handleSwitchExam = async (id: string, value: boolean) => {
    const response = await UpdateExam(auth.roleId || "", id, {
      exam_status: value ? "active" : "inactive",
    });
    if (response.data.success) fetchExamEntries();
  };

  const filteredData = data.filter((exam) =>
    exam.Title?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
          <Ionicons name="chevron-back-outline" size={28} color={"#026902"} />
        </TouchableOpacity>

        {searchVisible ? (
          <Animated.View style={{ width: animatedWidth }}>
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="border border-gray-300 rounded-md px-3 text-base h-10 text-black bg-white"
              autoFocus
            />
          </Animated.View>
        ) : (
          <View className="h-10 flex-row items-center justify-center gap-2.5">
            <Text className="text-xl font-semibold">EXAMS</Text>
            <Image
              source={Images.exam}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </View>
        )}

        <View className="flex-row items-center space-x-4 ml-2 gap-5">
          <TouchableOpacity onPress={toggleSearch}>
            <Ionicons
              name={searchVisible ? "close-outline" : "search"}
              size={24}
              color={"#026902"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSort}>
            <Ionicons
              name={sortAsc ? "arrow-down-outline" : "arrow-up-outline"}
              size={24}
              color={"#026902"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="px-4 pb-6"
      >
        <View className="bg-white p-4 rounded-lg mb-6 border border-gray-200 min-h-[200px]">
          {filteredData.length === 0 ? (
            <Text className="text-center text-gray-500 mt-4">
              No exams found.
            </Text>
          ) : (
            filteredData.map((exam, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleExamPress(exam)}
                className={`flex-row justify-between items-center p-3 rounded-lg mb-3 border ${
                  selectedExam?.ID === exam.ID
                    ? "bg-green-100 border-primary"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <View>
                  <Text className="font-semibold text-base text-black">
                    {exam.Title}
                  </Text>
                  <Text className="text-xs text-gray-600">ID: {exam.ID}</Text>
                  <Text className="text-xs text-gray-600">
                    Status: {exam.Status}
                  </Text>
                </View>

                <Switch
                  value={exam?.Status?.toLowerCase() === "active"}
                  onValueChange={(value) => handleSwitchExam(exam.ID, value)}
                />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View
          ref={detailRef}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <View className="mb-3">
            <Text className="text-lg font-bold text-green-800  text-center">
              Exam Details
            </Text>
            {auth.role === "staff" && allow === "Edit" && selectedExam && (
              <TouchableOpacity
                className="absolute right-2.5"
                onPress={() => setShowForm(true)}
              >
                <FontAwesome name="edit" size={25} color="#026902" />
              </TouchableOpacity>
            )}
          </View>
          {selectedExam ? (
            <View>
              <Text className="font-bold text-lg mb-2 text-black">
                {selectedExam.examTitle}
              </Text>
              <Text className="text-sm text-gray-700 mb-1">
                Exam ID: {selectedExam.examId}
              </Text>
              <Text className="text-sm text-gray-700 mb-1">
                Exam Name: {selectedExam.examName}
              </Text>
              <Text className="text-sm text-gray-700 mb-1">
                Start Date: {selectedExam.start_date}
              </Text>
              <Text className="text-sm text-gray-700 mb-1">
                End Date: {selectedExam.end_date}
              </Text>
              <Text className="text-sm text-gray-700 mb-1">
                Exam Classes: {selectedExam.exam_classes?.join(", ") || "N/A"}
              </Text>
              <Text className="font-semibold text-sm mb-2 text-black">
                Timetable:
              </Text>
              {Array.isArray(selectedExam?.timetable) &&
                selectedExam?.timetable.map((item: any, idx: number) => (
                  <View
                    key={idx}
                    className="mb-2 p-3 border-l-4 border-green-500 bg-gray-50 rounded"
                  >
                    <Text className="text-sm text-black">
                      📅 Date: {item.date} ( {item.day} )
                    </Text>
                    <Text className="text-sm text-black">
                      📘 Subject: {item.subject}
                    </Text>
                    <Text className="text-sm text-black">
                      📝 Marks: {item.marks}
                    </Text>
                    <Text className="text-sm text-black">
                      📄 Syllabus: {item.syllabus}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text className="text-center text-gray-500">
              Select an exam to view its details.
            </Text>
          )}
        </View>
      </ScrollView>

      {(allow === "Edit" ||
        (Array.isArray(allow) && allow.includes("Edit"))) && (
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="absolute bottom-6 right-6 bg-green-600 p-4 rounded-full shadow-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <AddExamModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={fetchExamEntries}
        dataLen={data.length}
      />
      <EditExamModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        details={selectedExam}
        onSubmit={() => {
          fetchExamEntries();
          setSelectedExam(null);
        }}
      />
      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
      {isModalSpinnerVisible && (
        <View className="flex-1">
          <Loader
            isModalSpinnerVisible={isModalSpinnerVisible}
            setModalSpinnerVisible={setModalSpinnerVisible}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Exam;
