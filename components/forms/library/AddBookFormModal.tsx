import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";
import StatusModal from "@/components/common/StatusModal";
import { useAuth } from "@/context/AuthContext";
import { PostBook } from "@/services/libraryServices";
import { WebView } from "react-native-webview";
import { generateBarcodeHTML } from "@/constant/generateBarcode";

interface BookFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const BookFormModal: React.FC<BookFormModalProps> = ({
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCopyIndex, setSelectedCopyIndex] = useState<number | null>(
    null
  );
  const [barcodeCopies, setBarcodeCopies] = useState<
    {
      book_sub_id: string;
      html: string;
      sub_id: string;
      status: string;
      original_barcode: string;
    }[]
  >([]);

  const initialForm = {
    book_id: "",
    book_name: "",
    book_description: "",
    copies: "",
    book_author: "",
    book_publishers: "",
    book_purchase_date: "",
    book_category: "",
    book_price: "",
    aisle_number: "",
    rack_number: "",
    quadrant: "",
  };

  const [form, setForm] = useState<any>(initialForm);

  const generateBookId = (length: number) =>
    `BK${String(length + 1).padStart(6, "0")}`;

  useEffect(() => {
    if (!form.copies || isNaN(Number(form.copies))) {
      setBarcodeCopies([]);
      return;
    }
    const count = parseInt(form.copies);
    const idBase = generateBookId(dataLen);
    const newCopies = Array.from({ length: count }, (_, i) => {
      const copyId = `${idBase}-${i + 1}`;
      return {
        book_sub_id: copyId,
        html: generateBarcodeHTML(copyId),
        sub_id: copyId?.split("-")[1],
        status: "available",
        original_barcode: "",
      };
    });
    setBarcodeCopies(newCopies);
  }, [form.copies, dataLen]);

  useEffect(() => {
    const newBookId = generateBookId(dataLen);
    setForm((prev: any) => ({
      ...prev,
      book_id: newBookId,
      book_added_by: auth.email,
      last_modified_by: auth.email,
      book_modified_by: auth.email,
      books: barcodeCopies,
      book_school: auth.roleId,
      book_status: "active",
    }));
  }, [dataLen, barcodeCopies]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "dd-MM-yyyy");
    handleChange("book_purchase_date", dateStr);
    setShowDatePicker(false);
  };

  const handlePressBarcode = (index: number) => {
    setSelectedCopyIndex(index);
    setModalVisible(true);
  };

  const handleBarcodeInputChange = (text: string) => {
    if (selectedCopyIndex === null) return;
    const updatedCopies = [...barcodeCopies];
    updatedCopies[selectedCopyIndex].original_barcode = text;
    setBarcodeCopies(updatedCopies); // triggers useEffect to update form.books
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "book_id",
      "book_name",
      "book_description",
      "copies",
      "book_author",
      "book_publishers",
      "book_purchase_date",
      "book_category",
      "book_price",
    ];

    const missing = requiredFields.find(
      (f) => !form[f] || form[f].toString().trim() === ""
    );
    if (missing) {
      setMessageStatus(`Please fill out "${missing.replace(/_/g, " ")}"`);
      setStatus("error");
      setVisible(true);
      return;
    }

    setModalSpinnerVisible(true);
    try {
      const response = await PostBook(form);
      if (response?.data?.success) {
        setMessageStatus(response.data.message || "Book added successfully!");
        setStatus("success");
        setVisible(true);
        onSubmit(form);
      } else {
        throw new Error(response?.data?.message || "Something went wrong");
      }
    } catch (error: any) {
      setMessageStatus(
        error?.response?.data?.message || "Failed to submit book."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const bookFields = [
    "book_id",
    "book_name",
    "book_description",
    "copies",
    "book_author",
    "book_publishers",
    "book_purchase_date",
    "book_category",
    "book_price",
    "aisle_number",
    "rack_number",
    "quadrant",
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Add Book</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={() => {
                  onClose();
                  const newBookId = generateBookId(dataLen);
                  setForm({
                    ...initialForm,
                    book_id: newBookId,
                    book_added_by: auth.email,
                    last_modified_by: auth.email,
                    book_modified_by: auth.email,
                    books: barcodeCopies,
                    book_school: auth.roleId,
                    book_status: "active",
                  });
                }}
              >
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {bookFields.map((field) => (
                <View key={field} className="mb-4">
                  <Text className="text-sm text-gray-700 mb-1 capitalize">
                    {field.replace(/_/g, " ")}
                  </Text>

                  {field === "book_purchase_date" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      >
                        <Text className="text-base text-black">
                          {form[field] || "Select purchase date"}
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
                      editable={field !== "book_id" && field !== "barcode"}
                      value={form[field] || ""}
                      onChangeText={(val) => handleChange(field, val)}
                      keyboardType={
                        field === "copies" || field === "book_price"
                          ? "numeric"
                          : "default"
                      }
                      style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                      className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                    />
                  )}
                </View>
              ))}

              {barcodeCopies.length > 0 && (
                <View className="my-4">
                  <Text className="font-semibold mb-2">Sub Copies:</Text>
                  <View className="flex-row justify-start items-center gap-2.5 flex-wrap">
                    {barcodeCopies.map((copy, index) => (
                      <Pressable
                        key={index}
                        onPress={() => handlePressBarcode(index)}
                        style={{ marginBottom: 20 }}
                      >
                        <View
                          key={index}
                          className="h-20 border p-2 border-gray-300 rounded-md"
                        >
                          <Text className="text-sm mb-1">
                            {copy.book_sub_id}
                          </Text>
                          <WebView
                            originWhitelist={["*"]}
                            source={{ html: copy.html }}
                            style={{ height: 100 }}
                            scrollEnabled={false}
                          />
                          {copy.original_barcode !== "" && (
                            <Text
                              style={{
                                textAlign: "center",
                                marginTop: 5,
                                fontSize: 12,
                                color: "gray",
                              }}
                            >
                              Original: {copy.original_barcode}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

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

            <Modal visible={modalVisible} transparent animationType="slide">
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  padding: 20,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    Enter Original Barcode
                  </Text>
                  <TextInput
                    placeholder="Original Barcode"
                    value={
                      selectedCopyIndex !== null
                        ? barcodeCopies[selectedCopyIndex]?.original_barcode ||
                          ""
                        : ""
                    }
                    onChangeText={handleBarcodeInputChange}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 5,
                    }}
                  />
                  <Pressable
                    onPress={() => setModalVisible(false)} className="bg-primary mt-5 p-3 rounded-md"
                  >
                    <Text style={{ color: "#fff", textAlign: "center" }}>
                      Close
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            <StatusModal
              visible={isVisible}
              status={status}
              message={messageStatus}
              onClose={() => {
                setVisible(false);
                if (status === "success") {
                  setTimeout(() => {
                    onClose();
                    const newBookId = generateBookId(dataLen);
                    setForm({
                      ...initialForm,
                      book_id: newBookId,
                      book_added_by: auth.email,
                      last_modified_by: auth.email,
                      book_modified_by: auth.email,
                      books: barcodeCopies,
                      book_school: auth.roleId,
                      book_status: "active",
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

export default BookFormModal;
