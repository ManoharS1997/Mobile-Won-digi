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
import CustomDropdown from "@/components/common/CustomDropdown";
import StatusModal from "@/components/common/StatusModal";
import { UpdateTransport } from "@/services/transportServices";
import { useAuth } from "@/context/AuthContext";
import { GetBusRoutesById } from "@/services/busroutesServices";
import { Feather } from "@expo/vector-icons";

interface EditTransportModalProps {
  visible: boolean;
  onClose: () => void;
  details: any;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string; time?: string };

const formFields = [
  "user_id",
  "user_name",
  "start_date",
  "end_date",
  "pickup_route",
  "transport_pickup",
  "transport_pickup_time",
  "pick_bus_driver",
  "pick_bus_number",
  "pickup_bus_contact",
  "drop_route",
  "transport_drop",
  "transport_drop_time",
  "drop_bus_driver",
  "drop_bus_number",
  "drop_bus_contact",
  "transport_duration",
  "transport_busfee",
  "transport_paid",
  "transport_due",
  "transport_status",
];

const EditTransportModal: React.FC<EditTransportModalProps> = ({
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
  const [form, setForm] = useState<any>({});
  const [dateField, setDateField] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [busRouteData, setBusRouteData] = useState<
    Array<{
      route_id: string;
      route_name: string;
      start_point?: string;
      end_point?: string;
      bus_number?: string;
      bus_driver?: string;
      bus_contact?: string;
      route_schoolid?: string;
      stops?: any;
    }>
  >([]);
  const [dropdownFields, setDropdownFields] = useState<
    Record<string, OptionType[]>
  >({
    transport_status: [
      { label: "active", value: "active" },
      { label: "inactive", value: "inactive" },
    ],
  });

  const getBusRouteData = async () => {
    setModalSpinnerVisible(true);
    try {
      if (typeof auth.roleId !== "string") {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Invalid user or ID");
        return;
      }

      const response = await GetBusRoutesById(auth.roleId);

      const data = response.data.routes;

      if (!data || data.length === 0) {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Bus route not found");
        return;
      }
      setBusRouteData(data);
      const busRouteOptions = data.map((route: any) => ({
        label: `${route.route_id} - ${route.route_name}`,
        value: route.route_id,
      }));

      setDropdownFields((prev) => ({
        ...prev,
        pickup_route: busRouteOptions,
        drop_route: busRouteOptions,
      }));
    } catch (error: any) {
      setVisible(true);
      setStatus("error");
      setMessageStatus(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  useEffect(() => {
    if (details) {
      setForm({
        user_id: details.user_id || "",
        user_name: details.user_name || "",
        pickup_route: details.pickup_route || "",
        transport_pickup: details.transport_pickup || "",
        transport_pickup_time: details.transport_pickup_time || "",
        pick_bus_driver: details.pick_bus_driver || "",
        pick_bus_number: details.pick_bus_number || "",
        pickup_bus_contact: details.pickup_bus_contact || "",
        drop_route: details.drop_route || "",
        transport_drop: details.transport_drop || "",
        transport_drop_time: details.transport_drop_time || "",
        drop_bus_driver: details.drop_bus_driver || "",
        drop_bus_number: details.drop_bus_number || "",
        drop_bus_contact: details.drop_bus_contact || "",
        transport_duration: details.transport_duration || "",
        transport_busfee: details.transport_busfee || "",
        transport_paid: details.transport_paid || "",
        transport_due: details.transport_due || "",
        transport_status: details.transport_status || "",
        start_date: details.start_date || "",
        end_date: details.end_date || "",
        transport_schoolid: details.transport_schoolid || "",
        transport_modified_by: auth.email || "",
      });
    }
    getBusRouteData();
  }, [details]);

  useEffect(() => {
    const routeId = form.pickup_route?.split(" - ")[0];

    if (!routeId) return;

    const selectedRoute = busRouteData.find(
      (route) => route.route_id === routeId
    );

    if (selectedRoute) {
      setForm((prevForm: any) => ({
        ...prevForm,
        pick_bus_number: selectedRoute.bus_number || "",
        pick_bus_driver: selectedRoute.bus_driver || "",
        pickup_bus_contact: selectedRoute.bus_contact || "",
      }));

      const busStopsOptions = selectedRoute.stops.map((stop: any) => ({
        label: stop.name,
        value: stop.name,
        time: stop.time,
      }));

      setDropdownFields((prev) => ({
        ...prev,
        transport_pickup: busStopsOptions,
      }));
    }
  }, [form.pickup_route, busRouteData]);

  useEffect(() => {
    const routeId = form.drop_route?.split(" - ")[0];

    if (!routeId) return;

    const selectedRoute = busRouteData.find(
      (route) => route.route_id === routeId
    );

    if (selectedRoute) {
      setForm((prevForm: any) => ({
        ...prevForm,
        drop_bus_number: selectedRoute.bus_number || "",
        drop_bus_driver: selectedRoute.bus_driver || "",
        drop_bus_contact: selectedRoute.bus_contact || "",
      }));

      const busStopsOptions = selectedRoute.stops.map((stop: any) => ({
        label: stop.name,
        value: stop.name,
        time: stop.time,
      }));

      setDropdownFields((prev) => ({
        ...prev,
        transport_drop: busStopsOptions,
      }));
    }
  }, [form.drop_route, busRouteData]);

  const handleChange = (field: string, value: string) => {
    let updatedValue = value;

    if (["transport_busfee", "transport_paid"].includes(field)) {
      updatedValue = value.replace(/[^0-9]/g, "");
    }

    setForm((prev: any) => {
      let newForm = { ...prev, [field]: updatedValue };

      const busfee = parseFloat(newForm.transport_busfee || 0);
      let paid = parseFloat(newForm.transport_paid || 0);

      if (field === "transport_paid" && paid > busfee) {
        paid = busfee;
        newForm.transport_paid = busfee.toString();
      }

      newForm.transport_due = (busfee - paid).toString();

      return newForm;
    });
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "user_id",
      "user_name",
      "transport_pickup",
      "transport_pickup_time",
      "pick_bus_driver",
      "pick_bus_number",
      "transport_drop",
      "transport_drop_time",
      "drop_bus_driver",
      "drop_bus_number",
      "transport_duration",
      "transport_busfee",
      "transport_paid",
      "transport_due",
      "transport_status",
      "start_date",
      "end_date",
      "transport_schoolid",
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
      const response = await UpdateTransport(
        form.transport_schoolid,
        form.user_id,
        form
      );

      if (response?.data?.success) {
        setMessageStatus(response.data.message || "Transport record updated!");
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
        error?.response?.data?.message || "Failed to update transport record."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const showPicker = (field: string) => {
    setDateField(field);
    if (["transport_pickup_time", "transport_drop_time"].includes(field)) {
      setTimePickerVisible(true);
    } else {
      setDatePickerVisible(true);
    }
  };

  const handleDateConfirm = (date: Date) => {
    if (dateField) {
      const formattedDate = format(date, "yyyy-MM-dd");
      handleChange(dateField, formattedDate);
    }
    setDatePickerVisible(false);
    setDateField(null);
  };

  const handleTimeConfirm = (time: Date) => {
    if (dateField) {
      const formattedTime = format(time, "HH:mm");
      handleChange(dateField, formattedTime);
    }
    setTimePickerVisible(false);
    setDateField(null);
  };

  const disabledFields = [
    "drop_bus_number",
    "drop_bus_driver",
    "drop_bus_contact",
    "pick_bus_number",
    "pick_bus_driver",
    "pickup_bus_contact",
    "transport_due",
    "transport_pickup_time",
    "transport_drop_time",
  ];

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return "";

    const [time, modifier] = timeStr.split(" "); // e.g., ["10:00", "AM"]
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
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
              <Text className="text-lg font-semibold">Edit Transport</Text>
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
              {formFields.map((field) => (
                <View key={field} className="mb-4">
                  <Text className="text-sm text-gray-700 mb-1 capitalize">
                    {field.replace(/_/g, " ")}
                  </Text>
                  {dropdownFields[field] ? (
                    <CustomDropdown
                      value={form[field]}
                      onChange={(val) => {
                        handleChange(field, val);

                        if (field === "transport_pickup") {
                          const timeStr =
                            dropdownFields[field]?.find(
                              (option) => option.value === val
                            )?.time || "";
                          setForm({
                            ...form,
                            transport_pickup: val,
                            transport_pickup_time: formatTime(timeStr),
                          });
                        }

                        if (field === "transport_drop") {
                          const timeStr =
                            dropdownFields[field]?.find(
                              (option) => option.value === val
                            )?.time || "";
                          setForm({
                            ...form,
                            transport_drop: val,
                            transport_drop_time: formatTime(timeStr),
                          });
                        }
                      }}
                      options={dropdownFields[field]}
                    />
                  ) : [
                      "start_date",
                      "end_date",
                      "transport_pickup_time",
                      "transport_drop_time",
                    ].includes(field) ? (
                    <TouchableOpacity
                      disabled={disabledFields.includes(field)}
                      className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      onPress={() => showPicker(field)}
                    >
                      <Text className="text-base text-black">
                        {form[field] ? form[field] : "Select"}
                      </Text>
                      {field === "start_date" || field === "end_date" ? (
                        <Feather name="calendar" size={20} color="#026902" />
                      ) : (
                        <Feather name="clock" size={20} color="#026902" />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TextInput
                      keyboardType={
                        ["transport_busfee", "transport_paid"].includes(field)
                          ? "numeric"
                          : "default"
                      }
                      value={form[field] || ""}
                      onChangeText={(val) => handleChange(field, val)}
                      className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
                      autoCapitalize={
                        field === "user_id" ? "characters" : "none"
                      }
                      style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                      editable={!disabledFields.includes(field)}
                      placeholder={
                        disabledFields.includes(field)
                          ? "Disabled"
                          : "Enter value"
                      }
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
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
          themeVariant="light"
          pickerContainerStyleIOS={{ backgroundColor: "white" }}
          buttonTextColorIOS="#026902"
          customCancelButtonIOS={() => (
            <Pressable
              className="bg-red-500 p-5 rounded-2xl items-center"
              onPress={() => setDatePickerVisible(false)}
            >
              <Text className="text-white font-semibold">Cancel</Text>
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
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => setTimePickerVisible(false)}
          themeVariant="light"
          pickerContainerStyleIOS={{ backgroundColor: "white" }}
          buttonTextColorIOS="#026902"
          customCancelButtonIOS={() => (
            <Pressable
              className="bg-red-500 p-5 rounded-2xl items-center"
              onPress={() => setTimePickerVisible(false)}
            >
              <Text className="text-white font-semibold">Cancel</Text>
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
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditTransportModal;
