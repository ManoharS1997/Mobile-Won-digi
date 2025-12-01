import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import Entypo from "@expo/vector-icons/Entypo";

type HeaderType = { [key: string]: string | undefined };

type DynamicCardProps = {
  headers: HeaderType;
  onViewDetails?: (data: HeaderType) => void;
};

const StatusBadge = memo(({ status }: { status?: string }) => {
  if (!status) return null;
  const lower = status.toLowerCase();

  if (lower === "active") {
    return <Fontisto name="checkbox-active" size={14} color="#059669" />;
  }

  if (lower === "inactive") {
    return <Entypo name="circle-with-cross" size={16} color="#ef4444" />;
  }

  if (lower === "paid") {
    return (
      <View className="bg-green-500 px-1.5 py-0.5 rounded-full">
        <Text className="text-white text-[10px] font-semibold">{status}</Text>
      </View>
    );
  }

  if (lower.includes("available")) {
    const parts = status.split(" ");
    const quantity = parseInt(parts[0], 10);
    const isAvailable = !isNaN(quantity) && quantity > 0;
    const bgColor = isAvailable ? "bg-green-600" : "bg-red-500";

    return (
      <View className={`${bgColor} px-1.5 py-0.5 rounded-full`}>
        <Text className="text-white text-[10px] font-semibold">{status}</Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-400 px-1.5 py-0.5 rounded-full">
      <Text className="text-white text-[10px] font-semibold">{status}</Text>
    </View>
  );
});

const CardContent = memo(
  ({
    title,
    status,
    previewEntries,
  }: {
    title: string;
    status?: string;
    previewEntries: [string, string | undefined][];
  }) => (
    <View className="bg-white rounded-lg px-3 py-2 mb-3 border border-gray-200 shadow-sm">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
          {title}
        </Text>
        <StatusBadge status={status} />
      </View>

      {/* Compact Key-Value Grid */}
      <View className="flex-row flex-wrap justify-between mt-1">
        {previewEntries.map(([key, value], index) => (
          <View key={index} className="w-[48%] mb-1">
            <Text className="text-[11px] text-gray-500 font-medium">{key}</Text>
            <Text className="text-[12px] text-gray-800" numberOfLines={1}>
              {value ?? ""}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
);

const DynamicCard: React.FC<DynamicCardProps> = ({ headers, onViewDetails }) => {
  const entries = Object.entries(headers || {});
  if (entries.length === 0) return null;

  const titleEntry = entries[0];
  const statusEntry = entries.find(([key]) => key.toLowerCase() === "status");

  const displayEntries = entries.filter(
    ([key]) =>
      key !== titleEntry[0] &&
      key !== statusEntry?.[0] &&
      key.toLowerCase() !== "id"
  );

  const previewEntries = displayEntries.slice(0, 4);
  const hasMore = entries.length > 6;

  const card = (
    <CardContent
      title={titleEntry[1] ?? ""}
      status={statusEntry?.[1]}
      previewEntries={previewEntries}
    />
  );

  return hasMore ? (
    <TouchableOpacity
      onPress={() => onViewDetails?.(headers)}
      activeOpacity={0.85}
    >
      {card}
    </TouchableOpacity>
  ) : (
    card
  );
};

export default memo(DynamicCard);
