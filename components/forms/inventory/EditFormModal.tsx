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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import CustomDropdown from "@/components/common/CustomDropdown";
import StatusModal from "@/components/common/StatusModal";
import { UpdateInventory } from "@/services/inventoryServices";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";

interface EditInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  details: any;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string };

const dropdownFields: Record<string, OptionType[]> = {
  item_status: [
    { label: "active", value: "active" },
    { label: "inactive", value: "inactive" },
  ],
  item_category: [
    { label: "Electronics", value: "electronics" },
    { label: "Furniture", value: "furniture" },
    { label: "Stationery", value: "stationery" },
  ],
};

const inventoryFields = [
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
  "item_status",
  "item_description",
];

const EditInventoryModal: React.FC<EditInventoryModalProps> = ({
  visible,
  onClose,
  details,
  onSubmit,
}) => {
  const { auth } = useAuth();
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (details) {
      setForm({
        item_id: details.item_id || "",
        item_name: details.item_name || "",
        item_category: details.item_category || "",
        item_quantity: details.item_quantity?.toString() || "",
        item_unitprice: details.item_unitprice?.toString() || "",
        item_totalprice: details.item_totalprice?.toString() || "",
        item_purchasedate: details.item_purchasedate || "",
        item_brand: details.item_brand || "",
        item_photo: details.item_photo || "",
        item_unitmeasure: details.item_unitmeasure || "",
        item_place: details.item_place || "",
        item_status: details.item_status || "",
        item_description: details.item_description || "",
        item_schoolid: details.item_schoolid || "",
        item_modified_by: auth.email || "",
      });
    }
  }, [details]);

  useEffect(() => {
    const totalPrice = form.item_unitprice * form.item_quantity;

    setForm({
      ...form,
      item_totalprice: totalPrice.toString() || 0,
    });
  }, [form.item_unitprice, form.item_quantity]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date: Date) => {
    handleChange("item_purchasedate", format(date, "dd-MM-yyyy"));
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
      "item_status",
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
      const response = await UpdateInventory(
        form.item_schoolid,
        form.item_id,
        form
      );

      if (response?.data?.success) {
        setMessageStatus(response.data.message || "Inventory item updated!");
        setStatus("success");
        setVisible(true);
        onSubmit(form);
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data?.message || "Failed to update inventory item."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
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
              <Text className="text-lg font-semibold">Edit Inventory</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={onClose}
              >
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {inventoryFields.map((field) => (
                <View key={field} className="mb-4">
                  <Text className="text-sm text-gray-700 mb-1 capitalize">
                    {field.replace(/_/g, " ")}
                  </Text>
                  {dropdownFields[field] ? (
                    <CustomDropdown
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
                  setTimeout(() => onClose(), 200);
                }
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditInventoryModal;
