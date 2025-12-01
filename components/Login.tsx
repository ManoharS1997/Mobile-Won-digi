import images from "@/constant/Images";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { LoginUser } from "@/services/authServices";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "./common/StatusModal";

const screenWidth = Dimensions.get("window").width;
const containerWidth =
  screenWidth >= 1024 ? "60%" : screenWidth >= 768 ? "70%" : "90%";

const LoginOne = () => {
  const { setAuth } = useAuth();
  const router = useRouter();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [isEmail, setIsEmail] = useState(false);
  let [isPassword, setIsPassword] = useState(false);
  let [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");

  useEffect(() => {
    if (isPassword || isEmail) {
      const timeoutId = setTimeout(() => {
        setIsPassword(false);
        setIsEmail(false);
      }, 4000);

      return () => clearTimeout(timeoutId);
    }
  }, [isPassword, isEmail]);

  const storeToken = async (token: any, expiresIn: any) => {
    const expiryTime = new Date().getTime() + expiresIn * 1000;
    try {
      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("tokenExpiry", expiryTime.toString());
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Error storing token.");
    }
  };

  const handleLogin = async () => {
    const intro = await AsyncStorage.getItem("introduction");
    if (!email.trim() || !password.trim()) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Both Username and Password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await LoginUser({ email, password });
      const data = response.data;
      if (data.success) {
        const {
          mobileToken = "",
          role = "",
          userId = "",
          roleId = "",
          title = "",
          name = "",
          profile,
          className,
          sectionName,
          schoolName,
          schoolLogo,
          contact,
        } = data;

        const safeProfile =
          profile || `https://eu.ui-avatars.com/api/?name=${name}&size=250`;

        const safeClassName = className ?? "";
        const safeSectionName = sectionName ?? "";
        const safeSchoolName = schoolName ?? "";
        const safeTitle = title ?? "";
        const safeSchoolLogo =
          schoolLogo ||
          `https://eu.ui-avatars.com/api/?name=${schoolName}&size=250`;

        setAuth((prev) => ({
          ...prev,
          token: mobileToken,
          role,
          userId,
          roleId,
          title: safeTitle,
          name,
          profile: safeProfile,
          email,
          className: safeClassName,
          sectionName: safeSectionName,
          schoolName: safeSchoolName,
          schoolLogo: safeSchoolLogo,
          contact,
        }));

        const storageItems = [
          ["role", role || ""],
          ["userId", userId || ""],
          ["roleId", roleId || ""],
          ["title", safeTitle],
          ["name", name || ""],
          ["email", email || ""],
          ["className", safeClassName],
          ["sectionName", safeSectionName],
          ["profile", safeProfile],
          ["schoolName", safeSchoolName],
          ["schoolLogo", safeSchoolLogo],
          ["contact", contact],
        ];

        await Promise.all([
          ...storageItems.map(([key, value]) =>
            AsyncStorage.setItem(key, value)
          ),
          storeToken(mobileToken, 24 * 60 * 60),
        ]);

        if (intro) {
          router.push("/home/onboard");
        } else {
          router.push("/(tabs)/home");
        }
      } else {
        data.message === "Invalid Password"
          ? setIsPassword(true)
          : setIsEmail(true);
      }
    } catch (error: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(
        error?.response?.data?.message || error?.message || "Login failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={images.background}
      style={{ flex: 1, paddingTop: 0 }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          "rgba(2, 105, 2, 0.4)",
          "rgba(2, 105, 2, 0.6)",
          "rgba(2, 105, 2, 0.8)",
        ]}
        style={{ flex: 1 }}
      >
        <StatusBar
          barStyle={
            Platform.OS === "android" ? "dark-content" : "light-content"
          }
          backgroundColor="transparent"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{ width: containerWidth }}
              className="bg-white rounded-2xl p-8 sm:p-4 shadow-lg elevation-5"
            >
              <View className="flex items-center space-y-3 gap-2">
                <Image
                  className="h-20 w-20 rounded-lg"
                  source={images.icon}
                  resizeMode="contain"
                />
                <Text className="text-3xl font-bold font-poppins text-gray-800">
                  Login
                </Text>
                <Text className="text-base font-poppins text-primary text-center">
                  Welcome to the portal
                </Text>
              </View>

              <View className="w-full my-8">
                <View className="mb-2.5">
                  <Text className="mb-1 font-poppins text-sm text-gray-700">
                    Email
                  </Text>
                  <TextInput
                    className="w-full h-12 px-4 font-poppins bg-gray-100 text-black rounded-md border border-gray-300"
                    onChangeText={(typedId) => setEmail(typedId.toLowerCase())}
                    value={email}
                    placeholder="Enter your email"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {isEmail && (
                    <Text className="text-red-600 font-poppins text-xs mt-1">
                      * Please enter a valid email
                    </Text>
                  )}
                </View>

                <View className="mb-2.5">
                  <Text className="mb-1 font-poppins text-sm text-gray-700">
                    Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full h-12 px-4 font-poppins bg-gray-100 text-black rounded-md border border-gray-300 pr-10"
                      secureTextEntry={!passwordVisible}
                      onChangeText={setPassword}
                      value={password}
                      placeholder="Enter your password"
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity
                      className="absolute right-3 top-3"
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                      <Ionicons
                        name={passwordVisible ? "eye" : "eye-off"}
                        size={20}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </View>
                  {isPassword && (
                    <Text className="text-red-600 font-poppins text-xs mt-1">
                      * Enter correct password
                    </Text>
                  )}
                </View>

                <View className="flex flex-row items-center justify-between mt-2">
                  <View></View>
                  <TouchableOpacity onPress={() => router.push("/auth/forgot")}>
                    <Text className="text-primary font-poppins text-sm">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                className="w-full bg-primary rounded-lg py-3 mt-4"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-poppins text-base text-center font-semibold">
                    Login
                  </Text>
                )}
              </TouchableOpacity>

              <StatusModal
                visible={visible}
                status={status}
                message={messageStatus}
                onClose={() => setVisible(false)}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default LoginOne;
