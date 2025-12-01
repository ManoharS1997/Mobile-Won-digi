import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";

type TimeTableEntry = {
  _id: string;
  period: string;
  subject: string;
  staff: string;
  start: string;
  end: string;
};

type TimetableTimings = {
  [day: string]: TimeTableEntry[];
};

type RouteParams = {
  timings: string;
  name: string;
};

const TimetableDetail = () => {
  const { auth } = useAuth();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const router = useRouter();
  const { timings, name } = route.params;

  let parsedTimings: TimetableTimings = {};
  const rawTimings = JSON.parse(timings);
  parsedTimings =
    auth.role === "staff" &&
    auth.title !== "Principal" &&
    auth.title !== "Head of Department"
      ? Object.entries(rawTimings).reduce((acc, [day, entries]: any) => {
          const filteredEntries = entries.filter(
            (entry: any) => entry.staffId === auth.userId
          );

          if (filteredEntries.length > 0) {
            acc[day] = filteredEntries;
          }

          return acc;
        }, {} as TimetableTimings)
      : rawTimings;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        className="px-4 pt-6 bg-white"
      >
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={28} color="#026902" />
          </TouchableOpacity>
          <Text className="text-3xl font-extrabold text-primary text-center">
            {name}
          </Text>
          <View></View>
        </View>

        {Object.entries(parsedTimings).map(([day, entries]) => (
          <View
            key={day}
            className="mb-6 bg-white rounded-2xl p-4 border border-gray-200"
          >
            <Text className="text-xl font-bold text-primary mb-3 border-b border-primary pb-1">
              {day}
            </Text>

            <View className="flex-row justify-between mb-2 px-1">
              <Text className="flex-1 text-sm font-semibold text-gray-600">
                Period
              </Text>
              <Text className="flex-1 text-sm font-semibold text-gray-600">
                Subject
              </Text>
              <Text className="flex-1 text-sm font-semibold text-gray-600">
                Staff
              </Text>
              <Text className="flex-1 text-sm font-semibold text-gray-600">
                Start
              </Text>
              <Text className="flex-1 text-sm font-semibold text-gray-600">
                End
              </Text>
            </View>

            {entries.map((entry) => (
              <View
                key={entry._id}
                className="flex-row justify-between items-center py-2 border-t border-gray-100"
              >
                <Text className="flex-1 text-sm text-gray-700">
                  {entry.period || "-"}
                </Text>
                <Text className="flex-1 text-sm text-gray-700">
                  {entry.subject || "-"}
                </Text>
                <Text className="flex-1 text-sm text-gray-700">
                  {entry.staff || "-"}
                </Text>
                <Text className="flex-1 text-sm text-gray-700">
                  {entry.start || "-"}
                </Text>
                <Text className="flex-1 text-sm text-gray-700">
                  {entry.end || "-"}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TimetableDetail;
