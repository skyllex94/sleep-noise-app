import { View, Text, Dimensions } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Onboarding screen (not used)
export default function OnBoarding() {
  const { width } = Dimensions.get("window");

  const onboardingSlides = [
    {
      id: "1",
      title: "Welcome to Gamma Noise",
      description:
        "Discover a world of soothing sounds designed to enhance your daily life",
      icon: "headset-outline",
    },
    {
      id: "2",
      title: "Improve Your Focus",
      description:
        "Use our carefully curated sounds to boost productivity and concentration",
      icon: "brain-outline",
    },
    {
      id: "3",
      title: "Better Sleep & Relaxation",
      description:
        "Find peace with our collection of calming sounds and ambient noise",
      icon: "moon-outline",
    },
  ];

  const renderSlide = ({ item, index }: { item: any; index: number }) => {
    return (
      <View
        style={{ width }}
        className="flex-1 items-center justify-center px-6"
      >
        <View className="w-24 h-24 rounded-full overflow-hidden self-center mb-8">
          <LinearGradient
            colors={["rgba(255,215,0,0.15)", "rgba(255,215,0,0)"]}
            className="w-full h-full items-center justify-center"
          >
            <View className="items-center justify-center py-4">
              <Ionicons name={item.icon as any} size={48} color="#FFD700" />
            </View>
          </LinearGradient>
        </View>

        <Text className="text-white text-3xl font-bold mb-4 text-center">
          {item.title}
        </Text>
        <Text className="text-gray-400 text-lg mb-8 text-center leading-6">
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <View>
      <Text>onboarding</Text>
    </View>
  );
}
