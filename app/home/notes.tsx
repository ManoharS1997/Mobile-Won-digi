import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
  Easing,
  Image,
  Linking,
  FlatList,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import images from "@/constant/Images";
import { useRouter } from "expo-router";
import { useRolePermissions } from "@/constant/GetRoleAction";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import StatusModal from "@/components/common/StatusModal";
import { GetAllnotes } from "@/services/notesServices";
import NotesFormModal from "@/components/forms/notes/NotesFormModal";

const Notes = () => {
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
  const [allow, setAllow] = useState<String | string[] | null>("");
  const inputAnim = useRef(new Animated.Value(0)).current;
  const [showForm, setShowForm] = useState(false);
  const [dataLen, setDataLen] = useState(0);

  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Classnotes"
  );

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
      const aVal = a["Title"]?.toUpperCase() || "";
      const bVal = b["Title"]?.toUpperCase() || "";
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setSortAsc(!sortAsc);
    setData(sorted);
  };

  const animatedWidth = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "70%"],
  });

  const filteredData = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const fetchNotesEntries = async () => {
    try {
      setModalSpinnerVisible(true);

      if (!auth.roleId) {
        setMessageStatus("School ID missing");
        setStatus("error");
        setVisible(true);
        return;
      }

      const response = await GetAllnotes(auth.roleId);
      const notes = response.data.notes;

      let entries = notes;
      setDataLen(notes.length);

      if (
        auth.role === "staff" &&
        auth.title !== "Principal" &&
        auth.title !== "Head of Department"
      ) {
        entries = entries.filter((entry: any) => {
          return entry.notes_created_by === auth.email;
        });
      }

      if (auth.role === "student") {
        entries = entries.filter((entry: any) => {
          let entryClass = entry.student_class;
          if (entryClass.startsWith("Class")) {
            entryClass = entryClass.split(" ")[1];
          }

          return (
            entryClass === auth.className && entry.section === auth.sectionName
          );
        });
      }

      const structuredData = entries.map((entry: any) => ({
        Title: entry.file_name,
        ID: entry.notes_id,
        Subject: entry.subject,
        "Class - Section": `${
          entry.student_class.startsWith("Class") ? "" : "Class"
        } ${entry.student_class}-${entry.section}`,
        URL: entry.notes_url,
      }));

      setData(structuredData);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch notes");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    fetchNotesEntries();
  }, [auth.roleId]);

  const renderItem = ({ item }: { item: any }) => {
    const previewEntries = Object.entries(item).filter(
      ([key]) => !["Title", "ID", "Status", "URL"].includes(key)
    );

    return (
      <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-lg font-bold text-gray-800">
            📄 {item.Title}
          </Text>
          {item.URL && (
            <TouchableOpacity
              onPress={() => Linking.openURL(item.URL)}
              className="self-end bg-green-700 px-4 py-1 rounded-full"
            >
              <Text className="text-white text-sm font-semibold">
                View Note
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="border-t border-gray-200">
          {previewEntries.map(([key, value]: any, index) => (
            <View
              key={index}
              className="flex-row justify-between py-2 px-1 border-b border-gray-100"
            >
              <Text className="text-gray-600 font-medium">{key}</Text>
              <Text className="text-gray-800">{value ?? ""}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

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
              style={{
                lineHeight: Platform.OS === "ios" ? 0 : -1,
              }}
            />
          </Animated.View>
        ) : (
          <View className="h-10 flex-row items-center justify-center gap-2.5">
            <Text className="text-xl font-semibold">NOTES</Text>
            <Image
              source={images.pencil}
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

      <View className="flex-1 p-4">
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) =>
              item.ID?.toString() ?? index.toString()
            }
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        ) : (
          <Text className="text-center text-gray-500 mt-4">
            No notes found.
          </Text>
        )}
      </View>

      {auth.role === "staff" && allow === "Edit" && (
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          className="absolute bottom-6 right-6 bg-green-600 p-4 rounded-full shadow-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <NotesFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        dataLen={dataLen}
        onSubmit={() => {
          fetchNotesEntries();
        }}
      />

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />

      {isModalSpinnerVisible && (
        <Loader
          isModalSpinnerVisible={isModalSpinnerVisible}
          setModalSpinnerVisible={setModalSpinnerVisible}
        />
      )}
    </SafeAreaView>
  );
};

export default Notes;
