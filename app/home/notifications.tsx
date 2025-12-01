import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { NotificationList } from "@/components/NotificationItem";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import {
  DeleteAlert,
  DeleteAllAlert,
  GetAlertById,
  UpdateAllAlert,
} from "@/services/alertServices";
import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";
import StatusModal from "@/components/common/StatusModal";

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  content: string;
  read: string;
}

export default function NotificationsScreen() {
  const { auth } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");

  const getShortRelativeTime = (date: string) => {
    const now = dayjs();
    const then = dayjs(date);
    const diffInSeconds = now.diff(then, "second");

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${now.diff(then, "minute")}m`;
    if (diffInSeconds < 86400) return `${now.diff(then, "hour")}h`;
    if (diffInSeconds < 604800) return `${now.diff(then, "day")}d`;
    return then.format("DD MMM");
  };

  const getAlerts = async () => {
    setLoading(true);
    try {
      const response = await GetAlertById(auth.roleId || "", auth.userId || "");
      const entries = response?.data?.alert || [];

      const structuredData: NotificationItem[] = entries.map((alert: any) => ({
        id: alert._id,
        title: `${alert?.alert_type?.toUpperCase() || "ALERT"}: ${alert.title}`,
        time: getShortRelativeTime(alert.date),
        content: alert.description || "No description available",
        read: alert.read || false,
      }));

      setNotifications(structuredData);

      setTimeout(() => checkAndMarkAsRead(structuredData), 2000);
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data.message || "Failed to load notifications."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const checkAndMarkAsRead = async (data: NotificationItem[]) => {
    const hasUnread = data.some((item) => item.read === "false");
    if (!hasUnread) return;

    try {
      await UpdateAllAlert(auth.roleId || "", auth.userId || "", {});
      getAlerts();
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data.message || "Failed to update read status."
      );
      setStatus("error");
      setVisible(true);
    }
  };

  useEffect(() => {
    getAlerts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await DeleteAlert(auth.roleId || "", id);
      if (res.data.success) {
        getAlerts();
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data.message || "Failed to delete the notification."
      );
      setStatus("error");
      setVisible(true);
    }
  };

  const confirmDeleteAll = async () => {
    try {
      const res = await DeleteAllAlert(auth.roleId || "", auth.userId || "");
      if (res.data.success) {
        getAlerts();
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data.message || "Failed to delete all notifications."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setShowDeleteAllModal(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Notifications
        </Text>
        <TouchableOpacity onPress={() => setShowDeleteAllModal(true)}>
          <MaterialIcons name="delete" size={28} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#026902" />
        </View>
      ) : (
        <NotificationList data={notifications} onDelete={handleDelete} />
      )}

      <Modal
        visible={showDeleteAllModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteAllModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-2xl w-80 px-6 py-8 shadow-2xl relative">
            <TouchableOpacity
              onPress={() => setShowDeleteAllModal(false)}
              className="absolute top-3 right-3"
            >
              <Entypo name="cross" size={24} color="#dc2626" />
            </TouchableOpacity>

            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete all notifications?
            </Text>

            <Text className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to delete all notifications? This action
              cannot be undone.
            </Text>

            <View className="w-full flex-row justify-center">
              <TouchableOpacity
                onPress={confirmDeleteAll}
                className="py-2 px-5 rounded-lg bg-green-600"
              >
                <Text className="text-center text-white font-semibold text-base">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
}
