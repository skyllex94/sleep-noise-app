import { View, Text, Modal, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef } from "react";

interface OnboardingModalProps {
  showOnboarding: boolean | null;
  setShowOnboarding: (value: boolean) => void;
}

export default function OnboardingModal({
  showOnboarding,
  setShowOnboarding,
}: OnboardingModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleGetStarted = () => {
    Animated.spring(slideAnim, {
      toValue: 1000,
      damping: 20,
      mass: 1,
      stiffness: 100,
      useNativeDriver: true,
    }).start(async () => {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setShowOnboarding(false);
      slideAnim.setValue(0);
    });
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={showOnboarding === true}
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black/50">
        <Animated.View
          className="flex-1 justify-end"
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View className="bg-[#052642]/95 rounded-t-3xl p-6 overflow-hidden">
            <View className="w-24 h-24 rounded-full overflow-hidden self-center mb-8">
              <LinearGradient
                colors={["rgba(255,215,0,0.15)", "rgba(255,215,0,0)"]}
                className="w-full h-full items-center justify-center"
              >
                <View className="items-center justify-center py-4">
                  <Ionicons name="headset-outline" size={48} color="#FFD700" />
                </View>
              </LinearGradient>
            </View>

            <Text className="text-white text-3xl font-bold mb-4 text-center">
              Welcome to Gamma Noise
            </Text>

            <Text className="text-gray-400 text-lg mb-8 text-center leading-6">
              Discover a world of soothing sounds designed to enhance your
              focus, sleep, and relaxation. Make sure you allow notifications
              for the best experience.
            </Text>

            <TouchableOpacity
              onPress={handleGetStarted}
              className="bg-[#FFD700] p-4 rounded-full w-full mb-6"
            >
              <Text className="text-[#021d32] text-center font-bold text-lg">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
