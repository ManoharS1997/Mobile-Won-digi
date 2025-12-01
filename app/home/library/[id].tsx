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
import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/common/StatusModal";
import { GetLibraryByUserAndBook } from "@/services/libraryServices";
import EditLibraryModal from "@/components/forms/library/EditLibraryModal";
import { useRolePermissions } from "@/constant/GetRoleAction";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type IssuedBook = {
  _id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  book_id: string;
  sub_id: string;
  book_name: string;
  book_author: string;
  book_category: string;
  start_date: string;
  return_date: string;
  end_date: string;
  return_book: string;
  fine: string;
  book_added_at: string;
  book_added_by: string;
  book_modified_by: string;
  book_modified_at: string;
  library_schoolid: string;
};

const BookDetailsPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { studentId, bookId } = JSON.parse(id);
  const router = useRouter();
  const { auth } = useAuth();

  const [book, setBook] = useState<IssuedBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Library"
  );
  const [allow, setAllow] = useState<String | string[] | null>("");
  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const fetchUserAndBook = async () => {
    if (!id || !auth.roleId) return;
    try {
      setLoading(true);
      const response = await GetLibraryByUserAndBook(
        auth.roleId,
        studentId,
        bookId
      );
      setBook(response.data.books?.[0] || null);
    } catch (error: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(
        error.response.data.message || "Failed to fetch issued book details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndBook();
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
          Issued Book Details
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
            <Text className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
              {book.book_name} ({book.book_category})
            </Text>
            <View className="flex-row flex-wrap gap-x-4 justify-between">
              <View className="flex-1 min-w-[48%]">
                {renderRow("Book ID", book.book_id)}
                {renderRow("Sub ID", book.sub_id)}
                {renderRow("Author", book.book_author)}
                {renderRow(
                  "Issued To",
                  `${book.user_name} (${book.user_role})`
                )}
              </View>

              <View className="flex-1 min-w-[48%]">
                {renderRow("Issued Date", book.start_date)}
                {renderRow(
                  "Return Date",
                  book.return_date === null || book.return_date === "null"
                    ? "NA"
                    : book.return_date
                )}
                {renderRow(
                  "Returned?",
                  book.return_book?.toLowerCase() === "yes" ? "Yes" : "No"
                )}
                {renderRow("Fine", book.fine)}
              </View>
            </View>

            {renderRow("Issued By", book.book_added_by)}
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            No issued book({bookId}) details found for ID : {studentId}
          </Text>
        )}
      </ScrollView>

      <EditLibraryModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        details={book}
        onSubmit={() => {
          fetchUserAndBook();
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
