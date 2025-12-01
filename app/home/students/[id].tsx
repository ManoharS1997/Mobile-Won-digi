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
import { useAuth } from "@/context/AuthContext";
import { GetStudentById } from "@/services/studentServices"; // Assuming you have this service
import StatusModal from "@/components/common/StatusModal";
import { useRolePermissions } from "@/constant/GetRoleAction";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import EditStudentForm from "@/components/forms/student/EditStudentForm";

type StudentEntry = {
  __v: number;
  _id: string;
  id: string;
  parent_occupation: string;
  password?: string;
  relation_to_student: string;
  role: "student";
  student_additional: any[];
  student_city: string;
  student_class: string;
  student_contact: string;
  student_created_at: string;
  student_date_of_birth: string;
  student_email: string;
  student_emergency_contact: string;
  student_emergency_gurdian: string;
  student_emergency_relation: string;
  student_gender: "male" | "female" | "other";
  student_guardian_name: string;
  student_id: string;
  student_last_grade: string;
  student_medical: string;
  student_name: string;
  student_nationality: string;
  student_pincode: string;
  student_preffered_date: string;
  student_previous_school: any[];
  student_roll: string;
  student_school: string;
  student_schoolid: string;
  student_section: string;
  student_services: any[];
  student_specify: string;
  student_state: string;
  student_status: "active" | "inactive";
  student_street: string;
};

const statusColors: Record<string, string> = {
  active: "#16a34a",
  inactive: "#dc2626",
};

const StudentDetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auth } = useAuth();
  const [details, setDetails] = useState<StudentEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [allow, setAllow] = useState<String | string[] | null>("");
  const [showForm, setShowForm] = useState(false);
  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Students"
  );

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const fetchStudentDetails = async () => {
    if (!id || !auth.roleId) return;

    try {
      setLoading(true);
      const response = await GetStudentById(id, auth.roleId);
      const student = response.data?.students?.[0];
      setDetails(student);
    } catch (error: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(error.message || "Failed to fetch student details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [id, auth.roleId]);

  const renderRow = (label: string, value?: string | number | any) => {
    if (value === null || value === undefined) return null;

    let displayValue = value;
    if (Array.isArray(value)) {
      displayValue = value.join(", ");
    }

    return (
      <View className="py-3 border-b border-gray-200">
        <Text className="text-xs text-gray-500 uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-base text-gray-800 font-medium mt-1">
          {displayValue}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/home/students")}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Student Details
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
                {details.student_name}
              </Text>
              <View className="mt-2 flex-row items-center space-x-2">
                <Text className="text-sm text-gray-600 mr-5">Status:</Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      statusColors[details.student_status.toLowerCase()] ||
                      "#9ca3af",
                  }}
                >
                  <Text className="text-white text-xs font-semibold">
                    {details.student_status.toLowerCase()}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600 mt-1">
                Student ID: {details.student_id}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                Roll No: {details.student_roll}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {`${details.student_class.startsWith("Class") ? "" : "Class"} ${
                  details.student_class
                } - ${details.student_section}`}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-x-4 justify-between">
              <View className="flex-1 min-w-[48%]">
                {renderRow("Guardian Name", details.student_guardian_name)}
                {renderRow("Relation", details.relation_to_student)}
                {renderRow("Occupation", details.parent_occupation)}
                {renderRow("Email", details.student_email)}
                {renderRow("Contact", details.student_contact)}
                {renderRow(
                  "Emergency Contact",
                  details.student_emergency_contact
                )}
                {renderRow(
                  "Emergency Guardian",
                  details.student_emergency_gurdian
                )}
                {renderRow(
                  "Emergency Relation",
                  details.student_emergency_relation
                )}
              </View>

              <View className="flex-1 min-w-[48%]">
                {renderRow("Date of Birth", details.student_date_of_birth)}
                {renderRow("Gender", details.student_gender)}
                {renderRow("Nationality", details.student_nationality)}
                {renderRow("Medical Condition", details.student_medical)}
                {renderRow("Street", details.student_street)}
                {renderRow("City", details.student_city)}
                {renderRow("State", details.student_state)}
                {renderRow("Pincode", details.student_pincode)}
              </View>
            </View>
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            No details found for Student ID: {id}
          </Text>
        )}
      </ScrollView>

      <EditStudentForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        details={details}
        onSubmit={() => {
          fetchStudentDetails();
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

export default StudentDetailPage;
