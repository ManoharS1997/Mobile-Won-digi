import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { DeleteCalendar, GetCalendar } from "@/services/calendarServices";
import { useAuth } from "@/context/AuthContext";
import moment from "moment";
import Loader from "@/components/common/Loader";
import StatusModal from "@/components/common/StatusModal";
import CalendarFormModal from "@/components/forms/calendar/CalendarFormModal";
import EditCalendarForm from "@/components/forms/calendar/EditCalendarForm";
import { useRolePermissions } from "@/constant/GetRoleAction";
import { useIsFocused } from "@react-navigation/native";

const CalendarScreen = () => {
  const { auth } = useAuth();
  const isFocused = useIsFocused();
  const [selectedDate, setSelectedDate] = useState("");
  const [dataLen, setDataLen] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Calendar"
  );
  const [data, setData] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [activityId, setActivityId] = useState("");
  const [allow, setAllow] = useState<String | string[] | null>("");

  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const fetchCalendarEntries = async () => {
    try {
      setModalSpinnerVisible(true);

      if (!auth.roleId) {
        setMessageStatus("School ID missing");
        setStatus("error");
        setVisible(true);
        return;
      }

      const response = await GetCalendar(auth.roleId);
      let entries = response.data?.events || [];
      setDataLen(entries.length);

      const structuredData = entries.map((entry: any) => ({
        ID: entry.event_id,
        title: entry.event_title,
        description: entry.event_description,
        startDate: entry.event_start_date,
        endDate: entry.event_end_date,
      }));

      setData(structuredData);

      const marked: {
        [date: string]: {
          marked?: boolean;
          dotColor?: string;
          customStyles?: any;
        };
      } = {};

      structuredData.forEach((entry: any) => {
        const start = moment(entry.startDate).startOf("day"); // Get the start of the day
        const end = moment(entry.endDate).startOf("day"); // Get the start of the day
        const current = moment(start);

        while (current.isSameOrBefore(end, "day")) {
          const dateStr = current.format("YYYY-MM-DD");

          if (!marked[dateStr]) {
            marked[dateStr] = {
              marked: true,
              dotColor: "#026902",
              customStyles: {
                container: {
                  backgroundColor: "#E8F5E9",
                  borderRadius: 6,
                },
                text: {
                  color: "#000",
                },
              },
            };
          }

          current.add(1, "day");
        }
      });

      setMarkedDates(marked);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch student entries");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    fetchCalendarEntries();
  }, [auth.roleId, isFocused]);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleDeleteActivity = async (id: string) => {
    setModalSpinnerVisible(true);
    try {
      const response = await DeleteCalendar(auth.roleId || "", id);
      if (response?.data?.success) {
        setMessageStatus("Activity deleted successfully!");
        setStatus("success");
        setVisible(true);
        fetchCalendarEntries();
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (error: any) {
      setMessageStatus(error?.response?.data?.message || "Deletion failed.");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: "#026902",
          todayTextColor: "#026902",
          arrowColor: "#026902",
          textSectionTitleColor: "#1f2937",
        }}
        style={{
          borderRadius: 16,
          elevation: 2,
          margin: 16,
        }}
      />

      {selectedDate && (
        <View className="mt-6 bg-gray-50 rounded-2xl p-4 shadow-sm mx-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-800">
              Activities on {moment(selectedDate).format("DD MMM")}
            </Text>
            {auth.role === "staff" && allow === "Edit" && (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="bg-[#026902] p-2 rounded-xl shadow-md"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          <View className="max-h-[300px]">
            <FlatList
              data={data.filter((item: any) => {
                const start = moment(item.startDate);
                const end = moment(item.endDate);
                const isWithinRange =
                  moment(selectedDate).isSameOrAfter(start, "day") &&
                  moment(selectedDate).isSameOrBefore(end, "day");
                return isWithinRange;
              })}
              contentContainerStyle={{
                paddingBottom:
                  Platform.OS === "ios" ? 0 : data.length > 0 ? 100 : 0,
              }}
              keyExtractor={(item) =>
                item.ID?.toString() || Math.random().toString()
              }
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-2">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-lg font-semibold text-gray-800">
                          📝 {item.title}
                        </Text>
                        {auth.role === "staff" && allow === "Edit" && (
                          <TouchableOpacity
                            onPress={() => handleDeleteActivity(item.ID)}
                          >
                            <MaterialIcons
                              name="delete"
                              size={24}
                              color="red"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600 my-2 flex-wrap">
                          {item.description
                            ?.split(/(\s+)/)
                            .map((word: any, i: any) => {
                              const urlRegex = /\b(https?:\/\/[^\s]+)/gi;
                              if (urlRegex.test(word)) {
                                return (
                                  <Text
                                    key={i}
                                    className="text-blue-600 underline"
                                    onPress={() => Linking.openURL(word)}
                                  >
                                    {word}
                                  </Text>
                                );
                              }
                              return word;
                            })}
                        </Text>
                        {auth.role === "staff" && allow === "Edit" && (
                          <TouchableOpacity
                            onPress={() => {
                              setActivityId(item.ID);
                              setModalEditVisible(true);
                            }}
                          >
                            <MaterialIcons
                              name="edit-square"
                              size={22}
                              color="gray"
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      <Text className="text-sm text-gray-500 mt-1">
                        📅 {item.startDate?.split("T")[0] || item.startDate} to{" "}
                        {item.endDate?.split("T")[0] || item.endDate}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text className="text-gray-500 italic">
                  No events scheduled for this day.
                </Text>
              }
            />
          </View>
        </View>
      )}

      <CalendarFormModal
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        dataLen={dataLen}
        fetchCalendarEntries={fetchCalendarEntries}
        selectedDate={selectedDate}
      />

      <EditCalendarForm
        activityId={activityId}
        setModalVisible={setModalEditVisible}
        modalVisible={modalEditVisible}
        fetchCalendarEntries={fetchCalendarEntries}
      />

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />

      <View className="flex-1">
        <Loader
          isModalSpinnerVisible={isModalSpinnerVisible}
          setModalSpinnerVisible={setModalSpinnerVisible}
        />
      </View>
    </SafeAreaView>
  );
};

export default CalendarScreen;
