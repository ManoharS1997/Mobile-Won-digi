import React, { useEffect, useState } from "react";
import { View, TextInput, Text, TouchableOpacity, Platform } from "react-native";
import CustomDropdown from "../common/CustomDropdown";
import { Country, State, City } from "country-state-city";

const StepAddress = ({ onNext, onBack, formData }: any) => {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [countryList, setCountryList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [cityList, setCityList] = useState<any[]>([]);
  const [data, setData] = useState({
    student_nationality: formData.student_nationality || "",
    student_state: formData.student_state || "",
    student_city: formData.student_city || "",
    student_street: formData.student_street || "",
    student_pincode: formData.student_pincode || "",
  });

  useEffect(() => {
    setCountry(formData.student_nationality || "");
    setState(formData.student_state || "");
    setCity(formData.student_city || "");
  }, [
    formData.student_nationality,
    formData.student_state,
    formData.student_city,
  ]);

  useEffect(() => {
    const countries = Country.getAllCountries();
    setCountryList(countries);
  }, []);

  useEffect(() => {
    const selectedCountry = Country.getAllCountries().find(
      (c) =>
        c.name === data.student_nationality ||
        c.isoCode === data.student_nationality
    );
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry.isoCode);
      setStateList(states);
      setData((prev) => ({ ...prev, student_state: "", student_city: "" }));
      setCityList([]);
    }
  }, [data.student_nationality]);

  useEffect(() => {
    const selectedCountry = Country.getAllCountries().find(
      (c) =>
        c.name === data.student_nationality ||
        c.isoCode === data.student_nationality
    );

    const selectedState = State.getStatesOfCountry(
      selectedCountry?.isoCode || ""
    ).find(
      (s) =>
        s.name === (data.student_state || state) ||
        s.isoCode === (data.student_state || state)
    );

    if (selectedCountry && selectedState) {
      const cities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setCityList(cities);
      setData((prev) => ({ ...prev, student_city: "" }));
    }
  }, [data.student_state]);

  return (
    <View>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} className="mb-2.5">
          <Text className="text-sm text-gray-700 mb-1 capitalize">
            {key.replace(/_/g, " ")}
          </Text>
          {key === "student_nationality" ? (
            <CustomDropdown
              label=""
              value={value.length > 2 ? value : country}
              onChange={(text: any) =>
                setData((prev) => ({ ...prev, [key]: text }))
              }
              options={countryList.map((c) => ({
                label: c.name,
                value: c.isoCode,
              }))}
            />
          ) : key === "student_state" ? (
            <CustomDropdown
              label=""
              value={value.length > 2 ? value : state}
              onChange={(text: any) =>
                setData((prev) => ({ ...prev, [key]: text }))
              }
              options={stateList.map((s) => ({
                label: s.name,
                value: s.isoCode,
              }))}
            />
          ) : key === "student_city" ? (
            <CustomDropdown
              label=""
              value={value.length > 2 ? value : city}
              onChange={(text: any) =>
                setData((prev) => ({ ...prev, [key]: text }))
              }
              options={cityList.map((c) => ({ label: c.name, value: c.name }))}
            />
          ) : (
            <TextInput
              className="border h-12 border-gray-300 rounded-md px-3 text-base text-black"
              value={value}
              style={{ lineHeight: Platform.OS === "ios" ? 0 : -1 }}
              onChangeText={(text) =>
                setData((prev) => ({ ...prev, [key]: text }))
              }
              maxLength={key === "student_pincode" ? 6 : undefined}
              keyboardType={key === "student_pincode" ? "numeric" : "default"}
            />
          )}
        </View>
      ))}
      <View className="flex-row justify-between w-full">
        <TouchableOpacity
          className="bg-gray-400 py-3 px-10 rounded-md mt-3"
          onPress={onBack}
        >
          <Text className="text-white text-center font-semibold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-700 py-3 px-10 rounded-md mt-3"
          onPress={() => {
            onNext(data);
          }}
        >
          <Text className="text-white text-center font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepAddress;
