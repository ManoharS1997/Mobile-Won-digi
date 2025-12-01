import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  GetAttendanceForStaff,
  UpdateStaffAttendance,
  PostStaffAttendance,
} from "@/services/attendanceServices";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react-native";

const QuickAttendanceCard = ({
  setVisible,
  setStatus,
  setMessageStatus,
}: any) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<
    null | "present" | "absent" | "halfday"
  >(null);
  const [today, setToday] = useState<string>("");
  const { auth } = useAuth();

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setToday(currentDate);
  }, []);

  const fetchStaffAttendance = async () => {
    try {
      const response = await GetAttendanceForStaff(
        auth.roleId || "",
        today,
        auth.title || "",
        ""
      );
      const entries = response.data.staff || [];
      setStaff(entries);
      const structured = entries.map((a: any) => ({
        Name: a.staff_name,
        ID: a.staff_id,
        Status:
          a.attendence_status === "p"
            ? "present"
            : a.attendence_status === "a"
            ? "absent"
            : a.attendence_status === "h"
            ? "halfday"
            : null,
        attendanceId: a.attendence_id,
      }));

      setData(structured);

      const current = structured.find((x: any) => x.ID === auth.userId);
      if (current?.Status) {
        setSelectedStatus(current.Status);
        setIsUpdate(true);
      } else {
        setSelectedStatus(null);
        setIsUpdate(false);
      }
    } catch (err: any) {
      setMessageStatus(err?.response?.data?.message || "Attendance not found.");
      setStatus("error");
      setVisible(true);
    }
  };

  useEffect(() => {
    if (today) fetchStaffAttendance();
  }, [today]);

  const saveAttendance = async () => {
    if (!selectedStatus) return;

    const status = selectedStatus as "present" | "absent" | "halfday";
    const uniqueId = `${auth.userId}-${today}`;
    const existingAttendance = data.find(
      (att) => att.attendanceId === uniqueId
    );
    const staffDetails = staff.find((s) => s.staff_id === auth.userId);
    const attendancePayload = {
      attendence_id: uniqueId,
      staff_id: auth.userId,
      staff_name: staffDetails?.staff_name || "",
      staff_gender: staffDetails?.staff_gender || "",
      staff_contact: staffDetails?.staff_contact || "",
      staff_city: staffDetails?.staff_city || "",
      staff_photo: staffDetails?.staff_photo || "",
      staff_title: staffDetails?.staff_title || "",
      staff_department: staffDetails?.staff_department || "",
      staff_class: staffDetails?.staff_class || "",
      staff_section: staffDetails?.staff_section || "",
      period: "1",
      attendence_date: today,
      attendence_status: status[0],
      attendence_modified_date: today,
      created_by: auth.email,
      modified_by: auth.email,
      school_id: auth.roleId,
    };

    try {
      setLoadingStatus(status);

      if (existingAttendance) {
        await UpdateStaffAttendance(auth.roleId || "", uniqueId, {
          attendence_status: status[0],
          attendence_modified_date: new Date().toISOString(),
          modified_by: auth.email,
        });

        setIsUpdate(false);
        setMessageStatus("Attendance updated.");
        setStatus("success");
        setVisible(true);
      } else {
        await PostStaffAttendance(attendancePayload);
        setIsUpdate(true);
        setMessageStatus("Attendance saved.");
        setStatus("success");
        setVisible(true);
      }

      fetchStaffAttendance();
    } catch (err: any) {
      setMessageStatus(err?.response?.data?.message || "Attendance not found.");
      setStatus("error");
      setVisible(true);
    } finally {
      setLoadingStatus(null);
    }
  };

  const handleStatusChange = (status: "present" | "absent" | "halfday") => {
    setSelectedStatus(status);
  };

  const isSelected = (status: string) => selectedStatus === status;

  return (
    <View className="bg-white rounded-2xl p-6 border border-gray-200 mb-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Mark Your Attendance
      </Text>

      <View className="flex-row justify-between gap-3">
        {/* Present */}
        <TouchableOpacity
          onPress={() => handleStatusChange("present")}
          className={`flex-1 items-center justify-center p-4 rounded-xl border
            ${
              isSelected("present")
                ? "bg-green-500 border-green-600"
                : "bg-gray-100 border-gray-300"
            }`}
        >
          <CheckCircle
            size={32}
            color={isSelected("present") ? "white" : "#22c55e"}
          />
          <Text
            className={`mt-2 text-base font-medium ${
              isSelected("present") ? "text-white" : "text-green-600"
            }`}
          >
            Present
          </Text>
        </TouchableOpacity>

        {/* Absent */}
        <TouchableOpacity
          onPress={() => handleStatusChange("absent")}
          className={`flex-1 items-center justify-center p-4 rounded-xl border
            ${
              isSelected("absent")
                ? "bg-red-500 border-red-600"
                : "bg-gray-100 border-gray-300"
            }`}
        >
          <XCircle
            size={32}
            color={isSelected("absent") ? "white" : "#ef4444"}
          />
          <Text
            className={`mt-2 text-base font-medium ${
              isSelected("absent") ? "text-white" : "text-red-600"
            }`}
          >
            Absent
          </Text>
        </TouchableOpacity>

        {/* Half Day */}
        <TouchableOpacity
          onPress={() => handleStatusChange("halfday")}
          className={`flex-1 items-center justify-center p-4 rounded-xl border
            ${
              isSelected("halfday")
                ? "bg-yellow-500 border-yellow-600"
                : "bg-gray-100 border-gray-300"
            }`}
        >
          <MinusCircle
            size={32}
            color={isSelected("halfday") ? "white" : "#eab308"}
          />
          <Text
            className={`mt-2 text-base font-medium ${
              isSelected("halfday") ? "text-white" : "text-yellow-600"
            }`}
          >
            Half Day
          </Text>
        </TouchableOpacity>
      </View>

      {selectedStatus && (
        <View className="mt-5 flex-row justify-end">
          <TouchableOpacity
            onPress={saveAttendance}
            className="px-4 py-3 rounded-xl bg-primary w-[100px] items-center"
          >
            {loadingStatus === selectedStatus ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white text-base font-semibold">
                {isUpdate ? "Update" : "Save"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default QuickAttendanceCard;
