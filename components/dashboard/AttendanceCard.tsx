import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { useAuth } from "@/context/AuthContext";
import { GetAttendanceForStudent } from "@/services/attendanceServices";
import { StackedBarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

interface AttendanceRecord {
  attendence_date: string;
  attendence_status: "p" | "a";
}

const AttendanceCard = ({ setVisible, setStatus, setMessageStatus }: any) => {
  const { auth } = useAuth();
  const [startDate, setStartDate] = useState<Date>(
    moment().subtract(6, "days").toDate()
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isPickerVisible, setPickerVisible] = useState<boolean>(false);
  const [isSelectingStart, setIsSelectingStart] = useState<boolean>(true);
  const [data, setData] = useState<AttendanceRecord[]>([]);

  const studentAttendance = async () => {
    try {
      const res = await GetAttendanceForStudent(
        auth.roleId || "",
        auth.userId || ""
      );
      if (res?.data.success) {
        setData(res.data.working);
      } else {
        setData([]);
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data.message || "Attendance not found."
      );
      setStatus("error");
      setVisible(true);
    }
  };

  useEffect(() => {
    studentAttendance();
  }, []);

  const showPicker = (isStart: boolean) => {
    setIsSelectingStart(isStart);
    setPickerVisible(true);
  };

  const handleDateConfirm = (date: Date) => {
    isSelectingStart ? setStartDate(date) : setEndDate(date);
    setPickerVisible(false);
  };

  const filteredData = data.filter((rec) => {
    const date = new Date(rec.attendence_date);
    return date >= startDate && date <= endDate;
  });

  const grouped = groupByDate(filteredData);

  const chartLabels: string[] = [];
  const chartData: number[][] = [];
  const chartColors: string[][] = [];
  const chartValues: string[][] = [];

  Object.entries(grouped).forEach(([date, { present, absent }]) => {
    const formattedDate = moment(date).format("DD/MM");
    chartLabels.push(formattedDate);

    const values: number[] = [];
    const colors: string[] = [];
    const labels: string[] = [];

    if (present > 0 && absent > 0) {
      values.push(present, absent);
      colors.push("#4CAF50", "#F44336");
      labels.push(`${present} P`, `${absent} A`);
    } else if (present > 0) {
      values.push(present);
      colors.push("#4CAF50");
      labels.push(`${present} P`);
    } else if (absent > 0) {
      values.push(0, absent);
      colors.push("#4CAF50", "#F44336");
      labels.push("", `${absent} A`);
    }

    chartData.push(values);
    chartColors.push(colors);
    chartValues.push(labels);
  });

  return (
    <View className="p-4 bg-white rounded-xl border border-gray-200">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-bold text-lg">Attendance</Text>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => showPicker(true)}>
            <Text className="text-primary mx-1">
              📅 {moment(startDate).format("DD/MM")}
            </Text>
          </TouchableOpacity>
          <Text> - </Text>
          <TouchableOpacity onPress={() => showPicker(false)}>
            <Text className="text-primary mx-1">
              {moment(endDate).format("DD/MM")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {chartData.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-end">
            <StackedBarChart
              data={{
                labels: chartLabels,
                legend: [],
                data: chartData,
                barColors: ["#4CAF50", "#F44336"],
              }}
              width={Math.max(chartLabels.length * 60, screenWidth - 40)}
              height={280}
              yAxisSuffix=""
              yAxisLabel="P "
              yAxisInterval={1}
              formatYLabel={(y) => String(Math.round(Number(y)))}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => "#000",
                labelColor: () => "#000",
                propsForLabels: {
                  fontSize: 10,
                },
                barPercentage: 0.7,
                propsForBackgroundLines: {
                  strokeDasharray: "4",
                  strokeWidth: 0,
                  stroke: `rgba(0, 0, 0, 0)`,
                },
              }}
              style={{
                marginVertical: 10,
                borderRadius: 16,
              }}
              yLabelsOffset={5}
              hideLegend={false}
            />
          </View>
        </ScrollView>
      ) : (
        <Text className="text-center mt-8">No attendance data found</Text>
      )}

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setPickerVisible(false)}
        date={isSelectingStart ? startDate : endDate}
        themeVariant="light"
        pickerContainerStyleIOS={{ backgroundColor: "white" }}
        buttonTextColorIOS="#026902"
        customCancelButtonIOS={() => (
          <Pressable
            className="bg-red-600 p-3 rounded-xl items-center mt-2"
            onPress={() => setPickerVisible(false)}
          >
            <Text className="text-white font-bold">Cancel</Text>
          </Pressable>
        )}
        customHeaderIOS={() => (
          <View className="p-2 bg-white border-b border-gray-300">
            <Text className="text-lg font-bold">Select Date</Text>
          </View>
        )}
      />
    </View>
  );
};

const groupByDate = (
  records: AttendanceRecord[]
): { [date: string]: { present: number; absent: number } } => {
  const grouped: { [date: string]: { present: number; absent: number } } = {};
  records.forEach((rec) => {
    const date = moment(rec.attendence_date).format("YYYY-MM-DD");
    if (!grouped[date]) {
      grouped[date] = { present: 0, absent: 0 };
    }
    if (rec.attendence_status === "p") {
      grouped[date].present += 1;
    } else {
      grouped[date].absent += 1;
    }
  });
  return grouped;
};

export default AttendanceCard;
