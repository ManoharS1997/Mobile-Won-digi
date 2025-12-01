import { View, Text, Switch } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Notifcations=() => {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <>
      <View className="flex-row justify-between items-center p-2 mb-2 rounded-md bg-white">
        <Text>Enable Notifications</Text>
        <Switch
          trackColor={{ false: "#D3D3D3", true: "#1D61E7" }}
          value={notificationsEnabled}
        />
      </View>
      <View className="flex-row justify-between items-center p-2 mb-2 rounded-md bg-white">
        <Text>Enable Alerts</Text>
        <Switch
          trackColor={{ false: "#D3D3D3", true: "#1D61E7" }}
          value={alertsEnabled}
        />
      </View>
    </>
  );
};

export default Notifcations;

