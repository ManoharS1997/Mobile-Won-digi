import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomDropdown from "@/components/common/CustomDropdown";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "../../common/StatusModal";
import { GetStudents } from "@/services/studentServices";
import { GetExam } from "@/services/ExamServices";
import {
  GetStudentResults,
  PostResult,
  UpdateResult,
} from "@/services/resultServices";
import { getSubjectList } from "@/constant/subject";

interface Student {
  student_id: string;
  student_name: string;
  student_roll: string;
  student_class: string;
  student_section: string;
  subject: string;
}

interface ExamOption {
  label: string;
  value: string;
  exam_id: string;
  startDate: string;
  endDate: string;
}

interface ResultFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (payload: any) => void;
}

interface ResultData {
  _id: string;
  grade: string;
  marks: string;
  remarks: string;
  student_id: string;
  subject: string;
  result_id: string;
  update: boolean;
}

interface ResultResponse {
  students?: ResultData[];
  success: boolean;
}

interface StudentInput {
  marks: string;
  remarks: string;
  grade: string;
  subject: string;
  update?: boolean;
}

interface ExistingResult {
  marks: string;
  remarks: string;
  grade: string;
  result_id: string;
  update: boolean;
}

const ResultFormModal: React.FC<ResultFormModalProps> = ({
  visible,
  dataLen,
  onClose,
  onSubmit,
}) => {
  const { auth } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filteredExams, setFilteredExams] = useState<ExamOption[]>([]);
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);

  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>("");
  const [selectedSubject, setSelectedSubject] = useState("Telugu");
  const [studentInputs, setStudentInputs] = useState<
    Record<string, StudentInput>
  >({});
  const [existingResults, setExistingResults] = useState<
    Record<string, ExistingResult>
  >({});

  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [subjectData, setSubjectData] = useState([]);

  const subjectList = async () => {
    const result = await getSubjectList(auth.roleId || "");

    if ("error" in result) {
      setStatusMessage(result.error || "Something went wrong.");
      setStatus("error");
      setModalVisible(true);
    } else {
      setSubjectData(result);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      if (!auth.roleId) {
        setStatus("error");
        setStatusMessage("School ID missing");
        setModalVisible(true);
        return;
      }

      const response = await GetStudents(auth.roleId);
      setStudents(response.data.students || []);
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(err.message || "Failed to fetch students");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamEntries = async () => {
    try {
      setLoading(true);

      if (!auth.roleId) {
        setStatusMessage("School ID missing");
        setStatus("error");
        setModalVisible(true);
        return;
      }

      const response = await GetExam(auth.roleId);
      const exams = response.data.exams || [];
      const structuredData = exams.map((entry: any) => ({
        label: entry.exam_name,
        value: entry.exam_name,
        exam_id: entry.exam_id,
        startDate: entry.start_date,
        endDate: entry.end_date,
      }));
      setFilteredExams(structuredData);
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to fetch exam entries");
      setStatus("error");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchResultByStudentEntries = async () => {
    try {
      setLoading(true);
      setExistingResults({});

      if (!auth.roleId) {
        setStatusMessage("School ID missing");
        setStatus("error");
        setModalVisible(true);
        return;
      }
      if (selectedExamId) {
        const response: { data: ResultResponse } = await GetStudentResults(
          auth.roleId,
          selectedClass?.split(" ")[1] || selectedClass,
          selectedSection,
          selectedSubject,
          selectedExamId || ""
        );
        if (response.data?.success && response.data.students) {
          const initialInputs: Record<string, ExistingResult> = {};
          response.data.students.forEach((result) => {
            initialInputs[result.student_id] = {
              marks: result.marks || "",
              remarks: result.remarks || "",
              grade: result.grade || "",
              result_id: result.result_id || "",
              update: !!result.result_id,
            };
          });
          setExistingResults(initialInputs);
        }
      }
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to fetch results entries");
      setStatus("error");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = students.filter(
      (s) =>
        (selectedClass === "" ||
          s.student_class === selectedClass ||
          s.student_class === selectedClass?.split(" ")[1]) &&
        (selectedSection === "" || s.student_section === selectedSection)
    );
    setFilteredStudents(filtered);
  }, [selectedClass, selectedSection, students]);

  useEffect(() => {
    if (auth.roleId) {
      fetchStudents();
      fetchExamEntries();
      subjectList();
    }
  }, [auth.roleId]);

  useEffect(() => {
    const filtered = filteredExams?.filter((s) => s?.value === selectedExam);
    if (filtered && filtered.length > 0) {
      setSelectedExamId(filtered[0]?.exam_id);
    } else {
      setSelectedExamId(undefined);
    }
  }, [selectedExam, filteredExams]);

  useEffect(() => {
    fetchResultByStudentEntries();
  }, [selectedExamId, selectedClass, selectedSubject, selectedSection]);

  useEffect(() => {
    const initialInputs: Record<string, StudentInput> = {};
    filteredStudents.forEach((student) => {
      initialInputs[student.student_id] = {
        marks: existingResults[student.student_id]?.marks || "",
        remarks: existingResults[student.student_id]?.remarks || "",
        grade: existingResults[student.student_id]?.grade || "",
        subject: selectedSubject,
        update: existingResults[student.student_id]?.update,
      };
    });

    setStudentInputs(initialInputs);
  }, [existingResults, filteredStudents, selectedSubject]);

  const handleInputChange = (
    id: string,
    field: "marks" | "remarks" | "grade",
    value: string
  ) => {
    setStudentInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        subject: selectedSubject,
      },
    }));
  };

  const handleUpdate = async (studentId: string) => {
    const existingResult = existingResults[studentId];
    const studentInput = studentInputs[studentId];
    const studentData = filteredStudents.find(
      (s) => s.student_id === studentId
    );

    if (!studentData || !existingResult?.result_id) return;

    const payload = {
      student_id: studentId,
      name: studentData.student_name,
      roll_no: studentData.student_roll,
      class: studentData.student_class,
      section: studentData.student_section,
      subject: selectedSubject,
      examination: selectedExam,
      exam_id: selectedExamId,
      marks: studentInput.marks,
      grade: studentInput.grade,
      remarks: studentInput.remarks,
      assigned_by: auth.email,
      staff_id: auth.userId,
      staff_email: auth.email,
      school_id: auth.roleId,
      result_modified_by: auth.email,
      result_created_by: auth.email,
    };
    setModalSpinnerVisible(true);
    try {
      const response = await UpdateResult(
        auth.roleId || "",
        existingResult.result_id,
        payload
      );
      if (response.data.success) {
        fetchResultByStudentEntries();
        onSubmit({});
      }
    } catch (err: any) {
      setStatusMessage(
        err.response?.data?.message || "Failed to update result"
      );
      setStatus("error");
      setModalVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const handleSave = async (studentId: string) => {
    const studentInput = studentInputs[studentId];
    const studentData = filteredStudents.find(
      (s) => s.student_id === studentId
    );
    const examData = filteredExams.find((s) => s.exam_id === selectedExamId);
    const resultId = `${studentId}-${selectedExamId}-${selectedSubject}`; // Corrected resultId generation

    if (!studentData || !selectedExamId) return;

    const payload = {
      result_id: resultId,
      exam_id: selectedExamId || "",
      exam_name: selectedExam || "",
      start_date: examData?.startDate || "",
      end_date: examData?.endDate || "",
      student_id: studentId,
      student_roll: studentData.student_roll,
      student_name: studentData.student_name,
      student_class: studentData.student_class,
      student_section: studentData.student_section,
      subject: selectedSubject,
      marks: studentInput.marks,
      grade: studentInput.grade,
      remarks: studentInput.remarks,
      result_created_by: auth.email || "",
      result_modified_by: auth.email || "",
      result_schoolid: auth.roleId || "",
    };

    setModalSpinnerVisible(true);
    try {
      const response = await PostResult(payload);
      if (response?.data?.success) {
        fetchResultByStudentEntries();
        onSubmit({});
      } else {
        setStatusMessage(response?.data?.message || "Failed to save result");
        setStatus("error");
        setModalVisible(true);
      }
    } catch (err: any) {
      setStatusMessage(err?.response?.data?.message || "Failed to save result");
      setStatus("error");
      setModalVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedClass("1");
    setSelectedSection("A");
    setSelectedExam("");
    setSelectedSubject("Telugu");
    setSelectedExamId(undefined);
    setStudentInputs({});
    setExistingResults({});
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
              <Text className="text-lg font-semibold">Assign Marks</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-1 capitalize">
                  Class
                </Text>
                <CustomDropdown
                  label=""
                  value={selectedClass}
                  onChange={setSelectedClass}
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
                  ].map((c) => ({
                    label: `Class ${c}`,
                    value: c,
                  }))}
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-1 capitalize">
                  Section
                </Text>
                <CustomDropdown
                  label=""
                  value={selectedSection}
                  onChange={setSelectedSection}
                  options={["A", "B", "C", "D", "E"].map((s) => ({
                    label: s,
                    value: s,
                  }))}
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-1 capitalize">
                  Subject
                </Text>
                <CustomDropdown
                  label=""
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  options={subjectData}
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-1 capitalize">
                  Examination
                </Text>
                <CustomDropdown
                  label=""
                  value={selectedExam}
                  onChange={setSelectedExam}
                  options={filteredExams}
                />
              </View>

              {loading ? (
                <ActivityIndicator className="mt-4" />
              ) : filteredStudents.length === 0 ? (
                <Text className="text-center mt-5 text-gray-500">
                  No students found
                </Text>
              ) : (
                filteredStudents.map((student, index) => (
                  <View
                    key={student.student_id}
                    className="border p-3 mt-3 rounded-xl border-gray-300"
                  >
                    <Text className="font-medium text-base">
                      {student.student_name} (Roll No: {student.student_roll})
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Class: {student.student_class} | Section:{" "}
                      {student.student_section} | Subject: {selectedSubject}
                    </Text>

                    <View className="flex-col gap-2 mt-2">
                      <View className="flex-row w-full gap-3">
                        <View className="flex-1">
                          <Text className="text-sm text-gray-600 mb-1">
                            Marks
                          </Text>
                          <TextInput
                            value={
                              studentInputs[student.student_id]?.marks || ""
                            }
                            onChangeText={(text) =>
                              handleInputChange(
                                student.student_id,
                                "marks",
                                text
                              )
                            }
                            style={{
                              lineHeight: Platform.OS === "ios" ? 0 : 1,
                            }}
                            keyboardType="numeric"
                            className="border h-10 border-gray-300 rounded-md px-3 text-base text-black"
                          />
                        </View>

                        <View className="flex-1">
                          <Text className="text-sm text-gray-600 mb-1">
                            Grade
                          </Text>
                          <TextInput
                            value={
                              studentInputs[student.student_id]?.grade || ""
                            }
                            onChangeText={(text) =>
                              handleInputChange(
                                student.student_id,
                                "grade",
                                text
                              )
                            }
                            style={{
                              lineHeight: Platform.OS === "ios" ? 0 : 1,
                            }}
                            className="border h-10 border-gray-300 rounded-md px-3 text-base text-black"
                          />
                        </View>
                      </View>
                      <View className="w-full flex-row items-end gap-2">
                        <View className="flex-1">
                          <Text className="text-sm text-gray-600 mb-1">
                            Remarks
                          </Text>
                          <TextInput
                            value={
                              studentInputs[student.student_id]?.remarks || ""
                            }
                            onChangeText={(text) =>
                              handleInputChange(
                                student.student_id,
                                "remarks",
                                text
                              )
                            }
                            style={{
                              lineHeight: Platform.OS === "ios" ? 0 : 1,
                            }}
                            className="border h-10 border-gray-300 rounded-md px-3 text-base text-black"
                          />
                        </View>
                        <TouchableOpacity
                          className="bg-green-700 h-10 flex justify-center items-center px-5 rounded-md"
                          onPress={() => {
                            setLoadingIndex(index);
                            studentInputs[student.student_id]?.update
                              ? handleUpdate(student.student_id)
                              : handleSave(student.student_id);
                          }}
                        >
                          {loadingIndex === index && isModalSpinnerVisible ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text className="text-white text-center font-semibold">
                              {studentInputs[student.student_id]?.update
                                ? "Update"
                                : "Save"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <StatusModal
              visible={modalVisible}
              status={status}
              message={statusMessage}
              onClose={() => setModalVisible(false)}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ResultFormModal;
