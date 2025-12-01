import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { PostCalendar } from "@/services/calendarServices";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/common/StatusModal";
import moment from "moment";

const screenWidth = Dimensions.get("window").width;
const containerWidth =
  screenWidth >= 1024 ? "40%" : screenWidth >= 768 ? "65%" : "90%";

const CalendarFormModal = ({
  fetchCalendarEntries,
  setModalVisible,
  modalVisible,
  dataLen,
  selectedDate,
}: any) => {
  const { auth } = useAuth();
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const hideStartDatePicker = () => setStartDatePickerVisible(false);
  const [isLoading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const generateCalendarId = (length: number) => {
    const idNumber = length + 1;
    return `E${String(idNumber).padStart(7, "0")}`;
  };

  const [formData, setFormData] = useState({
    event_id: generateCalendarId(dataLen),
    event_title: "",
    event_description: "",
    event_start_date: "",
    event_end_date: "",
    event_created_by: auth.email,
    event_modified_by: auth.email,
    event_schoolid: auth.roleId,
  });

  useEffect(() => {
    if (selectedDate) {
      const nowUTC = moment.utc();
      const utcOffsetISTMinutes = 330;
      const nowIST = nowUTC.clone().add(utcOffsetISTMinutes, "minutes");
      const formattedTimeIST = nowIST.format("HH:mm:ss.SSS");
      const istOffsetHours = Math.floor(utcOffsetISTMinutes / 60);
      const istOffsetMinutes = utcOffsetISTMinutes % 60;
      const istOffsetSign = utcOffsetISTMinutes >= 0 ? "+" : "-";
      const formattedOffsetIST = `${istOffsetSign}${String(
        Math.abs(istOffsetHours)
      ).padStart(2, "0")}:${String(Math.abs(istOffsetMinutes)).padStart(
        2,
        "0"
      )}`;
      const combinedDateTimeIST = `${selectedDate}T${formattedTimeIST}${formattedOffsetIST}`;
      if (combinedDateTimeIST) {
        setFormData({
          ...formData,
          event_start_date: combinedDateTimeIST,
        });
        setStartDate(selectedDate);
      }
    }
  }, [selectedDate]);

  const handleStartConfirm = (date: Date) => {
    setStartDate(date);
    hideStartDatePicker();
    setFormData({ ...formData, event_start_date: date?.toISOString() });
  };

  const hideEndDatePicker = () => setEndDatePickerVisible(false);
  const handleEndConfirm = (date: Date) => {
    setEndDate(date);
    hideEndDatePicker();
    setFormData({ ...formData, event_end_date: date?.toISOString() });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const handleSaveActivity = async () => {
    if (!formData.event_start_date || !formData.event_title.trim()) {
      setMessageStatus(
        "Please select start and end dates and provide a title."
      );
      setStatus("error");
      setVisible(true);
      return;
    }

    const endOfDay = new Date(formData.event_start_date);
    endOfDay.setUTCHours(0, 0, 0, 0);
    const formattedEndDate = endOfDay.toISOString();

    const newEventData = {
      ...formData,
      event_end_date:
        formData.event_end_date?.length > 0
          ? formData.event_end_date
          : formattedEndDate,
    };

    setLoading(true);

    try {
      const response = await PostCalendar(newEventData);
      if (response?.data?.success) {
        setMessageStatus("Activity added successfully!");
        setStatus("success");
        setVisible(true);
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (error: any) {
      setMessageStatus(error?.response?.data?.message || "Submission failed.");
      setStatus("error");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center bg-black/50 bg-opacity-40">
          <View
            style={{ width: containerWidth }}
            className="bg-white rounded-2xl p-6"
          >
            <Text className="text-xl font-bold mb-3 text-gray-800">
              Add Event
            </Text>
            <View>
              <Text className="text-sm font-bold mb-1 text-gray-800">
                Title
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 h-10 mb-3"
                value={formData.event_title || ""}
                onChangeText={(val) =>
                  setFormData({ ...formData, event_title: val })
                }
              />
            </View>
            <View>
              <Text className="text-sm font-bold mb-1 text-gray-800">
                Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-1.5 h-20 mb-3"
                value={formData.event_description || ""}
                onChangeText={(val) =>
                  setFormData({ ...formData, event_description: val })
                }
                textAlignVertical="top"
                multiline={true}
                numberOfLines={3}
              />
            </View>

            <View className="p-4 bg-white rounded-2xl border border-gray-300">
              <Text className="text-lg font-semibold mb-3 text-[#026902]">
                Select Date Range
              </Text>

              <TouchableOpacity
                className="flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-50"
                onPress={() => setStartDatePickerVisible(true)}
              >
                <Text className="text-base text-gray-700">
                  {startDate ? formatDate(startDate) : "Select Start Date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#026902" />
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isStartDatePickerVisible}
                mode="date"
                onConfirm={handleStartConfirm}
                onCancel={() => setStartDatePickerVisible(false)}
                themeVariant="light"
                pickerContainerStyleIOS={{ backgroundColor: "white" }}
                buttonTextColorIOS="#026902"
                customCancelButtonIOS={() => (
                  <Pressable
                    className="bg-red-500 p-5 rounded-2xl items-center"
                    onPress={() => setStartDatePickerVisible(false)}
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

              <TouchableOpacity
                className="flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
                onPress={() => setEndDatePickerVisible(true)}
              >
                <Text className="text-base text-gray-700">
                  {endDate ? formatDate(endDate) : "Select End Date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#026902" />
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isEndDatePickerVisible}
                mode="date"
                onConfirm={handleEndConfirm}
                onCancel={() => setEndDatePickerVisible(false)}
                themeVariant="light"
                pickerContainerStyleIOS={{ backgroundColor: "white" }}
                buttonTextColorIOS="#026902"
                customCancelButtonIOS={() => (
                  <Pressable
                    className="bg-red-500 p-5 rounded-2xl items-center"
                    onPress={() => setEndDatePickerVisible(false)}
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
            </View>

            <View className="flex-row justify-end mt-4 gap-3">
              <TouchableOpacity
                className="px-4 py-2 rounded-xl bg-gray-200"
                onPress={() => {
                  setModalVisible(false);
                  setFormData({
                    event_id: generateCalendarId(dataLen),
                    event_title: "",
                    event_description: "",
                    event_start_date: "",
                    event_end_date: "",
                    event_created_by: auth.email,
                    event_modified_by: auth.email,
                    event_schoolid: auth.roleId,
                  });
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-xl bg-[#026902]"
                onPress={handleSaveActivity}
              >
                {isLoading ? (
                  <ActivityIndicator size={15} color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <StatusModal
            visible={visible}
            status={status}
            message={messageStatus}
            onClose={() => {
              setVisible(false);
              if (status === "success") {
                setTimeout(() => {
                  fetchCalendarEntries();
                  setModalVisible(false);
                  setFormData({
                    event_id: generateCalendarId(dataLen),
                    event_title: "",
                    event_description: "",
                    event_start_date: "",
                    event_end_date: "",
                    event_created_by: auth.email,
                    event_modified_by: auth.email,
                    event_schoolid: auth.roleId,
                  });
                  setStartDate(null);
                  setEndDate(null);
                }, 200);
              }
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CalendarFormModal;
