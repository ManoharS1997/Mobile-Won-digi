/**
 * Author: NowIT Services - WON Apps
 * Date: 2025-03-11
 * Purpose: Handles loader.
 */

import React from "react";
import { View, ActivityIndicator, Modal } from "react-native";

interface LoaderProps {
  isModalSpinnerVisible: boolean;
  setModalSpinnerVisible: (visible: boolean) => void;
}

const Loader: React.FC<LoaderProps> = ({
  isModalSpinnerVisible,
  setModalSpinnerVisible,
}) => {
  return (
    <Modal
      transparent
      visible={isModalSpinnerVisible}
      onRequestClose={() => setModalSpinnerVisible(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <ActivityIndicator size="large" color="#026902" />
      </View>
    </Modal>
  );
};

export default Loader;
