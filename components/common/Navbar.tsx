import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import images from "@/constant/Images";
import { GetAlertById } from "@/services/alertServices";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const containerWidth =
  screenWidth >= 1024 ? "40%" : screenWidth >= 768 ? "55%" : "100%";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const isFocused = useIsFocused();
  const router = useRouter();
  const [greeting, setGreeting] = useState("Hello");
  const [modalVisible, setModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getAlerts = async () => {
    const response = await GetAlertById(auth.roleId || "", auth.userId || "");
    const entries = response?.data?.alert || [];

    const unread = entries.filter((entry: any) => entry.read === "false");
    setUnreadCount(unread.length);

    if (unread.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 New Notifications",
          body: `You have ${unread.length} unread notification${
            unread.length > 1 ? "s" : ""
          }.`,
          sound: true,
        },
        trigger: null,
      });
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12
        ? "Good Morning ☀️"
        : hour < 17
        ? "Good Afternoon 🌤️"
        : "Good Evening 🌙"
    );

    getAlerts();
  }, [isFocused]);

  const handleLogoutConfirm = async () => {
    setModalVisible(false);
    logout();
    await AsyncStorage.removeItem("splashShown");
    router.replace("/");
  };

  return (
    <>
      <View className="flex-row justify-between items-center p-5 bg-white shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <Image
            source={{
              uri:
                auth.profile ||
                `https://eu.ui-avatars.com/api/?name=${auth.name}&size=250&background=026902&color=fff`,
            }}
            style={{ width: 48, height: 48, borderRadius: 999 }}
          />
          <View>
            <Text className="text-base text-gray-500">{greeting}</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {auth.name?.split(" ").slice(0, 2).join(" ") || "User"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => router.push("/home/notifications")}
            className="relative p-2 rounded-full bg-gray-100 active:bg-gray-200"
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color="#111" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1.5 min-w-[16px] h-[16px] items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
            activeOpacity={0.7}
          >
            <AntDesign name="logout" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40 px-10">
          <View
            style={{ width: containerWidth }}
            className="bg-white rounded-2xl p-6"
          >
            <Image
              source={images.logout}
              style={{ width: 70, height: 70 }}
              resizeMode="contain"
              className="item-center mx-auto mb-4"
            />
            <Text className="text-lg font-semibold text-gray-800 mb-3 text-center">
              Are you sure you want to logout?
            </Text>
            <View className="flex-row justify-around mt-4">
              <Pressable
                onPress={() => setModalVisible(false)}
                className="bg-gray-200 px-6 py-2 rounded-xl"
              >
                <Text className="text-gray-800 font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleLogoutConfirm}
                className="bg-red-500 px-6 py-2 rounded-xl"
              >
                <Text className="text-white font-medium">Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Navbar;
