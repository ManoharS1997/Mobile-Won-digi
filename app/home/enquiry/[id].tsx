import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RichEditor } from "react-native-pell-rich-editor";

const EnquiryHistory = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [userQueries, setUserQueries] = useState<any[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const richTextRef = useRef<RichEditor>(null);

  useEffect(() => {
    if (id) {
      const queries = JSON.parse(id as string);
      if (queries) {
        setUserQueries(queries);
      }
    }
  }, [id]);

  const renderStatus = (status: string) => {
    const isOpen = status === "open";
    const bgColor = isOpen ? "bg-green-100" : "bg-red-100";
    const textColor = isOpen ? "text-green-700" : "text-red-700";
    const icon = isOpen ? "checkmark-circle" : "close-circle";

    return (
      <View
        className={`flex-row items-center px-2 py-1 rounded-full ${bgColor}`}
      >
        <Ionicons
          name={icon as any}
          size={14}
          color={isOpen ? "#15803d" : "#b91c1c"}
        />
        <Text className={`ml-1 text-xs font-medium capitalize ${textColor}`}>
          {status}
        </Text>
      </View>
    );
  };

  const handleCardPress = (query: any) => {
    if (query.query_status === "close") {
      let solution = query.solution || "<p>No solution provided.</p>";
      solution = solution.replace(/<br\s*\/?>/gi, "");
      setSelectedSolution(solution);
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
          <Text className="ml-2 text-base text-black">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-primary mb-6">
          My Enquiries
        </Text>

        {userQueries.length === 0 ? (
          <Text className="text-gray-500 text-center">No enquiries found.</Text>
        ) : (
          userQueries.map((query: any) => (
            <TouchableOpacity
              key={query.query_id}
              onPress={() => handleCardPress(query)}
              activeOpacity={0.7}
              className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <Text className="font-semibold text-lg text-black mb-1">
                {query.title}
              </Text>
              <Text className="text-sm text-gray-700 mb-3">
                {query.description}
              </Text>

              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500">
                  Date: {query.query_date}
                </Text>
                {renderStatus(query.query_status)}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-center items-center px-4">
          <View className="bg-white w-full rounded-xl p-4 max-h-[250px]">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold text-primary">
                Solution
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <RichEditor
              ref={richTextRef}
              initialContentHTML={
                selectedSolution || "<p>No response available.</p>"
              }
              disabled={true}
              editorStyle={{
                backgroundColor: "white",
                contentCSSText:
                  "font-size: 16px; color: #1f2937; line-height: 24px; padding: 0; margin: 0;",
              }}
              style={{
                backgroundColor: "white",
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EnquiryHistory;
