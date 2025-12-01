import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
  Easing,
  Image,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import images from "@/constant/Images";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import StatusModal from "@/components/common/StatusModal";
import DynamicCard from "@/components/common/DynamicCard";
import { GetBook, GetUser } from "@/services/libraryServices";
import { useRolePermissions } from "@/constant/GetRoleAction";
import LibraryFormModal from "@/components/forms/library/AddLibraryFormModal";
import BookFormModal from "@/components/forms/library/AddBookFormModal";

const Library = () => {
  const { auth } = useAuth();
  const router = useRouter();

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [viewMode, setViewMode] = useState<"books" | "library">("books");
  const [allow, setAllow] = useState<String | string[] | null>("");
  const [showForm, setShowForm] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [dataLen, setDataLen] = useState(0);

  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Library"
  );

  useEffect(() => {
    if (auth.role === "student") {
      setViewMode("library");
    }
  }, [auth.role]);

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const inputAnim = useRef(new Animated.Value(0)).current;

  const toggleSearch = () => {
    if (searchVisible) {
      Animated.timing(inputAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        setSearchVisible(false);
        setSearchQuery("");
      });
    } else {
      setSearchVisible(true);
      Animated.timing(inputAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSort = () => {
    const sorted = [...data].sort((a, b) => {
      const field = "Title";
      const aVal = a[field]?.toUpperCase() || "";
      const bVal = b[field]?.toUpperCase() || "";
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setSortAsc(!sortAsc);
    setData(sorted);
  };

  const animatedWidth = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "70%"],
  });

  const fetchBookEntries = async () => {
    try {
      setModalSpinnerVisible(true);
      const response = await GetBook(auth.roleId || "");
      const entries = response.data.books || [];
      setDataLen(entries.length);
      const structuredData = entries.map((book: any) => ({
        Title: `${book.book_name} (${book.book_category})`,
        ID: book.book_id,
        Author: book.book_author,
        Description: book.book_description,
        Copies: book.copies,
        Price: `₹${book.book_price}`,
        Publisher: book.book_publishers,
        Location: `Aisle ${book.aisle_number}, Rack ${book.rack_number}, ${book.quadrant}`,
        Purchased: book.book_purchase_date,
        Status: `${
          book.books.filter((b: any) => b.status === "Available").length
        }/${book.books.length} Available`,
      }));

      setData(structuredData);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch book entries");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const fetchLibraryUsers = async () => {
    try {
      setModalSpinnerVisible(true);
      const response = await GetUser(auth.roleId || "");
      let entries = response.data.libraryusers || [];
      if (auth.role === "student") {
        entries = entries.filter((entry: any) => entry.user_id === auth.userId);
      }
      setDataLen(entries.length);

      const structuredData = entries.map((entry: any) => {
        const isReturned = entry.return_book?.toLowerCase() === "yes";

        return {
          Title: `${entry.user_name} (${entry.user_role})`,
          ID: entry.user_id,
          Book: `${entry.book_name} by ${entry.book_author}`,
          Category: entry.book_category,
          Returned: isReturned ? "Yes" : "No",
          ...(isReturned
            ? {}
            : {
                Start: entry.start_date,
                Due: entry.end_date,
                ReturnDate:
                  entry.return_date === "null"
                    ? "Not returned"
                    : entry.return_date,
                Fine: `₹${entry.fine}`,
                BookId: entry.book_id,
              }),
        };
      });

      setData(structuredData);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch library data");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    if (viewMode === "books") {
      fetchBookEntries();
    } else {
      fetchLibraryUsers();
    }
  }, [viewMode]);

  const filteredData = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
          <Ionicons name="chevron-back-outline" size={28} color={"#026902"} />
        </TouchableOpacity>

        {searchVisible ? (
          <Animated.View style={{ width: animatedWidth }}>
            <TextInput
              placeholder="Search..."
              placeholderTextColor={"#6b7280"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="border border-gray-300 rounded-md px-3 text-base h-10 text-black bg-white"
              autoFocus
              style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
            />
          </Animated.View>
        ) : (
          <View className="h-10 flex-row items-center justify-center gap-2.5">
            <Text className="text-xl font-semibold">LIBRARY</Text>
            <Image
              source={images.library}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </View>
        )}

        <View className="flex-row items-center space-x-4 ml-2 gap-5">
          <TouchableOpacity onPress={toggleSearch}>
            <Ionicons
              name={searchVisible ? "close-outline" : "search"}
              size={24}
              color={"#026902"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSort}>
            <Ionicons
              name={sortAsc ? "arrow-down-outline" : "arrow-up-outline"}
              size={24}
              color={"#026902"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {auth.role !== "student" && (
        <View className="flex-row justify-around px-4 py-2 bg-white">
          <TouchableOpacity
            className={`px-4 w-[48%] h-[3rem] flex justify-center items-center rounded-xl ${
              viewMode === "books" ? "bg-green-600" : "bg-gray-300"
            }`}
            onPress={() => setViewMode("books")}
          >
            <Text className="text-white font-semibold">Books</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 w-[48%] h-[3rem] flex justify-center items-center rounded-xl ${
              viewMode === "library" ? "bg-green-600" : "bg-gray-300"
            }`}
            onPress={() => setViewMode("library")}
          >
            <Text className="text-white font-semibold">Library</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="px-4 mt-2">
        {filteredData.map((item, index) => (
          <DynamicCard
            key={index}
            headers={item}
            onViewDetails={() =>
              router.push({
                pathname:
                  viewMode === "books"
                    ? "/home/library/book/[id]"
                    : "/home/library/[id]",
                params: {
                  id:
                    viewMode === "books"
                      ? item.ID
                      : JSON.stringify({
                          studentId: item.ID,
                          bookId: item.BookId,
                        }),
                },
              })
            }
          />
        ))}
      </ScrollView>

      {auth.role === "staff" && allow === "Edit" && (
        <TouchableOpacity
          onPress={() => {
            viewMode === "books" ? setShowBookForm(true) : setShowForm(true);
          }}
          className="absolute bottom-6 right-6 bg-green-600 p-4 rounded-full shadow-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <LibraryFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        dataLen={dataLen}
        onSubmit={() => {
          fetchLibraryUsers();
        }}
      />

      <BookFormModal
        visible={showBookForm}
        onClose={() => setShowBookForm(false)}
        dataLen={dataLen}
        onSubmit={() => {
          fetchBookEntries();
        }}
      />

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />

      <View className="flex-1">
        <Loader
          isModalSpinnerVisible={isModalSpinnerVisible}
          setModalSpinnerVisible={setModalSpinnerVisible}
        />
      </View>
    </SafeAreaView>
  );
};

export default Library;
