// InvFormModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomDropdown from "@/components/common/CustomDropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "../../common/StatusModal";
import { PostInventory } from "@/services/inventoryServices";
import { Feather } from "@expo/vector-icons";

interface InvFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string };

const InvFormModal: React.FC<InvFormModalProps> = ({
  visible,
  dataLen,
  onClose,
  onSubmit,
}) => {
  const { auth } = useAuth();
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const generateItemId = (length: number) => {
    const idNumber = length + 1;
    return `IV${String(idNumber).padStart(6, "0")}`;
  };

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const totalPrice = form.item_unitprice * form.item_quantity;

    setForm({
      ...form,
      item_id: generateItemId(dataLen),
      item_created_by: auth.email,
      item_modified_by: auth.email,
      item_schoolid: auth.roleId,
      item_totalprice: totalPrice.toString() || 0,
      item_status: "active",
    });
  }, [dataLen, form.item_unitprice, form.item_quantity]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "dd-MM-yyyy");
    handleChange("item_purchasedate", dateStr);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "item_id",
      "item_name",
      "item_category",
      "item_quantity",
      "item_unitprice",
      "item_purchasedate",
      "item_place",
      "item_status",
      "item_description",
      "item_created_by",
      "item_modified_by",
      "item_schoolid",
    ];

    const missingField = requiredFields.find(
      (field) => !form[field] || form[field].toString().trim() === ""
    );

    if (missingField) {
      setMessageStatus(`Please fill out "${missingField.replace(/_/g, " ")}"`);
      setStatus("error");
      setVisible(true);
      return;
    }

    setModalSpinnerVisible(true);
    try {
      const response = await PostInventory(form);
      if (response?.data?.success) {
        setMessageStatus("Item added successfully!");
        setStatus("success");
        setVisible(true);
        onSubmit(form);
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (error: any) {
      setMessageStatus(error?.response?.data?.message || "Submission failed.");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const formFields = [
    "item_id",
    "item_name",
    "item_category",
    "item_quantity",
    "item_unitprice",
    "item_totalprice",
    "item_purchasedate",
    "item_brand",
    "item_unitmeasure",
    "item_place",
    "item_description",
  ];

  const dropdownFields: Record<string, OptionType[]> = {
    item_category: [
      { value: "Stationery", label: "Stationery" },
      { value: "Classroom Equipment", label: "Classroom Equipment" },
      { value: "Technology", label: "Technology" },
      { value: "Miscellaneous Supplies", label: "Miscellaneous Supplies" },
      { value: "others", label: "Others" },
    ],
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Add Inventory Item</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={() => {
                  onClose();
                  setForm({
                    ...form,
                    item_id: generateItemId(dataLen),
                    item_created_by: auth.email,
                    item_modified_by: auth.email,
                    item_schoolid: auth.roleId,
                    item_totalprice: 0,
                  });
                }}
              >
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {formFields.map((field) => (
                <View key={field} className="mb-4">
                  <Text className="text-sm text-gray-700 mb-1 capitalize">
                    {field.replace(/_/g, " ")}
                  </Text>
                  {dropdownFields[field] ? (
                    <CustomDropdown
                      label=""
                      value={form[field]}
                      onChange={(val) => handleChange(field, val)}
                      options={dropdownFields[field]}
                    />
                  ) : field === "item_purchasedate" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      >
                        <Text className="text-base text-black">
                          {form[field] || "Select date"}
                        </Text>
                        <Feather name="calendar" size={20} color="#026902" />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={showDatePicker}
                        mode="date"
                        onConfirm={handleDateConfirm}
                        onCancel={() => setShowDatePicker(false)}
                        themeVariant="light"
                        pickerContainerStyleIOS={{ backgroundColor: "white" }}
                        buttonTextColorIOS="#026902"
                        customCancelButtonIOS={() => (
                          <Pressable
                            className="bg-red-500 p-5 rounded-2xl items-center"
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text className="text-white font-semibold">
                              Cancel
                            </Text>
                          </Pressable>
                        )}
                        customHeaderIOS={() => (
                          <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
                            <Text className="text-lg font-semibold text-primary">
                              Select Date
                            </Text>
                          </View>
                        )}
                      />
                    </>
                  ) : (
                    <TextInput
                      editable={
                        field !== "item_id" && field !== "item_totalprice"
                      }
                      value={form[field] || ""}
                      onChangeText={(val) => handleChange(field, val)}
                      className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                      style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                    />
                  )}
                </View>
              ))}
              <TouchableOpacity
                className="bg-green-700 py-3 rounded-md mt-3"
                onPress={handleSubmit}
              >
                {isModalSpinnerVisible ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>

            <StatusModal
              visible={isVisible}
              status={status}
              message={messageStatus}
              onClose={() => {
                setVisible(false);
                if (status === "success") {
                  setTimeout(() => {
                    onClose();
                    setForm({
                      ...form,
                      item_id: generateItemId(dataLen),
                      item_created_by: auth.email,
                      item_modified_by: auth.email,
                      item_schoolid: auth.roleId,
                      item_totalprice: 0,
                    });
                  }, 200);
                }
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default InvFormModal;
