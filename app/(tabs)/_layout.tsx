import { Tabs } from "expo-router";
import { Platform, SafeAreaView, StatusBar, Text, View } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Navbar from "@/components/common/Navbar"; // adjust path if needed

const TabsLayout = () => {
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Navbar />
      </SafeAreaView>
      <Tabs
        screenOptions={{
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: "#026902",
            position: "absolute",
            borderTopColor: "#0061FF1A",
            borderTopWidth: 1,
            minHeight: 60,
          },
        }}
      >
        <Tabs.Screen
          key={"dashboard"}
          name="dashboard"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="dashboard"
                size={24}
                color={focused ? "#d9fea3" : "white"}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{ color: focused ? "#d9fea3" : "white", fontSize: 12 }}
              >
                Dashboard
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          key={"home"}
          name="home"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <SimpleLineIcons
                name="menu"
                size={24}
                color={focused ? "#d9fea3" : "white"}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{ color: focused ? "#d9fea3" : "white", fontSize: 12 }}
              >
                Menu
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          key={"calender"}
          name="calender"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name="calendar"
                size={24}
                color={focused ? "#d9fea3" : "white"}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{ color: focused ? "#d9fea3" : "white", fontSize: 12 }}
              >
                Calender
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          key={"settings"}
          name="settings"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="settings-sharp"
                size={24}
                color={focused ? "#d9fea3" : "white"}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{ color: focused ? "#d9fea3" : "white", fontSize: 12 }}
              >
                Settings
              </Text>
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;
