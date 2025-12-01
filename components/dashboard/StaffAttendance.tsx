import { useAuth } from "@/context/AuthContext";
import { GetAttendanceStaff } from "@/services/attendanceServices";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const screenWidth = Dimensions.get("window").width;

type AttendanceItem = {
  attendence_date: string;
};

const AttendancePieChart = ({
  setVisible,
  setStatus,
  setMessageStatus,
}: any) => {
  const [allWorking, setAllWorking] = useState<AttendanceItem[]>([]);
  const [allPresent, setAllPresent] = useState<AttendanceItem[]>([]);
  const [allHalfs, setAllHalfs] = useState<AttendanceItem[]>([]);
  const [allHolidays, setAllHolidays] = useState<AttendanceItem[]>([]);

  const [working, setWorking] = useState(0);
  const [presents, setPresents] = useState(0);
  const [halfs, setHalfs] = useState(0);
  const [holidays, setHolidays] = useState(0);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { auth } = useAuth();

  const staffAttendance = async () => {
    try {
      const res = await GetAttendanceStaff(
        auth.roleId || "",
        auth.userId || ""
      );

      const {
        working = [],
        present = [],
        halfdays = [],
        holiday = [],
      } = res.data;

      setAllWorking(working);
      setAllPresent(present);
      setAllHalfs(halfdays);
      setAllHolidays(holiday);

      const allDates = [...working, ...present, ...halfdays, ...holiday]
        .map((item) => item.attendence_date)
        .filter(Boolean);

      const sortedDates = allDates.sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      if (sortedDates.length > 0) {
        setStartDate(new Date(sortedDates[0]));
        setEndDate(new Date(sortedDates[sortedDates.length - 1]));
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data.message || "Attendance not found."
      );
      setStatus("error");
      setVisible(true);
    }
  };

  const filterAttendanceByDateRange = () => {
    const isInRange = (dateStr: any) => {
      const d = new Date(dateStr);
      return d >= startDate && d <= endDate;
    };

    const filteredWorking = allWorking.filter((item) =>
      isInRange(item?.attendence_date)
    );
    const filteredPresent = allPresent.filter((item) =>
      isInRange(item?.attendence_date)
    );
    const filteredHalfs = allHalfs.filter((item) =>
      isInRange(item?.attendence_date)
    );
    const filteredHolidays = allHolidays.filter((item) =>
      isInRange(item?.attendence_date)
    );

    setWorking(filteredWorking.length);
    setPresents(filteredPresent.length);
    setHalfs(filteredHalfs.length);
    setHolidays(filteredHolidays.length);
  };

  useEffect(() => {
    staffAttendance();
  }, []);

  useEffect(() => {
    filterAttendanceByDateRange();
  }, [startDate, endDate, allWorking, allPresent, allHalfs, allHolidays]);

  const presentValue = presents + halfs / 2;
  const absentValue = working - presentValue;
  const holidayValue = holidays;
  const halfDayValue = halfs;

  const chartData = [
    {
      name: "Present",
      population: presentValue,
      color: "#4CAF50",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Absent",
      population: absentValue < 0 ? 0 : absentValue,
      color: "#F44336",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Half Day",
      population: halfDayValue,
      color: "#FFC107",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Holiday",
      population: holidayValue,
      color: "#2196F3",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => setShowStartPicker(true)}>
          <Text style={{ color: "#000" }}>
            📅 From: {moment(startDate).format("DD MMM YYYY")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowEndPicker(true)}>
          <Text style={{ color: "#000" }}>
            📅 To: {moment(endDate).format("DD MMM YYYY")}
          </Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        date={startDate}
        onConfirm={(date) => {
          setShowStartPicker(false);
          setStartDate(date);
        }}
        onCancel={() => setShowStartPicker(false)}
        themeVariant="light"
        pickerContainerStyleIOS={{ backgroundColor: "white" }}
        buttonTextColorIOS="#026902"
        customCancelButtonIOS={() => (
          <Pressable
            className="bg-red-500 p-5 rounded-2xl items-center"
            onPress={() => setShowStartPicker(false)}
          >
            <Text className="text-white font-semibold">Cancel</Text>
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

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        date={endDate}
        onConfirm={(date) => {
          setShowEndPicker(false);
          setEndDate(date);
        }}
        onCancel={() => setShowEndPicker(false)}
        themeVariant="light"
        pickerContainerStyleIOS={{ backgroundColor: "white" }}
        buttonTextColorIOS="#026902"
        customCancelButtonIOS={() => (
          <Pressable
            className="bg-red-500 p-5 rounded-2xl items-center"
            onPress={() => setShowEndPicker(false)}
          >
            <Text className="text-white font-semibold">Cancel</Text>
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

      <PieChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          color: () => `rgba(0, 0, 0, 1)`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

export default AttendancePieChart;
