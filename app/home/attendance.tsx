import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
  Easing,
  Image,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import images from "@/constant/Images";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import StatusModal from "@/components/common/StatusModal";
import { useRolePermissions } from "@/constant/GetRoleAction";
import {
  GetStudentsForAttendance,
  PostAttendance,
  UpdateAttendance,
  GetAttendanceForStaff,
  GetRole,
  PostStaffAttendance,
  UpdateStaffAttendance,
} from "@/services/attendanceServices";
import CustomDropdown from "@/components/common/CustomDropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { Icon } from "react-native-paper";

type OptionType = { label: string; value: string };

const Attendance = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"student" | "staff">("student");
  const staffData = {
    date: format(new Date().toISOString(), "yyyy-MM-dd"),
    title: auth.title,
    department: "",
  };

  const studentData = {
    date: format(new Date().toISOString(), "yyyy-MM-dd"),
    student_class: auth.className || "1",
    student_section: auth.sectionName || "A",
    period: "1",
  };

  const [form, setForm] = useState<any>(
    viewMode === "staff" ? staffData : studentData
  );

  useEffect(() => {
    if (auth.role === "staff" && auth.title?.toLowerCase() === "driver") {
      setViewMode("staff");
      setForm({ ...staffData, ...studentData });
    }
  }, [auth]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [student, setStudent] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [allow, setAllow] = useState<String | string[] | null>("");
  const [showFilters, setShowFilters] = useState(true);

  const inputAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(1)).current;

  const animatedWidth = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "70%"],
  });

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    handleChange("date", dateStr);
    setShowDatePicker(false);
  };

  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Attendance"
  );

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const toggleSearch = () => {
    if (searchVisible) {
      Animated.timing(inputAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        setSearchVisible(false);
        setSearchQuery("");
      });
    } else {
      setSearchVisible(true);
      Animated.timing(inputAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  };

  const toggleFilters = () => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => setShowFilters(!showFilters));
  };

  const handleSort = () => {
    const sorted = [...data].sort((a, b) => {
      const field = "Name";
      const aVal = a[field]?.toUpperCase() || "";
      const bVal = b[field]?.toUpperCase() || "";
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setSortAsc(!sortAsc);
    setData(sorted);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const fetchStudentAttendance = async () => {
    try {
      setModalSpinnerVisible(true);
      const response = await GetStudentsForAttendance(
        auth.roleId || "",
        form.date,
        form.student_class,
        form.student_section,
        form.period
      );
      const entries = response.data.student || [];
      setStudent(entries);
      const structured = entries.map((a: any) => ({
        Name: `${a.student_name} (${
          a.student_class.startsWith("Class") ? "" : "Class"
        } ${a.student_class}-${a.student_section})`,
        ID: a.student_id,
        "Working Days": a.working_days,
        Presents: a.presents,
        Date: form.date,
        Status:
          a.attendence_status === "p"
            ? "Present"
            : a.attendence_status === "a"
            ? "Absent"
            : "u",
        attendanceId: a.attendence_id,
      }));
      setData(structured || []);
    } catch (err: any) {
      setMessageStatus(
        err.response.data.message || "Failed to fetch student attendance"
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };
  const fetchRole = async () => {
    try {
      setModalSpinnerVisible(true);
      const response = await GetRole(auth.roleId || "");
      const entries = response.data.roles || [];

      const structured = entries.map((a: any) => ({
        label: a.role_name,
        value: a.role_name,
      }));
      setRoleData(structured);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch student attendance");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const fetchStaffAttendance = async () => {
    try {
      setModalSpinnerVisible(true);
      const response = await GetAttendanceForStaff(
        auth.roleId || "",
        form.date,
        form.title,
        form.department
      );

      const entries = response.data.staff || [];
      setStaff(entries);

      const structured = entries.map((a: any) => ({
        Name: `${a.staff_name}`,
        ID: a.staff_id,
        "Working Days": a.working_days,
        Presents: a.presents,
        Date: form.date,
        Status:
          a.attendence_status === "p"
            ? "Present"
            : a.attendence_status === "a"
            ? "Absent"
            : a.attendence_status === "h"
            ? "Half Day"
            : "NA",
        attendanceId: a.attendence_id,
      }));
      setData(structured || []);
    } catch (err: any) {
      setMessageStatus(
        err.response.data.message || "Failed to fetch student attendance"
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    if (viewMode === "student") {
      fetchStudentAttendance();
    } else {
      fetchStaffAttendance();
      fetchRole();
    }
  }, [viewMode]);

  const filteredData = data?.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const dropdownFields: Record<string, OptionType[]> = {
    student_class: [
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
    ].map((cls) => ({
      label: cls,
      value: cls,
    })),
    student_section: ["A", "B", "C", "D", "E"].map((sec) => ({
      label: sec,
      value: sec,
    })),
    period: Array.from({ length: 8 }, (_, i) => ({
      label: `${i + 1}`,
      value: `${i + 1}`,
    })),
  };

  const dropdownStaffFields: Record<string, OptionType[]> = {
    title: roleData || [],
    department: [
      "Telugu",
      "Hindi",
      "English",
      "Maths",
      "Chemistry",
      "Social",
      "Others",
    ].map((sec) => ({
      label: sec,
      value: sec,
    })),
  };

  const formFields = ["date", "student_class", "student_section", "period"];
  const formStaffFields = ["date", "title", "department"];

  const updateStudentAttendance = async (id: string, status: string) => {
    const uniqueId = `${id}-${form.date}-${form.period}`;
    const existingAttendance = data.find(
      (attendence) => attendence.attendanceId === uniqueId
    );

    const existingStudent = student.find(
      (student) => student.student_id === id
    );

    const attendanceData = {
      attendence_id: uniqueId,
      student_id: existingStudent ? existingStudent.student_id : id,
      student_roll: existingStudent ? existingStudent.student_roll : "1",
      student_name: existingStudent ? existingStudent.student_name : "1",
      student_class: existingStudent ? existingStudent.student_class : "1",
      student_section: existingStudent ? existingStudent.student_section : "1",
      period: form.period,
      attendence_date: form.date,
      attendence_status: status,
      created_by: auth.email,
      modified_by: auth.email,
      school_id: auth.roleId,
    };
    try {
      setModalSpinnerVisible(true);
      if (existingAttendance) {
        const response = await UpdateAttendance(auth.roleId || "", uniqueId, {
          attendence_status: status,
          attendence_modified_date: new Date().toISOString(),
          modified_by: auth.email,
        });
        const entries = response.data;
        if (entries.success) {
          fetchStudentAttendance();
        }
      } else {
        const response = await PostAttendance(attendanceData);
        const entries = response.data;
        if (entries.success) {
          fetchStudentAttendance();
        }
      }
    } catch (err: any) {
      setMessageStatus(
        err.response.data.message || "Failed to fetch student attendance"
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const updateStaffAttendance = async (id: string, status: string) => {
    const uniqueId = `${id}-${form.date}`;
    const existingAttendance = data.find(
      (attendence) => attendence.attendanceId === uniqueId
    );

    const existingStaff = staff.find((staff) => staff.staff_id === id);

    const attendanceData = {
      attendence_id: uniqueId,
      staff_id: existingStaff ? existingStaff.staff_id : id,
      staff_name: existingStaff ? existingStaff.staff_name : "",
      staff_gender: existingStaff ? existingStaff.staff_gender : "",
      staff_contact: existingStaff ? existingStaff.staff_contact : "",
      staff_city: existingStaff ? existingStaff.staff_city : "",
      staff_photo: existingStaff ? existingStaff.staff_photo : "",
      staff_title: existingStaff ? existingStaff.staff_title : "",
      staff_department: existingStaff ? existingStaff.staff_department : "",
      staff_class: existingStaff ? existingStaff.staff_class : "",
      staff_section: existingStaff ? existingStaff.staff_section : "",
      period: "1",
      attendence_date: form.date,
      attendence_status: status,
      attendence_modified_date: form.date,
      created_by: auth.email,
      modified_by: auth.email,
      school_id: auth.roleId,
    };
    try {
      setModalSpinnerVisible(true);
      if (existingAttendance) {
        const response = await UpdateStaffAttendance(
          auth.roleId || "",
          uniqueId,
          {
            attendence_status: status,
            attendence_modified_date: new Date().toISOString(),
            modified_by: auth.email,
          }
        );
        const entries = response.data;
        if (entries.success) {
          fetchStaffAttendance();
        }
      } else {
        const response = await PostStaffAttendance(attendanceData);
        const entries = response.data;
        if (entries.success) {
          fetchStaffAttendance();
        }
      }
    } catch (err: any) {
      setMessageStatus(
        err.response.data.message || "Failed to fetch student attendance"
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

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
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="border border-gray-300 rounded-md px-3 text-base h-10 text-black bg-white"
            />
          </Animated.View>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-semibold">ATTENDANCE</Text>
            <Image
              source={images.attendance}
              style={{ width: 20, height: 20 }}
            />
          </View>
        )}

        <View className="flex-row items-center gap-5">
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
      <View>
        {auth.role === "staff" && auth.title?.toLowerCase() != "driver" && (
          <View className="flex-row justify-between items-center px-4 py-2 bg-white">
            <View className="flex-row gap-2 flex-1">
              {["student", "staff"].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  className={`flex-1 h-12 justify-center items-center rounded-xl ${
                    viewMode === mode ? "bg-green-600" : "bg-gray-300"
                  }`}
                  onPress={() => {
                    setViewMode(mode as "student" | "staff");
                    setForm(
                      mode === "student"
                        ? {
                            ...form,
                            date: format(
                              new Date().toISOString(),
                              "yyyy-MM-dd"
                            ),
                            student_class: auth.className || "1",
                            student_section: auth.sectionName || "A",
                            period: "1",
                          }
                        : {
                            ...form,
                            date: format(
                              new Date().toISOString(),
                              "yyyy-MM-dd"
                            ),
                            title: auth.title,
                            department: "Telugu",
                          }
                    );
                  }}
                >
                  <Text className="text-white font-semibold capitalize">
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter icon on the same row */}
            <TouchableOpacity
              onPress={toggleFilters}
              className="ml-3 p-2 rounded-md"
            >
              <Icon
                source={showFilters ? "filter-off-outline" : "filter-outline"}
                color="#15803d"
                size={24}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Animated.View
        style={{
          overflow: "hidden",
          opacity: filterAnim,
          height: filterAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [
              0,
              viewMode === "student" && auth.role === "staff"
                ? 360
                : auth.role === "staff"
                ? 280
                : 200,
            ],
          }),
        }}
      >
        {viewMode === "student" ? (
          <View className="px-4 mt-2 space-y-2">
            {formFields
              .filter(
                (field) =>
                  !(
                    auth.role === "student" &&
                    (field === "student_class" || field === "student_section")
                  )
              )
              .map((field) => (
                <View key={field} className="mb-4">
                  <Text className="text-sm text-gray-700 mb-1 capitalize">
                    {field.replace(/_/g, " ")}
                  </Text>
                  {dropdownFields[field] ? (
                    <CustomDropdown
                      label=""
                      value={form[field]}
                      onChange={(val) => handleChange(field, val)}
                      options={dropdownFields[field]}
                    />
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      >
                        <Text className="text-base text-black">
                          {form[field] || "Select date"}
                        </Text>
                        <Feather name="calendar" size={20} color="#026902" />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={showDatePicker}
                        mode="date"
                        onConfirm={handleDateConfirm}
                        onCancel={() => setShowDatePicker(false)}
                        themeVariant="light"
                        pickerContainerStyleIOS={{ backgroundColor: "white" }}
                        buttonTextColorIOS="#026902"
                        customCancelButtonIOS={() => (
                          <Pressable
                            className="bg-red-500 p-5 rounded-2xl items-center"
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text className="text-white font-semibold">
                              Cancel
                            </Text>
                          </Pressable>
                        )}
                        customHeaderIOS={() => (
                          <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
                            <Text className="text-lg font-semibold text-primary">
                              Select Date
                            </Text>
                          </View>
                        )}
                      />
                    </>
                  )}
                </View>
              ))}
            <TouchableOpacity
              onPress={fetchStudentAttendance}
              className="bg-green-600 p-3 rounded-lg items-center"
            >
              <Text className="text-white font-semibold">Fetch Attendance</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-4 mt-2 space-y-2">
            {formStaffFields.map((field) => (
              <View key={field} className="mb-4">
                <Text className="text-sm text-gray-700 mb-1 capitalize">
                  {field.replace(/_/g, " ")}
                </Text>
                {dropdownStaffFields[field] ? (
                  <CustomDropdown
                    label=""
                    value={form[field]}
                    onChange={(val) => handleChange(field, val)}
                    options={
                      field === "title" ? roleData : dropdownStaffFields[field]
                    }
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                    >
                      <Text className="text-base text-black">
                        {form[field] || "Select date"}
                      </Text>
                      <Feather name="calendar" size={20} color="#026902" />
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={showDatePicker}
                      mode="date"
                      onConfirm={handleDateConfirm}
                      onCancel={() => setShowDatePicker(false)}
                      themeVariant="light"
                      pickerContainerStyleIOS={{ backgroundColor: "white" }}
                      buttonTextColorIOS="#026902"
                      customCancelButtonIOS={() => (
                        <Pressable
                          className="bg-red-500 p-5 rounded-2xl items-center"
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text className="text-white font-semibold">
                            Cancel
                          </Text>
                        </Pressable>
                      )}
                      customHeaderIOS={() => (
                        <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
                          <Text className="text-lg font-semibold text-primary">
                            Select Date
                          </Text>
                        </View>
                      )}
                    />
                  </>
                )}
              </View>
            ))}
            <TouchableOpacity
              onPress={fetchStaffAttendance}
              className="bg-green-600 p-3 rounded-lg items-center"
            >
              <Text className="text-white font-semibold">Fetch Staff</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="flex-1 p-4 space-y-4"
      >
        {filteredData?.map((item, index) => (
          <View
            key={index}
            className="border border-gray-300 rounded-lg p-4 my-2 bg-white"
          >
            <Text className="text-base font-semibold text-black mb-2">
              {item.Name}
            </Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">ID: {item.ID}</Text>
              <Text className="text-sm text-gray-600">
                Working Days: {item["Working Days"]}
              </Text>
              <Text className="text-sm text-gray-600">
                Presents: {item.Presents}
              </Text>
            </View>
            {form?.period?.length > 0 && form?.date?.length && (
              <View className="flex-row items-center justify-start gap-6 mt-3">
                {[
                  "Present",
                  "Absent",
                  ...(viewMode === "staff" ? ["Half Day"] : []),
                ].map((status) => (
                  <TouchableOpacity
                    key={status}
                    disabled={allow !== "Edit"}
                    onPress={() => {
                      const statusCode =
                        status === "Present"
                          ? "p"
                          : status === "Absent"
                          ? "a"
                          : status === "Half Day"
                          ? "h"
                          : "u";

                      setData((prevData) =>
                        prevData.map((d, i) =>
                          i === index ? { ...d, Status: status } : d
                        )
                      );

                      if (viewMode === "student") {
                        updateStudentAttendance(item.ID, statusCode);
                      } else {
                        updateStaffAttendance(item.ID, statusCode);
                      }
                    }}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-2 ${
                        item.Status === status
                          ? "bg-green-600 border-green-600"
                          : "border-gray-400"
                      }`}
                    />
                    <Text className="text-gray-800">{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

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

export default Attendance;
