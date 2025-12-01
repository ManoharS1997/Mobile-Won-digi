import CountryCodeDropdownPicker from "react-native-dropdown-country-picker";
import React from "react";

const MobileField = ({ formData, setFormData }) => {
  return (
    <CountryCodeDropdownPicker
      selected={
        formData?.usercontact?.dialCode || formData?.contact?.dialCode || "+91"
      }
      setSelected={(value) => {
        if (formData.usercontact) {
          setFormData((prev) => ({
            ...prev,
            usercontact: {
              ...prev?.usercontact,
              dialCode: value,
            },
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            contact: {
              ...prev?.contact,
              dialCode: "+91",
            },
          }));
        }
      }}
      setCountryDetails={(value) => {
        if (formData.usercontact) {
          setFormData((prev) => ({
            ...prev,
            usercontact: {
              ...prev?.usercontact,
              countrycode: value,
            },
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            contact: {
              ...prev?.contact,
              countrycode: "+91",
            },
          }));
        }
      }}
      phone={formData?.usercontact?.number || formData?.contact?.number || ""}
      setPhone={(value) => {
        if (/^[0-9]*$/.test(value)) {
          const trimmedValue = value.slice(0, 10);
          {
            if (formData.usercontact) {
              setFormData((prev) => ({
                ...prev,
                usercontact: {
                  ...prev?.usercontact,
                  number: trimmedValue,
                },
              }));
            } else {
              setFormData((prev) => ({
                ...prev,
                contact: {
                  ...prev?.contact,
                  number: trimmedValue,
                },
              }));
            }
          }
        }
      }}
      countryCodeContainerStyles={{
        paddingVertical: 12,
        height: 44,
      }}
      phoneStyles={{
        paddingVertical: 12,
        width: "100%",
        height: 44,
        backgroundColor: "#fff",
      }}
      searchStyles={{
        paddingVertical: 10,
        width: "100%",
        height: 44,
      }}
      countryCodeTextStyles={{ fontSize: 11 }}
    />
  );
};

export default MobileField;
