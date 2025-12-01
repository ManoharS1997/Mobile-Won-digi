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
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import images from "@/constant/Images";
import { useRouter } from "expo-router";
import { useRolePermissions } from "@/constant/GetRoleAction";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import StatusModal from "@/components/common/StatusModal";
import DynamicCard from "@/components/common/DynamicCard";
import { GetCircular } from "@/services/circularServices";
import CircularFormModal from "@/components/forms/circular/CircularFormModal";

const Circular = () => {
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
  const [dataLen, setDataLen] = useState(0);
  const [allow, setAllow] = useState<String | string[] | null>("");
  const [showForm, setShowForm] = useState(false);

  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Circulars"
  );

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

  const filteredData = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const animatedWidth = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "70%"],
  });

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  const fetchCircularEntries = async () => {
    try {
      setModalSpinnerVisible(true);

      if (!auth.roleId) {
        setMessageStatus("School ID missing");
        setStatus("error");
        setVisible(true);
        return;
      }

      const response = await GetCircular(auth.roleId);

      let entries = response.data.circulars;

      setDataLen(entries?.length || 0);

      const structuredData = entries.map((entry: any) => ({
        Title: entry.circular_title,
        ID: entry.circular_id,
        Subject: entry.circular_subject,
        Date: entry.circular_date,
        Receiver: entry.circular_receiver,
        Status: entry?.circular_status?.toLowerCase(),
        CreatedBy: entry.circular_created_by,
        ModifiedBy: `Modified by ${entry.circular_modified_by}`,
      }));

      setData(structuredData);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch circular entries");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    fetchCircularEntries();
  }, [auth.roleId]);

  const handleViewDetails = (item: any) => {
    router.push({
      pathname: "/home/circular/[id]",
      params: { id: item.ID },
    });
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
            <Text className="text-xl font-semibold">CIRCULAR</Text>
            <Image
              source={images.bell}
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

      <View style={{ flex: 1 }}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) =>
              item.ID?.toString() ?? index.toString()
            }
            renderItem={({ item }) => (
              <DynamicCard
                headers={item}
                onViewDetails={() => handleViewDetails(item)}
              />
            )}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={{ padding: 16 }}>
            <Text className="text-center text-gray-500 mt-4">
              No assignment entries found.
            </Text>
          </View>
        )}
      </View>

      {allow === "Edit" && (
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          className="absolute bottom-6 right-6 bg-green-600 p-4 rounded-full shadow-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <CircularFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        dataLen={dataLen}
        onSubmit={() => {
          fetchCircularEntries();
        }}
      />

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />

      {isModalSpinnerVisible && (
        <View className="flex-1">
          <Loader
            isModalSpinnerVisible={isModalSpinnerVisible}
            setModalSpinnerVisible={setModalSpinnerVisible}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Circular;
