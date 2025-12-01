import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { Ionicons } from "@expo/vector-icons";

interface Notification {
  id: string;
  title: string;
  time: string;
  content: string;
  read: string;
}

interface NotificationListProps {
  data: Notification[];
  onDelete: (id: string) => void;
}

export const NotificationList = ({ data, onDelete }: NotificationListProps) => {
  const renderItem = ({ item }: { item: Notification }) => {
    const isRead = item.read === "true";

    return (
      <View
        className={`mx-4 my-1 px-4 py-4 rounded-xl border ${
          isRead ? "bg-white border-gray-200" : "bg-gray-100 border-gray-300"
        }`}
      >
        <View className="flex-row justify-between items-start">
          <Text className="text-black font-semibold text-sm flex-1 pr-2">
            {item.title}
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">{item.time}</Text>
        </View>
        <Text
          numberOfLines={2}
          className="text-gray-700 text-sm leading-snug mt-1"
        >
          {item.content}
        </Text>
      </View>
    );
  };

  const renderHiddenItem = ({ item }: { item: Notification }) => {
    return (
      <View className="flex-1 flex-row justify-end items-center pr-4">
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          className="bg-red-600 justify-center items-center w-[60px] h-[75%] rounded-xl"
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SwipeListView
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      rightOpenValue={-70}
      disableRightSwipe
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      ListEmptyComponent={() => (
        <View className="flex-1 justify-center items-center mt-20">
          <Text className="text-gray-500 text-base">No notifications</Text>
        </View>
      )}
    />
  );
};
