import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "expo-router";
import images from "@/constant/Images";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import StatusModal from "@/components/common/StatusModal";
import {
  GetFavouriteById,
  PostFavourite,
  UpdateFavourite,
} from "@/services/favouriteServices";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type IconItem = {
  key: string;
  label: string;
  icon: any;
  url: string;
};

const iconData: IconItem[] = [
  {
    key: "assignment",
    label: "Assignment",
    icon: images.assignment,
    url: "/home/assignment",
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: images.attendance,
    url: "/home/attendance",
  },
  {
    key: "circular",
    label: "Circular",
    icon: images.bell,
    url: "/home/circular",
  },
  {
    key: "notes",
    label: "Class Notes",
    icon: images.pencil,
    url: "/home/notes",
  },
  { key: "diary", label: "Diary", icon: images.diary, url: "/home/diary" },
  { key: "exam", label: "Exam", icon: images.exam, url: "/home/exam" },
  {
    key: "healthcare",
    label: "Care",
    icon: images.healthcare,
    url: "/home/healthcare",
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: images.inventory,
    url: "/home/inventory",
  },
  {
    key: "library",
    label: "Library",
    icon: images.library,
    url: "/home/library",
  },
  {
    key: "results",
    label: "Results",
    icon: images.examResults,
    url: "/home/results",
  },
  {
    key: "students",
    label: "Students",
    icon: images.students,
    url: "/home/students",
  },
  {
    key: "transport",
    label: "Transport",
    icon: images.vehicles,
    url: "/home/transport",
  },
  {
    key: "billing",
    label: "Billing",
    icon: images.billing,
    url: "/home/billing",
  },
];

const Home = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { auth } = useAuth();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const splashOpacity = useRef(new Animated.Value(1)).current;
  const [splashVisible, setSplashVisible] = useState(true);
  const fetched = useRef(false);

  const showSchoolName = !!auth.schoolName;
  const showSchoolLogo =
    !!auth.schoolLogo && auth.schoolLogo.toLowerCase().startsWith("http");

  const fetchAndSetFavourites = async () => {
    try {
      const res = await GetFavouriteById(auth.roleId || "", auth.userId || "");
      const favs = res?.data?.favourite[0]?.favourites || [];
      if (Array.isArray(favs)) setBookmarked(favs);
      fetched.current = true;
    } catch (err: any) {
      setMessageStatus(
        err?.response?.data?.message || "Error loading favourites"
      );
      setStatus("error");
      setVisible(true);
    }
  };

  const updateFavourites = async (updatedBookmarks: string[]) => {
    if (!fetched.current) return;
    try {
      const res = await GetFavouriteById(auth.roleId || "", auth.userId || "");
      const hasExisting = res?.data?.favourite?.[0];
      const payload = {
        user_id: auth.userId || "",
        user_email: auth.email || "",
        favourites: updatedBookmarks,
        favourite_created_by: auth.email || "",
        favourite_modified_by: auth.email || "",
        schoolid: auth.roleId || "",
      };
      if (hasExisting) {
        await UpdateFavourite(auth.roleId || "", auth.userId || "", payload);
      } else {
        await PostFavourite(payload);
      }
      fetchAndSetFavourites();
    } catch (err: any) {
      setMessageStatus(
        err?.response?.data?.message || "Error saving favourites"
      );
      setStatus("error");
      setVisible(true);
    }
  };

  const handleBookmark = async (key: string) => {
    const isAlreadyBookmarked = bookmarked.includes(key);
    const isFirstBookmark = bookmarked.length === 0 && !isAlreadyBookmarked;
    let updatedBookmarks = [...bookmarked];

    if (isAlreadyBookmarked) {
      updatedBookmarks = bookmarked.filter((item) => item !== key);
    } else {
      if (bookmarked.length >= 3) {
        setMessageStatus(
          "You can only select 3 bookmarks. Deselect one to add a new."
        );
        setStatus("error");
        setVisible(true);
        return;
      }
      updatedBookmarks.push(key);
      if (isFirstBookmark) {
        setMessageStatus("Module bookmarked for dashboard!");
        setStatus("success");
        setVisible(true);
      }
    }

    setBookmarked(updatedBookmarks);
    await updateFavourites(updatedBookmarks);
  };

  useEffect(() => {
    fetchAndSetFavourites();
  }, [isFocused]);

  useEffect(() => {
    const checkSplashStatus = async () => {
      const splashShown = await AsyncStorage.getItem("splashShown");

      if (!splashShown && (showSchoolLogo || showSchoolName)) {
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
          delay: 1200,
        }).start(() => {
          setSplashVisible(false);
          AsyncStorage.setItem("splashShown", "true"); // Mark splash as shown
        });
      } else {
        setSplashVisible(false); // Don’t show splash again
      }
    };

    checkSplashStatus();
  }, []);

  const handlePress = (url: string) => {
    router.push(url as any);
  };

  const filteredData = iconData.filter((item) => {
    if (auth.role === "student") {
      return item.key !== "students" && item.key !== "inventory";
    }
    if (auth.role === "staff" && auth.title?.toLowerCase() === "driver") {
      return ![
        "assignment",
        "notes",
        "diary",
        "exam",
        "results",
        "students",
        "library",
      ].includes(item.key);
    }
    return true;
  });

  return (
    <View className="flex-1 bg-white">
      {splashVisible && (
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            opacity: splashOpacity,
            zIndex: 10,
          }}
        >
          {showSchoolLogo && (
            <Image
              source={{ uri: auth.schoolLogo || "" }}
              style={{ width: 120, height: 120, marginBottom: 20 }}
              resizeMode="contain"
            />
          )}
          {showSchoolName && (
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#1f2937",
                textAlign: "center",
              }}
            >
              {auth.schoolName}
            </Text>
          )}
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          paddingBottom: 100,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {filteredData.map((item) => {
            const isBookmarked = bookmarked.includes(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => handlePress(item.url)}
                style={{
                  width: "31%",
                  marginBottom: 15,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleBookmark(item.key)}
                  style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
                >
                  <Ionicons
                    name={isBookmarked ? "heart" : "heart-outline"}
                    size={20}
                    color={isBookmarked ? "#ef4444" : "#9ca3af"}
                  />
                </TouchableOpacity>

                <Image
                  source={item.icon}
                  style={{ width: 40, height: 40, marginBottom: 8 }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </View>
  );
};

export default Home;
