import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { GetBookDetail } from "@/services/libraryServices";
import StatusModal from "@/components/common/StatusModal";
import Ionicons from "@expo/vector-icons/Ionicons";

interface BorrowEntry {
  _id: string;
  book_id: string;
  book_name: string;
  book_author: string;
  book_category: string;
  user_id: string;
  user_name: string;
  user_role: string;
  start_date: string;
  end_date: string;
  return_date: string;
  fine: string;
}

const SubBook = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [groupedBooks, setGroupedBooks] = useState<
    Record<string, BorrowEntry[]>
  >({});
  const [book, setBook] = useState([]);

  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchBook = async () => {
    if (!id || !auth.roleId) return;
    try {
      setLoading(true);
      const response = await GetBookDetail(
        auth.roleId,
        id.split("-")[0],
        id.split("-")[1]
      );
      const books = response.data.books || [];
      setBook(books);

      const grouped: Record<string, BorrowEntry[]> = {};
      books.forEach((entry: BorrowEntry) => {
        const key = `${entry.user_id}_${entry.book_id}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(entry);
      });

      setGroupedBooks(grouped);
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to fetch book details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#026902" />
        </View>
      ) : (
        <>
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={28} color="#026902" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              Book Transactions
            </Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
            }}
          >
            {book?.length > 0 ? (
              Object.entries(groupedBooks).map(([key, entries]) => {
                const first = entries[0];
                const isExpanded = expandedKeys[key] || false;

                return (
                  <View
                    key={key}
                    className="bg-white p-4 rounded-2xl mb-4 shadow shadow-gray-300"
                  >
                    <Text className="text-lg font-semibold mb-1">
                      📘 {first.book_name}
                    </Text>
                    <Text className="mb-1">
                      👤 {first.user_name} ({first.user_role})
                    </Text>
                    <Text className="mb-1">✍️ Author: {first.book_author}</Text>
                    <Text className="mb-2">
                      📚 Category: {first.book_category}
                    </Text>

                    <View className="bg-green-100 px-3 py-1 rounded-md w-fit mb-3">
                      <Text className="text-primary font-semibold">
                        🔄 Taken {entries.length} times
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleExpand(key)}
                      className="mb-2"
                    >
                      <Text className="text-primary font-semibold">
                        {isExpanded ? "🔽 Hide Details" : "▶️ Show Details"}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View>
                        {entries.map((entry) => (
                          <View
                            key={entry._id}
                            className="bg-gray-100 p-3 gap-1.5 rounded-lg mb-2 border-l-4 border-primary"
                          >
                            <Text>📅 Start: {entry.start_date}</Text>
                            <Text>📆 End: {entry.end_date}</Text>
                            <Text>↩️ Returned: {entry.return_date}</Text>
                            <Text>💸 Fine: ₹{entry.fine}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <Text className="text-center text-gray-500 mt-10">
                No details found for ID: {id}
              </Text>
            )}
          </ScrollView>
        </>
      )}
      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SubBook;
