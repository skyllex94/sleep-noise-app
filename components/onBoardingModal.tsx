import { View, Text, Modal, TouchableOpacity, Image } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

interface onBoardingModalProps {
  showOnboarding: boolean;
  setShowOnboarding: (value: boolean) => void;
}

export default function onBoardingModal({
  showOnboarding,
  setShowOnboarding,
}: onBoardingModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showOnboarding === true}
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 justify-end">
          <View className="bg-[#052642]/95 rounded-t-3xl p-6 overflow-hidden">
            <View className="w-24 h-24 rounded-full overflow-hidden self-center mb-8">
              <LinearGradient
                colors={["rgba(255,215,0,0.5)", "rgba(255,215,0,0.05)"]}
                className="w-full h-full items-center justify-center"
              >
                <View className="items-center justify-center py-4">
                  <Image
                    className="w-16 h-16"
                    source={require("../assets/images/icon_no_bg.png")}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
            </View>

            <Text className="text-white text-3xl font-bold mb-4 text-center">
              Welcome to Gamma
            </Text>

            <Text className="text-gray-400 text-lg mb-6 text-center leading-6">
              Discover a world of soothing sounds designed to enhance your
              focus, sleep, and relaxation. Allowing notifications will let you
              view the sounds from your Control Center.
            </Text>

            <TouchableOpacity
              onPress={() => {
                AsyncStorage.setItem("hasSeenOnboarding", "true");
                setShowOnboarding(false);
              }}
              className="bg-[#FFD700] p-4 rounded-full w-full mb-6"
            >
              <Text className="text-[#021d32] text-center font-bold text-lg">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
