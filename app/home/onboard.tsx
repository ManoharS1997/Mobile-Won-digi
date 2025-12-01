import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import Images from "@/constant/Images";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { UpdateIntro } from "@/services/authServices";

export default function OnboardingScreen() {
  const router = useRouter();
  const { auth } = useAuth();

  const handleClick = async () => {
    if (auth?.email) {
      await UpdateIntro(auth.email, { intro: false }).then(() =>
        router.replace("/(tabs)/home")
      );
    }
  };

  const SkipButton = (props: any) => (
    <TouchableOpacity style={styles.skipButton} {...props}>
      <Text style={styles.skipText}>Skip</Text>
    </TouchableOpacity>
  );

  const NextButton = (props: any) => (
    <TouchableOpacity style={styles.navButton} {...props}>
      <Ionicons name="arrow-forward" size={20} color="#fff" />
    </TouchableOpacity>
  );

  const DoneButton = (props: any) => (
    <TouchableOpacity style={styles.navButton} {...props}>
      <Ionicons name="checkmark" size={22} color="#fff" />
    </TouchableOpacity>
  );

  const Dots = ({ selected }: { selected: boolean }) => (
    <View
      style={{
        width: selected ? 20 : 8,
        height: 8,
        marginHorizontal: 3,
        borderRadius: 4,
        backgroundColor: selected ? "#026902" : "#d3d3d3",
      }}
    />
  );

  return (
    <Onboarding
      onSkip={handleClick}
      onDone={handleClick}
      containerStyles={styles.container}
      SkipButtonComponent={SkipButton}
      NextButtonComponent={NextButton}
      DoneButtonComponent={DoneButton}
      DotComponent={Dots}
      bottomBarHighlight={false}
      pages={[
        {
          backgroundColor: "#fff",
          image: <Image source={Images.onboard} style={styles.image} />,
          title: <Text style={styles.title}>Manage Academics</Text>,
          subtitle: (
            <Text style={styles.subtitle}>
              Assignments, Attendance, Circulars, Notes & Diaries – all at your
              fingertips.
            </Text>
          ),
        },
        {
          backgroundColor: "#fff",
          image: <Image source={Images.administration} style={styles.image} />,
          title: <Text style={styles.title}>Smart Administration</Text>,
          subtitle: (
            <Text style={styles.subtitle}>
              Handle Transport, Library, Inventory, Billing & Results
              effortlessly.
            </Text>
          ),
        },
        {
          backgroundColor: "#fff",
          image: <Image source={Images.onboardlast} style={styles.image} />,
          title: <Text style={styles.title}>Organized Scheduling</Text>,
          subtitle: (
            <Text style={styles.subtitle}>
              Timetables, Exams, Dashboard & Communication—streamlined for you.
            </Text>
          ),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    justifyContent: "center",
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: "contain",
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    fontFamily:
      Platform.OS === "ios" ? "HelveticaNeue-Medium" : "sans-serif-medium",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: "#4A4A4A",
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 25,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue" : "sans-serif",
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    marginLeft: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  skipText: {
    color: "#026902",
    fontWeight: "600",
    fontSize: 14,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#026902",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
