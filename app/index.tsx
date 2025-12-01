import Login from "@/components/Login";
import { checkTokenValidity } from "@/constant/checkTokenValidity";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

export default function Index() {
  const { setAuth } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);

  const authenticateUser = useCallback(async () => {
    try {
      const supported = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!supported || !enrolled) {
        router.replace("/(tabs)/dashboard");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to continue",
        fallbackLabel: "Use device PIN",
        requireConfirmation: true,
      });

      if (result.success) {
        await AsyncStorage.removeItem("alerts");
        router.replace("/(tabs)/home");
      } else {
        await AsyncStorage.multiRemove(["accessToken", "tokenExpiry"]);
        setAuth({
          token: null,
          name: null,
          role: null,
          userId: null,
          roleId: null,
          title: null,
          profile: null,
          email: null,
          className: null,
          sectionName: null,
          schoolName: null,
          schoolLogo: null,
          contact: null,
        });
        setNeedsLogin(true);
      }
    } catch (error) {
      Alert.alert(
        "Authentication Error",
        "Something went wrong. Please log in again."
      );
      setNeedsLogin(true);
    } finally {
      setLoading(false);
    }
  }, [router, setAuth]);

  const validateToken = useCallback(async () => {
    try {
      const isValid = await checkTokenValidity();
      if (isValid) {
        const values = await AsyncStorage.multiGet([
          "accessToken",
          "name",
          "role",
          "userId",
          "profile",
          "roleId",
          "title",
          "email",
          "className",
          "sectionName",
          "schoolName",
          "schoolLogo",
          "contact",
        ]);
        const authData = Object.fromEntries(values);
        setAuth((auth: any) => ({ ...auth, ...authData }));
        await authenticateUser();
      } else {
        setNeedsLogin(true);
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert("Token check error:", error);
      setNeedsLogin(true);
      setLoading(false);
    }
  }, [authenticateUser]);

  useEffect(() => {
    validateToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#026902" />
      </View>
    );
  }

  if (needsLogin) {
    return <Login />;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="gray" />
    </View>
  );
}
