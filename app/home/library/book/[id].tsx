import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/common/StatusModal";
import { GetBookById } from "@/services/libraryServices";
import { generateBarcodeHTML } from "@/constant/generateBarcode";
import { WebView } from "react-native-webview";
import { useRolePermissions } from "@/constant/GetRoleAction";
import EditBookModal from "@/components/forms/library/EditBookModal";

type BookEntry = {
  _id: string;
  book_id: string;
  book_name: string;
  book_description: string;
  copies: string;
  book_author: string;
  book_publishers: string;
  book_purchase_date: string;
  book_category: string;
  book_price: string;
  aisle_number: string;
  rack_number: string;
  quadrant: string;
  refer_id: string;
  book_school: string;
  book_schoolid: string;
  book_status: string;
  book_created_at: string;
  book_added_by: string;
  last_modified_by: string;
  books: {
    book_sub_id: string;
    sub_id: string;
    status: string;
    original_barcode: string;
    _id: string;
  }[];
};

const statusColors: Record<string, string> = {
  active: "#16a34a",
  inactive: "#dc2626",
};

const BookDetailsPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auth } = useAuth();

  const [book, setBook] = useState<BookEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Library"
  );
  const [allow, setAllow] = useState<String | string[] | null>("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const fetchBook = async () => {
    if (!id || !auth.roleId) return;

    try {
      setLoading(true);
      const response = await GetBookById(id, auth.roleId);
      setBook(response.data.book?.[0] || null);
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

  const renderRow = (label: string, value?: string | number) => {
    if (!value) return null;
    return (
      <View className="py-3 border-b border-gray-200">
        <Text className="text-xs text-gray-500 uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-base text-gray-800 font-medium mt-1">
          {value}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/home/library")}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Book Details
        </Text>
        {auth.role === "staff" && allow === "Edit" && (
          <TouchableOpacity onPress={() => setShowForm(true)}>
            <FontAwesome name="edit" size={25} color="#026902" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="px-4 pt-5 pb-10"
      >
        {loading ? (
          <ActivityIndicator size="large" color="#026902" className="mt-10" />
        ) : book ? (
          <View className="space-y-4">
            <View className="border-b border-gray-200 pb-4">
              <Text className="text-xl font-bold text-gray-900">
                {book.book_name} ({book.book_category})
              </Text>
              <View className="mt-2 flex-row items-center space-x-2">
                <Text className="text-sm text-gray-600 mr-5">Status:</Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      statusColors[book.book_status.toLowerCase()] || "#9ca3af",
                  }}
                >
                  <Text className="text-white text-xs font-semibold">
                    {book.book_status}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-x-4 justify-between">
              <View className="flex-1 min-w-[48%]">
                {renderRow("Book ID", book.book_id)}
                {renderRow("Author", book.book_author)}
                {renderRow("Publisher", book.book_publishers)}
                {renderRow("Price", book.book_price)}
                {renderRow("Purchase Date", book.book_purchase_date)}
              </View>

              <View className="flex-1 min-w-[48%]">
                {renderRow("Copies", book.copies)}
                {renderRow("Aisle Number", book.aisle_number)}
                {renderRow("Rack Number", book.rack_number)}
                {renderRow("Quadrant", book.quadrant)}
                {renderRow("School", book.book_school)}
              </View>
            </View>
            {renderRow("Description", book.book_description)}
            {renderRow("Modified By", book.last_modified_by)}

            <View className="mt-6">
              <Text className="text-lg font-bold text-gray-800 mb-2">
                Sub Copies
              </Text>
              <View className="flex-row justify-start items-center gap-2.5 flex-wrap">
                {book.books.map((copy, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      router.push({
                        pathname: "/home/library/book/sub/[id]",
                        params: { id: copy.book_sub_id },
                      })
                    }
                    className="h-20 border p-2 border-gray-300 rounded-md"
                  >
                    <Text className="text-sm mb-1">{copy.book_sub_id}</Text>
                    <WebView
                      originWhitelist={["*"]}
                      source={{ html: generateBarcodeHTML(copy.book_sub_id) }}
                      style={{ height: 100 }}
                      scrollEnabled={false}
                    />
                    {copy.original_barcode !== "" && (
                      <Text
                        style={{
                          textAlign: "center",
                          marginTop: 5,
                          fontSize: 12,
                          color: "gray",
                        }}
                      >
                        Original: {copy.original_barcode}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            No details found for ID: {id}
          </Text>
        )}
      </ScrollView>

      <EditBookModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        details={book}
        onSubmit={() => {
          fetchBook();
        }}
      />

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
};

export default BookDetailsPage;
