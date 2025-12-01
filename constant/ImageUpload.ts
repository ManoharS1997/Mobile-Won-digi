import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (result?.assets && result.assets.length > 0) {
    const image = result.assets[0];

    const compressed = await ImageManipulator.manipulateAsync(
      image.uri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );

    const fileInfo = await FileSystem.getInfoAsync(compressed.uri);
    if (!fileInfo.exists) return;

    const formData = new FormData();
    formData.append("image", {
      uri: compressed.uri,
      name: image.fileName || "upload.jpg",
      type: "image/jpeg",
    } as any);

    return formData;
  }

  return { message: "Error Occurred" };
};
