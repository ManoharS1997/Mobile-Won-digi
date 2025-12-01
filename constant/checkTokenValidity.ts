import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkTokenValidity = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    const expiry = await AsyncStorage.getItem("tokenExpiry");
    if (!token || !expiry) {
      return false;
    }
    const currentTime = new Date().getTime();
    if (currentTime > parseInt(expiry)) {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("tokenExpiry");
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
