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
import { GetResult } from "@/services/resultServices";
import ResultFormModal from "@/components/forms/result/ResultFormModal";
import CustomDropdown from "@/components/common/CustomDropdown";
import { X } from "lucide-react-native";

const Results = () => {
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
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Results"
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

  const fetchAssignEntries = async () => {
    try {
      setModalSpinnerVisible(true);

      if (!auth.roleId) {
        setMessageStatus("School ID missing");
        setStatus("error");
        setVisible(true);
        return;
      }

      const response = await GetResult(auth.roleId);
      let entries = response.data.results;
      setDataLen(entries?.length || 0);
      if (
        auth.role === "staff" &&
        auth.title !== "Principal" &&
        auth.title !== "Head of Department"
      ) {
        entries = entries.filter((entry: any) => {
          return (
            entry.student_section === auth.sectionName &&
            entry.student_class === auth.className
          );
        });
      }

      if (auth.role === "student") {
        entries = entries.filter((entry: any) => {
          let entryClass = entry.student_class;

          if (entryClass.startsWith("Class")) {
            entryClass = entryClass.split(" ")[1];
          }

          return (
            entryClass === auth.className &&
            entry.student_section === auth.sectionName
          );
        });
      }
      const structuredData = entries.map((entry: any) => ({
        Title: entry.student_name,
        Class: entry.student_class,
        Section: entry.student_section,
        "Roll No": entry.student_roll,
        ModifiedBy: entry.result_modified_by,
        student_id: entry.student_id,
        Grade: entry.grade,
        student: {
          id: entry.exam_id,
          student_id: entry.student_id,
          student_name: entry.student_name,
          student_class: entry.student_class,
          student_section: entry.student_section,
        },
      }));

      setData(structuredData);
    } catch (err: any) {
      setMessageStatus(err.message || "Failed to fetch results entries");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    fetchAssignEntries();
  }, [auth.roleId]);

  const filteredData = Array.from(
    new Map(
      data
        .filter((item) => {
          const matchesSearch = Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

          const matchesFilter =
            (!selectedClass || item.Class === selectedClass) &&
            (!selectedSection || item.Section === selectedSection);

          return matchesSearch && matchesFilter;
        })
        .map((item) => [item.student_id, item])
    ).values()
  );

  const handleViewDetails = (item: any) => {
    router.push({
      pathname: "/home/results/[id]",
      params: { id: JSON.stringify(item.student) },
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
            <Text className="text-xl font-semibold">RESULTS</Text>
            <Image
              source={images.examResults}
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
          <View className="flex-row items-center gap-4">
            {auth.title === "Principal" ? (
              <TouchableOpacity
                onPress={() => setFilterVisible(!filterVisible)}
              >
                <Ionicons name="filter-outline" size={24} color="#026902" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSort}>
                <Ionicons
                  name={sortAsc ? "arrow-down-outline" : "arrow-up-outline"}
                  size={24}
                  color="#026902"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {filterVisible && auth.title === "Principal" && (
        <View className="px-4 pb-2">
          <Text className="my-2 text-gray-500">Filter by:</Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <CustomDropdown
                label=""
                value={selectedClass}
                onChange={setSelectedClass}
                placeholder="Select Class"
                options={[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12",
                ].map((cls) => ({
                  label: cls,
                  value: cls,
                }))}
              />
            </View>

            {/* Section Dropdown */}
            <View className="flex-1">
              <CustomDropdown
                label=""
                value={selectedSection}
                onChange={setSelectedSection}
                placeholder="Select Section"
                options={["A", "B", "C", "D", "E"].map((sec) => ({
                  label: sec,
                  value: sec,
                }))}
              />
            </View>

            {/* X Button */}
            <TouchableOpacity
              className="p-2 justify-center items-center"
              onPress={() => {
                setSelectedClass("");
                setSelectedSection("");
                setFilterVisible(false);
              }}
            >
              <X size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
      {auth.role === "staff" && allow === "Edit" && (
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          className="absolute bottom-6 right-6 bg-green-600 p-4 rounded-full shadow-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
      <ResultFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        dataLen={dataLen}
        onSubmit={() => {
          fetchAssignEntries();
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

export default Results;
