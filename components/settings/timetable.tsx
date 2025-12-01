import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import {
  GetTimeTableByClassandSection,
  GetTimeTableByName,
} from "@/services/timetableServices";

interface LoaderProps {
  setModalSpinnerVisible: (visible: boolean) => void;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageStatus: React.Dispatch<React.SetStateAction<string>>;
  setStatus: React.Dispatch<React.SetStateAction<"error" | "success">>;
}

const Timetable: React.FC<LoaderProps> = ({
  setModalSpinnerVisible,
  setVisible,
  setMessageStatus,
  setStatus,
}) => {
  const { auth } = useAuth();
  const router = useRouter();

  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [groupedTimetable, setGroupedTimetable] = useState<
    Record<string, any[]>
  >({});
  const [expandedClasses, setExpandedClasses] = useState<
    Record<string, boolean>
  >({});

  const getTimeTable = async () => {
    if (!auth.roleId || !auth.userId) {
      setMessageStatus("School ID missing");
      setStatus("error");
      setVisible(true);
      return;
    }

    try {
      setModalSpinnerVisible(true);
      const response =
        auth.role === "staff"
          ? await GetTimeTableByName(auth.roleId, auth.userId)
          : await GetTimeTableByClassandSection(
              auth.roleId,
              auth.className || "",
              auth.sectionName || ""
            );

      let timetable = response?.data?.timetable || [];

      // Staff filtering (non-HOD/Principal)
      if (
        auth.role === "staff" &&
        auth.title !== "Principal" &&
        auth.title !== "Head of Department"
      ) {
        timetable = timetable.filter((entry: any) =>
          Object.values(entry.timetable_timings || {}).some((dayEntries) =>
            (dayEntries as any[]).some(
              (session) => session.staffId === auth.userId
            )
          )
        );
      }

      setTimetableData(timetable);

      // Group for staff view
      const grouped: Record<string, any[]> = {};
      timetable.forEach((item: any) => {
        if (!grouped[item.timetable_class]) {
          grouped[item.timetable_class] = [];
        }
        grouped[item.timetable_class].push(item);
      });
      setGroupedTimetable(grouped);
    } catch (err) {
      setMessageStatus("Failed to fetch timetable");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    getTimeTable();
  }, []);

  const toggleExpand = (className: string) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      className="bg-white p-4 max-h-[500px]"
    >
      {/* STUDENT VIEW */}
      {auth.role === "student" ? (
        timetableData.length === 0 ? (
          <Text className="text-center text-gray-500 mt-8">
            No timetable available.
          </Text>
        ) : (
          timetableData.map((item: any) => (
            <TouchableOpacity
              key={item._id}
              onPress={() =>
                router.push({
                  pathname: "/home/TimetableDetail",
                  params: {
                    timings: JSON.stringify(item.timetable_timings),
                    name: `Class ${item.timetable_class}`,
                  },
                })
              }
              className="bg-white rounded-2xl p-4 mb-4 border border-gray-200"
            >
              <Text className="text-xl font-bold text-gray-800 mb-1">
                Class {item.timetable_class}
              </Text>
              <Text className="text-sm text-gray-500 mb-2">
                Academic Year: {item.timetable_year}
              </Text>

              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 font-semibold">Periods:</Text>
                <Text className="text-gray-800">
                  {item.timetable_periods}
                </Text>
              </View>

              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 font-semibold">Duration:</Text>
                <Text className="text-gray-800">
                  {item.timetable_duration}
                </Text>
              </View>

              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 font-semibold">Room:</Text>
                <Text className="text-gray-800">{item.timetable_room}</Text>
              </View>

              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 font-semibold">Status:</Text>
                <Text
                  className={`${
                    item.timetable_status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  } font-semibold`}
                >
                  {item.timetable_status}
                </Text>
              </View>

              <Text className="text-xs text-gray-400 mt-2">
                Last modified: {item.timetable_modified_at}
              </Text>
            </TouchableOpacity>
          ))
        )
      ) : Object.keys(groupedTimetable).length === 0 ? (
        <Text className="text-center text-gray-500 mt-8">
          No timetable available.
        </Text>
      ) : (
        // STAFF / HOD / PRINCIPAL VIEW
        Object.entries(groupedTimetable).map(([className, sections]) => (
          <View
            key={className}
            className="mb-4 bg-white rounded-2xl border border-gray-200"
          >
            <TouchableOpacity
              onPress={() => toggleExpand(className)}
              className="p-4 bg-gray-100 rounded-t-2xl"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-800">
                  Class {className}
                </Text>
                <Text className="text-sm text-primary">
                  {expandedClasses[className]
                    ? "Hide Sections"
                    : "View Sections"}
                </Text>
              </View>
            </TouchableOpacity>

            {expandedClasses[className] &&
              sections.map((item: any) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() =>
                    router.push({
                      pathname: "/home/TimetableDetail",
                      params: {
                        timings: JSON.stringify(item.timetable_timings),
                        name: `Class ${item.timetable_class} - Section ${item.timetable_section}`,
                      },
                    })
                  }
                  className="p-4 border-t border-gray-200"
                >
                  <Text className="text-base font-semibold text-gray-700 mb-1">
                    Section {item.timetable_section}
                  </Text>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600 font-medium">Periods:</Text>
                    <Text className="text-gray-800">
                      {item.timetable_periods}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600 font-medium">Duration:</Text>
                    <Text className="text-gray-800">
                      {item.timetable_duration}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600 font-medium">Room:</Text>
                    <Text className="text-gray-800">
                      {item.timetable_room}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600 font-medium">Status:</Text>
                    <Text
                      className={`font-semibold ${
                        item.timetable_status === "Active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.timetable_status}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400 mt-1">
                    Last modified: {item.timetable_modified_at}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default Timetable;
