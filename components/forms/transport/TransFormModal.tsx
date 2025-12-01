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
import { GetStaffById, GetStudentById } from "@/services/authServices";
import { PostTransport, GetServiceByName } from "@/services/transportServices";
import { Feather } from "@expo/vector-icons";
import { GetBusRoutesById } from "@/services/busroutesServices";

interface TransFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

type OptionType = { label: string; value: string; time?: string };

const TransFormModal: React.FC<TransFormModalProps> = ({
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
  const [timeField, setTimeField] = useState<string | null>(null);
  const [dateField, setDateField] = useState<string | null>(null);
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
  >({});

  const formData = {
    user_id: "",
    user_name: "",
    user_gender: "",
    student_roll: "",
    student_class: "",
    student_section: "",
    student_city: "",
    student_pincode: "",
    student_guardian_name: "",
    relation_to_student: "",
    student_contact: "",
    student_medical: "",
    student_specify: "",
    pickup_route: "",
    drop_route: "",
    transport_pickup: "",
    transport_busfee: "",
    transport_paid: "",
    transport_due: "",
    transport_status: "active",
    transport_created_by: "",
    transport_modified_by: "",
    transport_schoolid: "",
    start_date: "",
    end_date: "",
    transport_drop: "",
    transport_pickup_time: "",
    transport_drop_time: "",
    pick_bus_number: "",
    drop_bus_number: "",
    pick_bus_driver: "",
    drop_bus_driver: "",
    drop_bus_contact: "",
    pickup_bus_contact: "",
    transport_duration: "",
  };
  const [form, setForm] = useState<any>(formData);

  const getServiceData = async () => {
    setModalSpinnerVisible(true);
    try {
      if (typeof auth.userId !== "string" || typeof auth.roleId !== "string") {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Invalid user or ID");
        return;
      }

      const response = await GetServiceByName(auth.roleId, "Transportation");

      const data = response.data.services;

      if (!data || data.length === 0) {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Service not found");
        return;
      }

      const serviceOptions = data.map((service: any) => ({
        label: `${service.service_name} - ${service.service_totalprice}`,
        value: service.service_id,
      }));

      setDropdownFields((prev) => ({
        ...prev,
        transport_services: serviceOptions,
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

  const getUserData = async () => {
    setModalSpinnerVisible(true);
    try {
      if (typeof auth.userId !== "string" || typeof auth.roleId !== "string") {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Invalid user or ID");
        return;
      }

      const isStaff = form?.user_id?.startsWith("SF");
      const response = isStaff
        ? await GetStaffById(form?.user_id, auth.roleId)
        : await GetStudentById(form?.user_id, auth.roleId);

      const data = isStaff ? response.data.staff : response.data.students;

      if (!data || data.length === 0) {
        setVisible(true);
        setStatus("error");
        setMessageStatus(isStaff ? "Staff not found" : "Student not found");
        return;
      }

      const userData = data[0];

      setForm({
        ...form,
        user_name: userData.staff_name || userData.student_name || "",
        user_gender: userData.staff_gender || userData.student_gender || "",
        student_roll: userData.student_roll || "",
        student_class: userData.staff_class || userData.student_class || "",
        student_section:
          userData.staff_section || userData.student_section || "",
        student_city: userData.staff_city || userData.student_city || "",
        student_pincode:
          userData.staff_pincode || userData.student_pincode || "",
        student_guardian_name: userData.student_guardian_name || "",
        relation_to_student: userData.relation_to_student || "",
        student_contact:
          userData.staff_contact || userData.student_contact || "",
        student_medical:
          userData.staff_medical || userData.student_medical || "",
        student_specify:
          userData.staff_specify || userData.student_specify || "",
      });
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
    if (form.user_id.length === 8) {
      getUserData();
    }
    getServiceData();
    getBusRouteData();
  }, [form?.user_id]);

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      transport_created_by: auth.email,
      transport_modified_by: auth.email,
      transport_schoolid: auth.roleId,
      transport_busfee: form?.transport_services?.split("-")[1] || "",
    }));
  }, [dataLen, form.transport_services]);

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

  const handleDateConfirm = (date: Date, field: string) => {
    handleChange(field, format(date, "dd-MM-yyyy"));
    setDateField(null);
  };

  const handleTimeConfirm = (date: Date, field: string) => {
    handleChange(field, format(date, "hh:mm a"));
    setTimeField(null);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "user_id",
      "user_name",
      "user_gender",
      "student_class",
      "student_section",
      "student_city",
      "student_pincode",
      "student_contact",
      "student_medical",
      "transport_pickup",
      "transport_busfee",
      "transport_paid",
      "transport_due",
      "transport_status",
      "transport_created_by",
      "transport_modified_by",
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
      const response = await PostTransport(form);
      if (response?.data?.success) {
        setMessageStatus(
          response.data.message || "Transport created successfully!"
        );
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
        error?.response?.data?.message || "Failed to submit transport details."
      );
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const formFields = [
    "user_id",
    "user_name",
    "start_date",
    "end_date",
    "pickup_route",
    "transport_pickup",
    "transport_pickup_time",
    "pick_bus_number",
    "pick_bus_driver",
    "pickup_bus_contact",
    "drop_route",
    "transport_drop",
    "transport_drop_time",
    "drop_bus_number",
    "drop_bus_driver",
    "drop_bus_contact",
    "transport_duration",
    "transport_services",
    "transport_busfee",
    "transport_paid",
    "transport_due",
  ];

  const disabledFields = [
    "drop_bus_number",
    "drop_bus_driver",
    "drop_bus_contact",
    "pick_bus_number",
    "pick_bus_driver",
    "pickup_bus_contact",
    "transport_due"
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
              <Text className="text-lg font-semibold">Add Transport Data</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={() => {
                  onClose();
                  setForm(formData);
                }}
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
                      label=""
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
                  ) : field === "start_date" || field === "end_date" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setDateField(field)}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                      >
                        <Text className="text-base text-black">
                          {form[field] || "Select date"}
                        </Text>
                        <Feather name="calendar" size={20} color="#026902" />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={dateField !== null}
                        mode="date"
                        onConfirm={(d) => handleDateConfirm(d, dateField!)}
                        onCancel={() => setDateField(null)}
                        themeVariant="light"
                        pickerContainerStyleIOS={{ backgroundColor: "white" }}
                        buttonTextColorIOS="#026902"
                        customCancelButtonIOS={() => (
                          <Pressable
                            className="bg-red-500 p-5 rounded-2xl items-center"
                            onPress={() => setDateField(null)}
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
                  ) : field === "transport_pickup_time" ||
                    field === "transport_drop_time" ? (
                    <>
                      <TouchableOpacity
                        disabled={true}
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-4 h-12"
                        onPress={() => setTimeField(field)}
                      >
                        <Text className="text-base text-gray-700">
                          {form[field] || "Select Time"}
                        </Text>
                        <Feather name="clock" size={20} color="#026902" />
                      </TouchableOpacity>

                      <DateTimePickerModal
                        isVisible={timeField !== null}
                        mode="time"
                        onConfirm={(d) => handleTimeConfirm(d, timeField!)}
                        onCancel={() => setTimeField(null)}
                        is24Hour={true}
                        themeVariant="light"
                        pickerContainerStyleIOS={{ backgroundColor: "white" }}
                        buttonTextColorIOS="#026902"
                        customCancelButtonIOS={() => (
                          <TouchableOpacity
                            className="bg-red-500 p-5 rounded-2xl items-center"
                            onPress={() => setTimeField(null)}
                          >
                            <Text className="text-white font-semibold ">
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        )}
                        customHeaderIOS={() => (
                          <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
                            <Text className="text-lg font-semibold text-primary">
                              Select time
                            </Text>
                          </View>
                        )}
                      />
                    </>
                  ) : (
                    <TextInput
                      value={form[field]}
                      onChangeText={(val) => handleChange(field, val)}
                      className="border border-gray-300 rounded-md px-4 h-12 text-black"
                      autoFocus={field === "user_id"}
                      keyboardType={
                        field === "bus_contact"
                          ? "numeric"
                          : field.includes("bus_number")
                          ? "ascii-capable"
                          : "default"
                      }
                      style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
                      maxLength={field === "bus_contact" ? 10 : undefined}
                      autoCapitalize={
                        ["bus_number", "user_id"].includes(field)
                          ? "characters"
                          : "none"
                      }
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
                  setTimeout(() => {
                    onClose();
                    setForm(formData);
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

export default TransFormModal;
