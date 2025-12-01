import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import images from "@/constant/Images";
import { VerifyOtp } from "@/services/authServices";
import StatusModal from "./common/StatusModal";

const OtpPage = ({ closeModal, email, setOtpVerified, handleOtp }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const [isOtpLoading, setOtpLoading] = useState(false);
  const [isOtpError, setOtpError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const timerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("");
  const [messageStatus, setMessageStatus] = useState("");

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendEnabled(true);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleResend = () => {
    if (isResendEnabled) {
      handleOtp();
      setTimeLeft(90);
      setIsResendEnabled(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleClose = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError(false);
    closeModal();
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await VerifyOtp({ email, otp: otp.join("") });
      if (res.data.success) {
        setOtpVerified(true);
        setOtp(["", "", "", "", "", ""]);
        closeModal();
      } else {
        setOtpError(true);
        setMessageStatus(res.data.message || "Invalid OTP");
        setStatus("error");
        setVisible(true);
      }
    } catch (err) {
      setOtpError(true);
      setMessageStatus(
        err?.response?.data?.message || "OTP verification failed"
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <View className="w-full px-4 py-4 items-center">
      {/* Close Icon */}
      <TouchableOpacity onPress={handleClose} className="absolute top-3 right-3">
        <MaterialIcons name="close" size={24} color="black" />
      </TouchableOpacity>

      {/* OTP Illustration */}
      <Image
        source={images.otpSuccess}
        className="w-20 h-20 mb-4"
        resizeMode="contain"
      />

      {/* Title */}
      <Text className="text-xl font-semibold text-center mb-1">
        Verify your OTP
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-4">
        We have sent the OTP to your email
      </Text>

      {/* OTP Input Fields */}
      <View className="flex-row justify-center gap-2 mb-5">
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, i)}
            onKeyPress={(event) => handleKeyPress(event, i)}
            keyboardType="numeric"
            maxLength={1}
            className={`border rounded-lg text-center text-lg font-medium w-10 h-12 ${
              isOtpError ? "border-red-500" : "border-gray-300"
            }`}
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        onPress={handleVerifyOtp}
        className="w-3/4 h-10 bg-primary rounded-lg items-center justify-center mb-4"
      >
        <Text className="text-white font-semibold">
          {isOtpLoading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>

      {/* Resend Info */}
      <View className="items-center">
        <Text className="text-sm font-medium mb-1">Didn't receive code?</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={handleResend} disabled={!isResendEnabled}>
            <Text
              className={`text-primary ${
                isResendEnabled ? "opacity-100" : "opacity-50"
              }`}
            >
              Resend
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-500">{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Status Modal */}
      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </View>
  );
};

export default OtpPage;
