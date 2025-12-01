import React, { useEffect, useRef, useState } from "react";
import { Text, View, ScrollView, Platform, TextInput } from "react-native";
import AttendanceCard from "@/components/dashboard/AttendanceCard";
import StaffAttendance from "@/components/dashboard/StaffAttendance";
import ExamDashboard from "@/components/dashboard/ExamBoard";
import { studentQuotes } from "@/constant/quotes";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/common/StatusModal";
import CircularCard from "@/components/dashboard/CircularCard";
import ActionButton from "@/components/dashboard/ActionButton";
import QuickAttendanceCard from "@/components/dashboard/QuickAttendance";
import { GetFavouriteById } from "@/services/favouriteServices";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import DriverRoute from "@/components/dashboard/DriverRoute";
import { io } from "socket.io-client";
import { baseUrl } from "@/constant";
import * as Location from "expo-location";
import { LocationSubscription } from "expo-location";

const getQuoteOfTheDay = () => {
  const index = new Date().getDate() % studentQuotes.length;
  return studentQuotes[index];
};

const Dashboard = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [quote, setQuote] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [routeName, setRouteName] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [pickupDrop, setPickupDrop] = useState("");
  const [driveStart, setDriveStart] = useState(false);

  const socketRef = useRef(io(baseUrl));
  const locationSubscriptionRef = useRef<LocationSubscription | null>(null);
  const isDriver =
    auth.role === "staff" && auth.title?.toLowerCase() === "driver";

  useEffect(() => {
    const startTrackingBus = async () => {
      if (!isDriver || !driveStart) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Location permission denied");
        return;
      }

      const socket = socketRef.current;

      if (!socket.connected) {
        socket.connect();
      }

      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }

      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 10,
        },
        (location) => {
          const { latitude, longitude } = location.coords;

          socket.emit("check", {
            route_id: routeName?.split(" - ")[0] || "",
            staff_id: auth.userId || "",
            route_name: routeName?.split(" - ")[1] || "",
            bus_number: busNumber || "",
            bus_driver: auth.name || "",
            track_type: pickupDrop?.toLowerCase(),
            pickup_location: [{ lat: latitude, lng: longitude }],
            drop_location: [{ lat: latitude, lng: longitude }],
            bus_contact: auth.contact || "",
            track_schoolid: auth.roleId || "",
            track_created_by: auth.email || "",
            track_modified_by: auth.email || "",
          });
        }
      );
    };

    if (driveStart) {
      startTrackingBus();
    }

    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }

      const socket = socketRef.current;
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [driveStart, isDriver, routeName, busNumber, pickupDrop]);

  const fetchAndSetFavourites = async () => {
    try {
      const res = await GetFavouriteById(auth.roleId || "", auth.userId || "");
      const favs = res?.data?.favourite[0]?.favourites || [];
      if (Array.isArray(favs) && favs.length > 0) {
        setBookmarked(favs);
      }
    } catch (err: any) {
      setMessageStatus(
        err?.response?.data?.message || "Error saving favourites"
      );
      setStatus("error");
      setVisible(true);
    }
  };

  useEffect(() => {
    setQuote(getQuoteOfTheDay());
    fetchAndSetFavourites();
  }, [isFocused]);

  return (
    <View className="flex-1 bg-white">
      {auth.role === "student" ? (
        <>
          <View className="bg-blue-50 border border-blue-100 rounded-2xl mx-4 mt-4 px-5 py-4 shadow-sm">
            <Text className="text-center font-bold text-base text-blue-900 mb-1">
              ✨ Quote of the Day
            </Text>
            <Text className="text-center text-blue-700 italic text-sm leading-relaxed">
              “{quote}”
            </Text>
          </View>

          <ScrollView
            className="px-4 pt-6"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-6">
              <AttendanceCard
                setVisible={setVisible}
                setStatus={setStatus}
                setMessageStatus={setMessageStatus}
              />
            </View>
            <ExamDashboard
              setVisible={setVisible}
              setStatus={setStatus}
              setMessageStatus={setMessageStatus}
            />
            {bookmarked.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  ⚡ Quick Actions
                </Text>
                <View className="flex-row flex-wrap justify-between gap-3">
                  {bookmarked.map((item, index) => (
                    <ActionButton
                      key={index}
                      label={
                        item === "healthcare"
                          ? `Care`
                          : `${item?.charAt(0).toUpperCase() + item?.slice(1)}`
                      }
                      onPress={() =>
                        router.push({
                          pathname: "/home/[id]" as any,
                          params: { id: item },
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </>
      ) : (
        <ScrollView
          className="pt-4"
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="space-y-6">
            {!isDriver && (
              <>
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  📊 Attendance Summary
                </Text>

                <StaffAttendance
                  setVisible={setVisible}
                  setStatus={setStatus}
                  setMessageStatus={setMessageStatus}
                />
              </>
            )}
            {isDriver && (
              <DriverRoute
                setVisible={setVisible}
                setStatus={setStatus}
                setMessageStatus={setMessageStatus}
                isFocused={isFocused}
                auth={auth}
                routeName={routeName}
                setRouteName={setRouteName}
                busNumber={busNumber}
                setBusNumber={setBusNumber}
                pickupDrop={pickupDrop}
                setPickupDrop={setPickupDrop}
                setDriveStart={setDriveStart}
                driveStart={driveStart}
              />
            )}

            <QuickAttendanceCard
              setVisible={setVisible}
              setStatus={setStatus}
              setMessageStatus={setMessageStatus}
            />

            <View className="my-3">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                📣 Recent Circulars
              </Text>
              <View className="max-h-52">
                <CircularCard />
              </View>
            </View>

            {bookmarked.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  ⚡ Bookmarks
                </Text>
                <View className="flex-row w-full items-center justify-between gap-3">
                  {bookmarked.map((item, index) => (
                    <ActionButton
                      key={index}
                      label={
                        item === "healthcare"
                          ? `Care`
                          : `${item?.charAt(0).toUpperCase() + item?.slice(1)}`
                      }
                      onPress={() =>
                        router.push({
                          pathname: "/home/[id]" as any,
                          params: { id: item },
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </View>
  );
};

export default Dashboard;
