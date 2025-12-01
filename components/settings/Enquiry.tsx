import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";
import { GetQuery, PostQuery } from "@/services/queryServices";
import { useRouter } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

interface LoaderProps {
  setModalSpinnerVisible: (visible: boolean) => void;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageStatus: React.Dispatch<React.SetStateAction<string>>;
  setStatus: React.Dispatch<React.SetStateAction<"error" | "success">>;
}

const Enquiry: React.FC<LoaderProps> = ({
  setModalSpinnerVisible,
  setVisible,
  setMessageStatus,
  setStatus,
}) => {
  const { auth } = useAuth();
  const router = useRouter();
  const [queryData, setQueryData] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    query_id: "",
    user_id: auth.userId,
    user_name: auth.name,
    user_email: auth.email,
    user_class: auth.className,
    user_section: auth.sectionName,
    title: "",
    description: "",
    query_date: dayjs().format("YYYY-MM-DD"),
    query_status: "open",
    query_created_by: auth.email,
    query_modified_by: auth.email,
    query_schoolid: auth.roleId,
  });

  const generateQueryId = (length: number) => {
    const idNumber = length + 1;
    return `Q${String(idNumber).padStart(7, "0")}`;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchQueries = async () => {
    try {
      setModalSpinnerVisible(true);

      if (!auth.roleId) {
        setMessageStatus("School ID missing");
        setStatus("error");
        setVisible(true);
        return;
      }

      const response = await GetQuery(auth.roleId);
      const entries = response.data.queries || [];
      const filtered = entries.filter(
        (item: any) => item.user_id === auth.userId
      );
      setQueryData(filtered);
      setFormData((prev: any) => ({
        ...prev,
        query_id: generateQueryId(entries.length),
      }));
    } catch (err: any) {
      setMessageStatus(
        err?.response?.data?.message || "Failed to fetch enquiry entries"
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [auth.roleId]);

  const handleSubmit = async () => {
    const { title, description } = formData;

    if (!title.trim() || !description.trim()) {
      setMessageStatus("Please fill out all required fields");
      setStatus("error");
      setVisible(true);
      return;
    }

    setModalSpinnerVisible(true);
    try {
      const response = await PostQuery(formData);
      if (response?.data?.success) {
        setMessageStatus(response.data.message || "Enquiry submitted!");
        setStatus("success");
        setVisible(true);
        setFormData((prev: any) => ({
          ...prev,
          title: "",
          description: "",
        }));
      } else {
        throw new Error(response?.data?.message);
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data?.message || "Failed to submit enquiry."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-5">
        <Text className="mb-1 text-sm text-gray-700">Title</Text>
        <TextInput
          placeholder="Enter query title"
          className="w-full h-12 px-4 bg-white text-black rounded-md border border-gray-300"
          value={formData.title}
          onChangeText={(text) => handleInputChange("title", text)}
        />
      </View>

      <View className="mb-5">
        <Text className="mb-1 text-sm text-gray-700">Description</Text>
        <TextInput
          placeholder="Describe your issue"
          className="w-full px-4 py-2 h-[6rem] bg-white text-black rounded-lg border border-gray-300"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => handleInputChange("description", text)}
        />
      </View>

      <View className="flex-row justify-end items-center">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/home/enquiry/[id]",
              params: { id: JSON.stringify(queryData) },
            })
          }
          className="px-4 py-2 rounded-md mr-2"
        >
          <FontAwesome5 name="history" size={20} color={"#026902"} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-primary rounded-lg px-6 py-2"
        >
          <Text className="text-white font-semibold">Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Enquiry;
