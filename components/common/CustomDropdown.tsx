import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label?: string;
  value: string | string[];
  onChange: (val: any) => void;
  options: Option[];
  placeholder?: string;
  multiple?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  multiple = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );

  useEffect(() => {
    const filtered = options?.filter((option) =>
      option.label.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchText, options]);

  useEffect(() => {
    // Sync with incoming props when dropdown is not open
    if (!visible) {
      setSelectedValues(Array.isArray(value) ? value : value ? [value] : []);
    }
  }, [value, visible]);

  const handleSelect = (item: Option) => {
    if (multiple) {
      let updated: string[];
      if (selectedValues.includes(item.label)) {
        updated = selectedValues?.filter((val) => val !== item.label);
      } else {
        updated = [...selectedValues, item.label];
      }
      setSelectedValues(updated);
      onChange(updated);
    } else {
      onChange(item.label);
      setVisible(false);
      setSearchText("");
    }
  };

  const renderDisplayText = () => {
    if (multiple) {
      return selectedValues.length > 0
        ? selectedValues.join(", ")
        : placeholder;
    } else {
      return typeof value === "string" && value ? value : placeholder;
    }
  };

  return (
    <View>
      {label && <Text className="mb-1">{label}</Text>}
      <TouchableOpacity
        className="h-12"
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
      >
        <Text numberOfLines={1} style={styles.dropdownText}>{renderDisplayText()}</Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={"#6b7280"}
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={filteredOptions}
              keyExtractor={(item,index) => `${item.value} + ${index}`}
              renderItem={({ item }) => {
                const isSelected = selectedValues.includes(item.label);
                return (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && { color: "#10b981", fontWeight: "600" },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.noResultText}>No results found</Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdownButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#d1d5db",
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
    width:"95%"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 10,
    maxHeight: 350,
  },
  searchInput: {
    height: 40,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 16,
    color: "#111827",
  },
  noResultText: {
    textAlign: "center",
    color: "#6b7280",
    paddingVertical: 20,
  },
});
