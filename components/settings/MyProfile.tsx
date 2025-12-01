import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import MobileField from "../MobileField";
import { pickImage } from "@/constant/ImageUpload";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import CustomDropdown from "../common/CustomDropdown";
import { Country, State, City } from "country-state-city";
import {
  GetFileUrl,
  GetStaffById,
  GetStudentById,
  UpdateStaffProfile,
  UpdateStudentProfile,
} from "@/services/authServices";
import { useAuth } from "@/context/AuthContext";

interface LoaderProps {
  setModalSpinnerVisible: (visible: boolean) => void;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageStatus: React.Dispatch<React.SetStateAction<string>>;
  setStatus: React.Dispatch<React.SetStateAction<"error" | "success">>;
}

const MyProfile: React.FC<LoaderProps> = ({
  setModalSpinnerVisible,
  setVisible,
  setMessageStatus,
  setStatus,
}) => {
  const { auth, setAuth } = useAuth();
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [formData, setFormData] = useState({
    fullname: "",
    gender: "",
    date: "",
    contact: { number: "", countryCode: "IN", dialCode: "+91" },
    logo: `https://eu.ui-avatars.com/api/?name=${auth.name}&size=250`,
    city: "",
    state: "",
    country: "",
    street: "",
    pincode: "",
  });

  const getUserData = async () => {
    setModalSpinnerVisible(true);

    try {
      if (typeof auth.userId !== "string" || typeof auth.roleId !== "string") {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Invalid user or ID");
        return;
      }

      const isStaff = auth.userId.startsWith("SF");
      const response = isStaff
        ? await GetStaffById(auth.userId, auth.roleId)
        : await GetStudentById(auth.userId, auth.roleId);

      const data = isStaff ? response.data.staff : response.data.students;

      if (!data || data.length === 0) {
        setVisible(true);
        setStatus("error");
        setMessageStatus(isStaff ? "Staff not found" : "Student not found");
        return;
      }

      const userData = data[0];

      const nationalityName = isStaff
        ? userData.staff_nationality
        : userData.student_nationality;

      const stateName = isStaff ? userData.staff_state : userData.student_state;

      const country = Country.getAllCountries().find(
        (c) => c.name === nationalityName
      );

      const state = State.getStatesOfCountry(country?.isoCode || "").find(
        (s) => s.name === stateName
      );

      const contactNumber = isStaff
        ? userData.staff_contact
        : userData.student_contact;

      const birthDate = isStaff
        ? userData.staff_date_of_birth
        : userData.student_date_of_birth;

      setFormData({
        fullname: userData.staff_name || userData.student_name || "",
        gender: userData.staff_gender || userData.student_gender || "",
        date: birthDate ? format(new Date(birthDate), "dd/MM/yyyy") : "",
        contact: {
          number: contactNumber?.slice(2) || "",
          countryCode: "IN",
          dialCode: contactNumber ? `+${contactNumber.slice(0, 2)}` : "",
        },
        logo:
          userData.staff_photo ||
          userData.student_photo ||
          `https://eu.ui-avatars.com/api/?name=${auth.name}&size=250`,
        city: userData.staff_city || userData.student_city || "",
        state: state?.isoCode || "",
        country: country?.isoCode || "",
        street: userData.staff_street || userData.student_street || "",
        pincode: userData.staff_pincode || userData.student_pincode || "",
      });

      setCountry(country?.name || "");
      setState(state?.name || "");
      setCity(userData.staff_city || userData.student_city || "");
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
    getUserData();
  }, []);

  const [countryList, setCountryList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [cityList, setCityList] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const countries = Country.getAllCountries();
    setCountryList(countries);
  }, []);

  useEffect(() => {
    const selectedCountry = Country.getAllCountries().find(
      (c) => c.name === formData.country || c.isoCode === formData.country
    );
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry.isoCode);
      setStateList(states);
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
      setCityList([]);
    }
  }, [formData.country]);

  useEffect(() => {
    const selectedCountry = Country.getAllCountries().find(
      (c) => c.name === formData.country || c.isoCode === formData.country
    );

    const selectedState = State.getStatesOfCountry(
      selectedCountry?.isoCode || ""
    ).find(
      (s) =>
        s.name === (formData.state || state) ||
        s.isoCode === (formData.state || state)
    );

    if (selectedCountry && selectedState) {
      const cities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setCityList(cities);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.state]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePickImage = async () => {
    setModalSpinnerVisible(true);
    const formData = await pickImage();
    if (formData) {
      await GetFileUrl(formData)
        .then((res) => {
          const imageUrl = res.data.fileUrl;
          setSelectedImage(imageUrl);

          handleInputChange("logo", imageUrl);
        })
        .catch((error: any) => {
          Alert.alert(error?.response?.data?.message || "Something went wrong");
        })
        .finally(() => {
          setModalSpinnerVisible(false);
        });
    }
  };

  const handleDateConfirm = (date: Date) => {
    const dateStr = format(date, "dd-MM-yyyy");
    handleInputChange("date", dateStr);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    setModalSpinnerVisible(true);

    try {
      if (typeof auth.roleId !== "string" || typeof auth.userId !== "string") {
        setVisible(true);
        setStatus("error");
        setMessageStatus("Invalid user or ID");
        return;
      }

      const selectedCountry = Country.getAllCountries().find(
        (c) => c.isoCode === formData.country
      );
      const selectedState = State.getStatesOfCountry(
        selectedCountry?.isoCode || ""
      ).find((s) => s.isoCode === formData.state);

      const commonData = {
        last_modified_by: auth.email,
        city: formData.city.length > 2 ? formData.city : city,
        state:
          formData.state.length > 2
            ? formData.state
            : selectedState?.name || state,
        nationality:
          formData.country.length > 2
            ? formData.country
            : selectedCountry?.name,
        street: formData.street,
        pincode: formData.pincode,
        photo: formData.logo,
        contact: `${formData.contact.dialCode.replace("+", "")}${
          formData.contact.number
        }`,
        gender: formData.gender,
        name: formData.fullname,
        date_of_birth: formData.date.split("/").reverse().join("-"),
      };

      let payload: any;
      let updateFunction: Function;
      let profileKey: string;
      let nameKey: string;

      if (auth.role === "staff") {
        payload = {
          last_modified_by: commonData.last_modified_by,
          staff_name: commonData.name,
          staff_gender: commonData.gender,
          staff_date_of_birth: commonData.date_of_birth,
          staff_contact: commonData.contact,
          staff_photo: commonData.photo,
          staff_city: commonData.city,
          staff_state: commonData.state,
          staff_nationality: commonData.nationality,
          staff_street: commonData.street,
          staff_pincode: commonData.pincode,
        };
        updateFunction = UpdateStaffProfile;
        profileKey = "staff_photo";
        nameKey = "staff_name";
      } else {
        payload = {
          last_modified_by: commonData.last_modified_by,
          student_name: commonData.name,
          student_gender: commonData.gender,
          student_date_of_birth: commonData.date_of_birth,
          student_contact: commonData.contact,
          student_photo: commonData.photo,
          student_city: commonData.city,
          student_state: commonData.state,
          student_nationality: commonData.nationality,
          student_street: commonData.street,
          student_pincode: commonData.pincode,
        };
        updateFunction = UpdateStudentProfile;
        profileKey = "student_photo";
        nameKey = "student_name";
      }

      await updateFunction(auth.roleId, auth.userId, payload);

      setAuth((prev) => ({
        ...prev,
        profile: payload[profileKey],
        name: payload[nameKey],
      }));

      setVisible(true);
      setStatus("success");
      setMessageStatus("Profile updated successfully");
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

  return (
    <ScrollView
      className="h-[50vh]"
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center mb-5">
        <View className="relative w-[90px] h-[90px]">
          <Image
            source={{
              uri:
                selectedImage ||
                auth.profile ||
                "https://eu.ui-avatars.com/api/?name=Student&size=250&background=ffffff&color=000",
            }}
            className="w-[90px] h-[90px] rounded-full"
          />
          <TouchableOpacity
            className="absolute right-1 bottom-1 bg-primary rounded-2xl p-1"
            onPress={handlePickImage}
          >
            <MaterialIcons name="edit" size={15} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="w-full mb-5">
        <Text className="mb-1">Full Name</Text>
        <TextInput
          className="w-full h-12 px-5 bg-white text-black rounded-lg border border-gray-300"
          value={formData.fullname}
          onChangeText={(text) => handleInputChange("fullname", text)}
        />
      </View>

      <View className="w-full mb-5">
        <CustomDropdown
          label="Gender"
          value={formData.gender}
          onChange={(val) => handleInputChange("gender", val)}
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
          ]}
        />
      </View>

      <View className="w-full mb-5">
        <Text className="mb-1">Date of Birth</Text>
        <TouchableOpacity
          className="w-full h-12 px-5 bg-white text-black rounded-lg border border-gray-300 flex-row items-center justify-between"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-gray-700">
            {formData.date || "Select Date of Birth"}
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
            <TouchableOpacity
              className="bg-red-500 p-5 rounded-2xl items-center"
              onPress={() => setShowDatePicker(false)}
            >
              <Text className="text-white font-semibold ">Cancel</Text>
            </TouchableOpacity>
          )}
          customHeaderIOS={() => (
            <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
              <Text className="text-lg font-semibold text-primary">
                Select date of birth
              </Text>
            </View>
          )}
        />
      </View>

      <View className="w-full mb-5">
        <Text className="mb-1">Mobile Number</Text>
        <ScrollView horizontal contentContainerStyle={{ width: "100%" }}>
          <MobileField formData={formData} setFormData={setFormData} />
        </ScrollView>
      </View>

      <View className="w-full mb-5">
        <CustomDropdown
          label="Country"
          value={formData.country.length > 2 ? formData.country : country}
          onChange={(val) => handleInputChange("country", val)}
          options={countryList.map((c) => ({
            label: c.name,
            value: c.isoCode,
          }))}
        />
      </View>

      <View className="w-full mb-5">
        <CustomDropdown
          label="State"
          value={formData.state.length > 2 ? formData.state : state}
          onChange={(val) => handleInputChange("state", val)}
          options={stateList.map((s) => ({ label: s.name, value: s.isoCode }))}
        />
      </View>

      <View className="w-full mb-5">
        <CustomDropdown
          label="City"
          value={formData.city.length > 0 ? formData.city : city}
          onChange={(val) => handleInputChange("city", val)}
          options={cityList.map((c) => ({ label: c.name, value: c.name }))}
        />
      </View>

      <View className="w-full mb-5">
        <Text className="mb-1">Street</Text>
        <TextInput
          className="w-full h-12 px-5 bg-white text-black rounded-lg border border-gray-300"
          value={formData.street}
          onChangeText={(text) => handleInputChange("street", text)}
        />
      </View>

      <View className="w-full mb-5">
        <Text className="mb-1">Pincode</Text>
        <TextInput
          keyboardType="numeric"
          className="w-full h-12 px-5 bg-white text-black rounded-lg border border-gray-300"
          value={formData.pincode}
          onChangeText={(text) => handleInputChange("pincode", text)}
        />
      </View>

      <View className="flex flex-row justify-end mt-5">
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-primary rounded-lg px-6 py-2"
        >
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MyProfile;
