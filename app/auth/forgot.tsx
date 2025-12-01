import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
  Modal,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import images from "@/constant/Images";
import { LinearGradient } from "expo-linear-gradient";
import OtpPage from "@/components/OtpPage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ForgotSendOtp, ResetPassword } from "@/services/authServices";
import StatusModal from "@/components/common/StatusModal";

const screenWidth = Dimensions.get("window").width;
const containerWidth =
  screenWidth >= 1024 ? "60%" : screenWidth >= 768 ? "70%" : "90%";

const forgot = () => {
  const router = useRouter();
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const [isExecutiveId, setIsExecutiveId] = useState(false);
  const [isPassword, setIsPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [isOtpVerified, setOtpVerified] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");

  const [formData, setFormData] = useState({
    usermail: "",
    password: "",
    confirm_password: "",
  });

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleReset = async () => {
    if (isOtpVerified) {
      setModalSpinnerVisible(true);
      const response = await ResetPassword(formData.usermail, {
        email: formData.usermail,
        password: formData.password,
      });
      const responseData = response.data;
      if (responseData.success) {
        setVisible(true);
        setStatus("success");
        setMessageStatus(
          responseData.message || "Password changed successfully"
        );
        setModalSpinnerVisible(false);
      } else {
        setModalSpinnerVisible(false);
        setVisible(true);
        setStatus("error");
        setMessageStatus(responseData.message || "Registration failed");
      }
    } else {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Please verify your Email 😕");
    }
  };

  useEffect(() => {
    if (isPassword || isExecutiveId) {
      const timeoutId = setTimeout(() => {
        setIsPassword(false);
        setIsExecutiveId(false);
      }, 4000);

      return () => clearTimeout(timeoutId);
    }
  }, [isPassword, isExecutiveId]);

  const handleInputChange = (name: any, text: any) => {
    setFormData({
      ...formData,
      [name]: text,
    });
  };

  const handleOtp = async () => {
    setModalSpinnerVisible(true);
    try {
      if (formData.usermail.length > 5) {
        const response = await ForgotSendOtp({
          email: formData.usermail,
        });
        const data = response.data;
        if (data.success) {
          openModal();
        }
      } else if (formData.usermail.length === 0) {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Please Enter Email");
      } else {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Email length should be above 5 characters");
      }
    } catch (err: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(err.response.data.message);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  return (
    <ImageBackground
      source={images.background}
      style={{ flex: 1 }}
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
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="absolute z-50 top-[5%] left-[5%]"
        >
          <Icon name="keyboard-backspace" size={40} color="white" />
        </TouchableOpacity>
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
              className="bg-white rounded-2xl p-8 custom-380:p-4 shadow-lg elevation-5"
            >
              <View className="flex items-center space-y-3 gap-2">
                <Image
                  className="h-20 w-20 rounded-lg"
                  source={images.icon}
                  resizeMode="contain"
                />
                <Text className="text-3xl font-bold font-poppins text-gray-800">
                  Reset Password
                </Text>
              </View>

              <View className="w-full my-8">
                <View className="mb-2.5">
                  <Text className="mb-1 font-poppins text-sm text-gray-700">
                    Email
                  </Text>
                  <View className="w-full relative">
                    <TextInput
                      className="w-full h-12 px-4 font-poppins bg-gray-100 text-black rounded-md border border-gray-300"
                      onChangeText={(text) =>
                        handleInputChange("usermail", text.toLowerCase())
                      }
                      value={formData.usermail}
                      placeholder="Enter your email"
                      placeholderTextColor="#888"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      disabled={isOtpVerified}
                      onPress={handleOtp}
                      className={`absolute right-2.5 top-[50%] -translate-y-1/2 ${
                        isOtpVerified ? "bg-green-500" : "bg-red-500"
                      } px-4 py-1 rounded-md`}
                    >
                      <Text className="text-white font-semibold">
                        {isOtpVerified ? "Verified" : "Verify"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="mb-2.5">
                  <Text className="mb-1 font-poppins text-sm text-gray-700">
                    Password
                  </Text>
                  <View className="flex-row items-center relative">
                    <TextInput
                      className="w-full h-12 px-4 font-poppins bg-gray-100 text-black rounded-md border border-gray-300 pr-10"
                      secureTextEntry={!passwordVisible}
                      onChangeText={(text) =>
                        handleInputChange("password", text)
                      }
                      value={formData.password}
                      placeholder="Enter your password"
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity
                      className="absolute right-5"
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
                    <Text className="text-red-600 font-poppins text-sm mt-1">
                      <Text>* </Text>Enter password
                    </Text>
                  )}
                </View>
                <View className="mb-2.5">
                  <Text className="mb-1 font-poppins text-sm text-gray-700">
                    Confirm Password
                  </Text>
                  <View className="flex-row items-center relative">
                    <TextInput
                      className="w-full h-12 px-4 font-poppins bg-gray-100 text-black rounded-md border border-gray-300 pr-10"
                      secureTextEntry={!passwordConfirmVisible}
                      value={formData.confirm_password}
                      onChangeText={(text) =>
                        handleInputChange("confirm_password", text)
                      }
                      placeholder="Enter your password"
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity
                      className="absolute right-5"
                      onPress={() =>
                        setPasswordConfirmVisible(!passwordConfirmVisible)
                      }
                    >
                      <Ionicons
                        name={passwordConfirmVisible ? "eye" : "eye-off"}
                        size={20}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </View>
                  {formData.confirm_password != formData.password &&
                    !(formData.confirm_password.length < 5) &&
                    formData.confirm_password.length != 0 && (
                      <Text className="text-red-600 font-poppins text-sm mt-1">
                        <Text>* </Text>Password mismtach
                      </Text>
                    )}
                </View>
              </View>

              <TouchableOpacity
                disabled={
                  formData.confirm_password.length === 0 ||
                  formData.confirm_password != formData.password
                }
                onPress={handleReset}
                className="w-full bg-primary rounded-lg py-3 mt-4"
              >
                <Text className="text-white font-poppins text-base text-center font-semibold">
                  Reset
                </Text>
              </TouchableOpacity>

              <StatusModal
                visible={visible}
                status={status}
                message={messageStatus}
                onClose={() => {
                  setVisible(false);
                  if (status === "success") {
                    setTimeout(() => {
                      router.push("/");
                    }, 300);
                  }
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {isModalVisible && (
          <Modal
            transparent
            visible={isModalVisible}
            onRequestClose={closeModal}
          >
            <View className="flex-1 bg-black/50 justify-center">
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View className="flex-1 justify-center items-center">
                    <Animated.View
                      style={{
                        transform: [
                          {
                            translateY: modalSlideAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1000, 0],
                            }),
                          },
                        ],
                      }}
                      className="bg-white w-[90%] max-h-[85%] p-6 rounded-2xl shadow-lg"
                    >
                      <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                      >
                        <OtpPage
                          email={formData.usermail}
                          closeModal={closeModal}
                          setOtpVerified={setOtpVerified}
                          handleOtp={handleOtp}
                        />
                      </ScrollView>
                    </Animated.View>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </View>
          </Modal>
        )}

        {isModalSpinnerVisible && (
          <Modal
            transparent
            visible={isModalSpinnerVisible}
            onRequestClose={() => setModalSpinnerVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <Text>
                <ActivityIndicator size="large" color="#026902" />
              </Text>
            </View>
          </Modal>
        )}
      </LinearGradient>
    </ImageBackground>
  );
};

export default forgot;
