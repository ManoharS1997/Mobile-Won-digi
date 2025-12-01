import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { GetTransportById } from "@/services/transportServices";
import StatusModal from "@/components/common/StatusModal";
import { useRolePermissions } from "@/constant/GetRoleAction";
import EditTransportModal from "@/components/forms/transport/EditFormModal";
import BusRouteWithLatLng from "@/components/BusRouteWithLatLng";
import TrackBusScreen from "@/components/TrackBusScreen";
import { GetBusRoutesByRouteId } from "@/services/busroutesServices";
import { io } from "socket.io-client";
import { baseUrl } from "@/constant";

const TransportPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auth } = useAuth();
  const socketRef = useRef(io(baseUrl));
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busLocation, setBusLocation] = useState({ lat: 0, lng: 0 });
  const [allow, setAllow] = useState<any>("");
  const [activeTab, setActiveTab] = useState<"summary" | "track">("summary");
  const [stops, setStops] = useState<any[]>([]);
  const [selectedRouteType, setSelectedRouteType] = useState<"pickup" | "drop">(
    "pickup"
  );

  const { permissions, error } = useRolePermissions(
    auth.title || "",
    "Transportation"
  );

  const fetchRoute = async (routeId: string, type: "pickup" | "drop") => {
    if (!id || !auth.roleId) return;

    try {
      setLoading(true);
      const response = await GetBusRoutesByRouteId(routeId, auth.roleId);
      setStops(response.data?.route?.stops || []);
      setSelectedRouteType(type);
    } catch {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to fetch route details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransport = async () => {
    if (!id || !auth.roleId) return;

    try {
      setLoading(true);
      const response = await GetTransportById(auth.roleId, id);
      const entry = response.data.transport[0];
      setDetails(entry);
    } catch {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to fetch transport details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransport();
  }, [id, auth.roleId]);

  useEffect(() => {
    if (details) {
      const routeId = details.pickup_route?.split(" - ")[0];
      if (routeId) fetchRoute(routeId, "pickup");
    }
  }, [details]);

  useEffect(() => {
    if (auth.role === "staff" && permissions && auth.role && auth.roleId) {
      setAllow(permissions);
    } else {
      setVisible(true);
      setMessageStatus(error || "Something went wrong");
      setStatus("error");
    }
  }, [auth.role, auth.roleId, auth.title, permissions]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    const routeId =
      selectedRouteType === "pickup"
        ? details?.pickup_route?.split(" - ")[0]
        : details?.drop_route?.split(" - ")[0];

    const handleLocationUpdate = (data: any) => {
      const latest =
        selectedRouteType === "pickup"
          ? data.track?.pickup_location?.[0]
          : data.track?.drop_location?.[0];

      if (latest?.lat && latest?.lng) {
        if (latest.lat !== busLocation.lat || latest.lng !== busLocation.lng) {
          setBusLocation({ lat: latest.lat, lng: latest.lng });
        }
      } else if (stops.length > 0) {
        const first = stops[0];
        if (first.lat !== busLocation.lat || first.lng !== busLocation.lng) {
          setBusLocation({ lat: first.lat, lng: first.lng });
        }
      }
    };

    if (
      routeId &&
      details?.transport_status?.toLowerCase() === "active" &&
      auth.roleId
    ) {
      socket.emit("get-bus-track", {
        route_id: routeId,
        track_schoolid: auth.roleId,
      });
    }

    socket.on("get-bus-track-response", handleLocationUpdate);

    const interval = setInterval(() => {
      if (
        routeId &&
        details?.transport_status?.toLowerCase() === "active" &&
        auth.roleId
      ) {
        socket.emit("get-bus-track", {
          route_id: routeId,
          track_schoolid: auth.roleId,
        });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      socket.off("get-bus-track-response", handleLocationUpdate);
    };
  }, [selectedRouteType, auth.roleId, details?.transport_status, stops]);

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
        <TouchableOpacity onPress={() => router.push("/home/transport")}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Transport Details
        </Text>
        {auth.role === "staff" && allow === "Edit" && (
          <TouchableOpacity onPress={() => setShowForm(true)}>
            <FontAwesome name="edit" size={25} color="#026902" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="px-4 pt-5"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#026902" className="mt-10" />
        ) : details ? (
          <>
            <View className="border-b border-gray-200 pb-4">
              <Text className="text-xl font-bold text-gray-900">
                {details.user_name} ({details.student_class} -{" "}
                {details.student_section})
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                User Id: {details.user_id}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                Modified By: {details.transport_modified_by}
              </Text>
            </View>

            {/* Student transport info */}
            <View className="flex-row flex-wrap gap-x-4 justify-between mt-4">
              <View className="flex-1 min-w-[48%]">
                {renderRow("Start Date", details.start_date)}
                {renderRow("Pickup Time", details.transport_pickup_time)}
                {renderRow("Pickup Bus Driver", details.pick_bus_driver)}
                {renderRow("Pickup Bus Number", details.pick_bus_number)}
                {renderRow("Pickup Bus Contact", details.pickup_bus_contact)}
                {renderRow("Drop Bus Contact", details.drop_bus_contact)}
                {renderRow("Transport Duration", details.transport_duration)}
              </View>
              <View className="flex-1 min-w-[48%]">
                {renderRow("Bus Fee", details.transport_busfee)}
                {renderRow("End Date", details.end_date)}
                {renderRow("Drop Time", details.transport_drop_time)}
                {renderRow("Drop Bus Driver", details.drop_bus_driver)}
                {renderRow("Drop Bus Number", details.drop_bus_number)}
                {renderRow("Amount Paid", details.transport_paid)}
                {renderRow("Amount Due", details.transport_due)}
              </View>
            </View>

            {renderRow("Pickup Point", details.transport_pickup)}
            {renderRow("Pickup Route", details.pickup_route)}
            {renderRow("Drop Point", details.transport_drop)}
            {renderRow("Drop Route", details.drop_route)}

            {/* Bus Tracking Section */}
            {stops.length > 0 && (
              <>
                <View className="flex-row justify-between items-center mt-6 px-1">
                  <Text className="text-xl font-bold text-gray-900">
                    🚌 Bus Route Tracker
                  </Text>
                  <View className="flex-row bg-gray-200 rounded-full overflow-hidden">
                    <TouchableOpacity
                      onPress={() => {
                        const routeId = details.pickup_route.split(" - ")[0];
                        fetchRoute(routeId, "pickup");
                      }}
                      className={`w-20 py-1 ${
                        selectedRouteType === "pickup" ? "bg-green-600" : ""
                      }`}
                    >
                      <Text
                        className={`text-sm text-center font-semibold ${
                          selectedRouteType === "pickup"
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        Pickup
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const routeId = details.drop_route.split(" - ")[0];
                        fetchRoute(routeId, "drop");
                      }}
                      className={`w-20 py-1 ${
                        selectedRouteType === "drop" ? "bg-green-600" : ""
                      }`}
                    >
                      <Text
                        className={`text-sm text-center font-semibold ${
                          selectedRouteType === "drop"
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        Drop
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row justify-between bg-gray-100 p-1 rounded-full my-6">
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${
                      activeTab === "summary" ? "bg-white" : ""
                    }`}
                    onPress={() => setActiveTab("summary")}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        activeTab === "summary"
                          ? "text-primary"
                          : "text-gray-500"
                      }`}
                    >
                      Normal View
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${
                      activeTab === "track" ? "bg-white" : ""
                    }`}
                    onPress={() => setActiveTab("track")}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        activeTab === "track" ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      Track on Map
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeTab === "summary" ? (
                  <BusRouteWithLatLng
                    setVisible={setVisible}
                    setStatus={setStatus}
                    setMessageStatus={setMessageStatus}
                    stops={stops}
                    busLocation={busLocation}
                  />
                ) : (
                  <TrackBusScreen
                    key={`${selectedRouteType}-${activeTab}`} // Force remount
                    activeTab={activeTab}
                    stops={stops}
                    busLocation={busLocation}
                    setVisible={setVisible}
                    setStatus={setStatus}
                    setMessageStatus={setMessageStatus}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            No details found for ID: {id}
          </Text>
        )}
      </ScrollView>

      <EditTransportModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        details={details}
        onSubmit={fetchTransport}
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

export default TransportPage;
