import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ScrollView, Alert } from "react-native";
import { GetCircular } from "@/services/circularServices";
import { useAuth } from "@/context/AuthContext";
import moment from "moment";

const CircularCard = () => {
  const { auth } = useAuth();
  const [circulars, setCirculars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCircularEntries = async () => {
    try {
      setLoading(true);

      if (!auth.roleId) {
        return;
      }

      const response = await GetCircular(auth.roleId);
      const entries = response.data?.circulars || [];
      const today = moment().startOf("day");

      const upcomingCirculars = entries.filter((entry: any) => {
        const circularDate = moment(entry.circular_date, "DD-MM-YYYY");
        return (
          circularDate.isSameOrAfter(today) &&
          entry.circular_status.toLowerCase() === "active"
        );
      });

      setCirculars(upcomingCirculars);
    } catch (err: any) {
      Alert.alert("Failed to fetch circulars", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircularEntries();
  }, [auth.roleId]);

  if (loading) {
    return (
      <Text className="text-center text-sm text-gray-600">Loading...</Text>
    );
  }

  if (circulars.length === 0) {
    return (
      <Text className="text-center text-sm text-gray-500 mt-2">
        No upcoming circulars.
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{ width: "100%", maxHeight: 250 }}
    >
      <FlatList
        data={circulars}
        keyExtractor={(item) => item.circular_id}
        renderItem={({ item }) => (
          <View className="bg-green-50 p-4 rounded-xl border border-green-100 mb-3">
            <Text className="text-base font-semibold text-primary">
              {item.circular_title}
            </Text>
            <Text className="text-xs text-primary mt-1">
              Date: {item.circular_date}
            </Text>
            <Text className="text-xs text-primary mt-0.5">
              Subject: {item.circular_subject}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default CircularCard;
