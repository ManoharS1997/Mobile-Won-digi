import {
  View,
  Text,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomDropdown from "@/components/common/CustomDropdown";
import {
  GetBusRoutesById,
  UpdateRouteForDriver,
} from "@/services/busroutesServices";

type OptionType = { label: string; value: string; time?: string };

const DriverRoute = ({
  setVisible,
  setStatus,
  setMessageStatus,
  isFocused,
  auth,
  routeName,
  setRouteName,
  busNumber,
  setBusNumber,
  pickupDrop,
  setPickupDrop,
  setDriveStart,
  driveStart,
}: any) => {
  const [dropdownFields, setDropdownFields] = useState<
    Record<string, OptionType[]>
  >({});

  const getBusRouteData = async () => {
    try {
      if (typeof auth.roleId !== "string") {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Invalid user or ID");
        return;
      }

      const response = await GetBusRoutesById(auth.roleId);
      const data = response.data.routes;

      if (!data || data.length === 0) {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Bus route not found");
        return;
      }

      const busRouteOptions = data.map((route: any) => ({
        label: `${route.route_id} - ${route.route_name}`,
        value: route.route_id,
      }));

      setDropdownFields({
        bus_route: busRouteOptions,
      });
    } catch (error: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  useEffect(() => {
    getBusRouteData();
  }, [isFocused]);

  const startDriving = async () => {
    if (!routeName || !busNumber || !pickupDrop) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Please fill all fields to start the route.");
      return;
    }
    setDriveStart(true);

    try {
      const routeId = routeName.split(" - ")[0];
      await UpdateRouteForDriver(auth.roleId, routeId, {
        bus_number: busNumber,
        bus_driver: auth.name,
        bus_contact: auth.contact,
        route_modified_by: auth.email,
      });

      setVisible(true);
      setStatus("success");
      setMessageStatus("Bus route started successfully!");
    } catch (error: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(
        error?.response?.data?.message || "Failed to start the route"
      );
    }
  };

  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
      <Text className="text-xl font-bold text-gray-800 mb-4 tracking-wide">
        🚌 Start Your Route
      </Text>

      <View>
        <View className="mb-3">
          <Text className="text-sm font-semibold text-primary mb-1">
            Bus Route
          </Text>
          <CustomDropdown
            label=""
            value={routeName}
            onChange={(val) => setRouteName(val)}
            options={dropdownFields["bus_route"]}
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-primary mb-1">
              Bus Number
            </Text>
            <TextInput
              value={busNumber}
              onChangeText={(text) => setBusNumber(text.toUpperCase())}
              placeholder="Bus No"
              className="bg-white border border-gray-300 rounded-md px-4 h-12 text-black"
              style={{
                lineHeight: Platform.OS === "ios" ? 0 : -1,
              }}
            />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-semibold text-primary mb-1">
              Pickup / Drop
            </Text>
            <CustomDropdown
              label=""
              value={pickupDrop}
              onChange={(val) => setPickupDrop(val)}
              options={[
                { label: "Pickup", value: "Pickup" },
                { label: "Drop", value: "Drop" },
              ]}
            />
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          {!driveStart ? (
            <TouchableOpacity
              style={{
                backgroundColor: "#22c55e",
                borderRadius: 30,
                paddingVertical: 14,
                alignItems: "center",
              }}
              onPress={async () => {
                await startDriving();
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                🚀 Start Trip
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: "#dc2626",
                borderRadius: 30,
                paddingVertical: 14,
                alignItems: "center",
              }}
              onPress={() => {
                setDriveStart(false);
                setVisible(true);
                setStatus("success");
                setMessageStatus("Trip ended successfully!");
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                🛑 End Trip
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default DriverRoute;
