import React, { useEffect, useState } from "react";
import { View, LayoutAnimation, Platform, UIManager } from "react-native";
import { List } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Faqs from "@/components/settings/Faqs";
import MyProfile from "@/components/settings/MyProfile";
import Timetable from "@/components/settings/timetable";
import Loader from "@/components/common/Loader";
import StatusModal from "@/components/common/StatusModal";
import Enquiry from "@/components/settings/Enquiry";

const Profile = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const handleAccordionPress = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === id ? null : id);
  };

  const renderRightIcon = (id: number) => () =>
    (
      <Ionicons
        name={expanded === id ? "chevron-up" : "chevron-down"}
        size={18}
        color="#fff"
      />
    );

  return (
    <View className=" p-5 flex-1 bg-white">
      <List.Section style={{ gap: 10 }}>
        <List.Accordion
          title="My Profile"
          titleStyle={{
            color: "white",
            fontWeight: "500",
          }}
          style={{
            backgroundColor: "#026902",
            borderWidth: 1,
            borderColor: "#026902",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderBottomLeftRadius: expanded === 1 ? 0 : 30,
            borderBottomRightRadius: expanded === 1 ? 0 : 30,
          }}
          theme={{ colors: { background: "#ffffff" } }}
          expanded={expanded === 1}
          right={renderRightIcon(1)}
          onPress={() => handleAccordionPress(1)}
        >
          <View className="p-4 rounded-b-md bg-[#f8f9fa]">
            <MyProfile
              setModalSpinnerVisible={setModalSpinnerVisible}
              setVisible={setVisible}
              setStatus={setStatus}
              setMessageStatus={setMessageStatus}
            />
          </View>
        </List.Accordion>

        <List.Accordion
          title="Enquiry"
          titleStyle={{
            color: "white",
            fontWeight: "500",
          }}
          style={{
            backgroundColor: "#026902",
            borderWidth: 1,
            borderColor: "#026902",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderBottomLeftRadius: expanded === 4 ? 0 : 30,
            borderBottomRightRadius: expanded === 4 ? 0 : 30,
          }}
          right={renderRightIcon(4)}
          theme={{ colors: { background: "#ffffff" } }}
          expanded={expanded === 4}
          onPress={() => handleAccordionPress(4)}
        >
          <View className="p-4 rounded-b-md mb-5 bg-[#f8f9fa]">
            <Enquiry
              setModalSpinnerVisible={setModalSpinnerVisible}
              setVisible={setVisible}
              setStatus={setStatus}
              setMessageStatus={setMessageStatus}
            />
          </View>
        </List.Accordion>

        <List.Accordion
          title="Timetable"
          titleStyle={{
            color: "white",
            fontWeight: "500",
          }}
          style={{
            backgroundColor: "#026902",
            borderWidth: 1,
            borderColor: "#026902",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderBottomLeftRadius: expanded === 5 ? 0 : 30,
            borderBottomRightRadius: expanded === 5 ? 0 : 30,
          }}
          right={renderRightIcon(4)}
          theme={{ colors: { background: "#ffffff" } }}
          expanded={expanded === 5}
          onPress={() => handleAccordionPress(5)}
        >
          <View className="p-4 rounded-b-md mb-5 bg-[#f8f9fa]">
            <Timetable
              setModalSpinnerVisible={setModalSpinnerVisible}
              setVisible={setVisible}
              setStatus={setStatus}
              setMessageStatus={setMessageStatus}
            />
          </View>
        </List.Accordion>

        <List.Accordion
          title="FAQs"
          titleStyle={{
            color: "white",
            fontWeight: "500",
          }}
          style={{
            backgroundColor: "#026902",
            borderWidth: 1,
            borderColor: "#026902",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderBottomLeftRadius: expanded === 3 ? 0 : 30,
            borderBottomRightRadius: expanded === 3 ? 0 : 30,
          }}
          theme={{ colors: { background: "#ffffff" } }}
          right={renderRightIcon(3)}
          expanded={expanded === 3}
          onPress={() => handleAccordionPress(3)}
        >
          <View className="p-4 rounded-b-md mb-5 bg-[#f8f9fa]">
            <Faqs />
          </View>
        </List.Accordion>
      </List.Section>
      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
      <View className="flex-1">
        <Loader
          isModalSpinnerVisible={isModalSpinnerVisible}
          setModalSpinnerVisible={setModalSpinnerVisible}
        />
      </View>
    </View>
  );
};

export default Profile;
