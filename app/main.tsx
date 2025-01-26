import { View, Text, SafeAreaView, Pressable, Animated } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

interface NoiseType {
  name: string;
  color: string;
  soundFile?: number;
}

interface NoiseGroupType {
  title: string;
  noises: NoiseType[];
}

const noiseGroups: NoiseGroupType[] = [
  {
    title: "Anxiety Relief",
    noises: [
      {
        name: "White Noise",
        color: "#FFFFFF",
        soundFile: require("../assets/noises/white.mp3"),
      },
      { name: "Pink Noise", color: "#FFB6C1" },
      { name: "Violet Noise", color: "#9400D3" },
    ],
  },
  {
    title: "Stress Management",
    noises: [
      { name: "Brown Noise", color: "#8B4513" },
      { name: "Pink Noise", color: "#FFB6C1" },
      { name: "Green Noise", color: "#00FF00" },
    ],
  },
  {
    title: "Tinnitus Relief",
    noises: [
      { name: "White Noise", color: "#FFFFFF" },
      { name: "Brown Noise", color: "#8B4513" },
      { name: "Blue Noise", color: "#0000FF" },
    ],
  },
  {
    title: "Focus & Productivity",
    noises: [
      { name: "Pink Noise", color: "#FFB6C1" },
      { name: "Brown Noise", color: "#8B4513" },
      { name: "Blue Noise", color: "#0000FF" },
    ],
  },
];

interface AnimationsType {
  [key: string]: Animated.Value;
}

export default function MainScreen() {
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>(noiseGroups.reduce((acc, group) => ({ ...acc, [group.title]: true }), {}));

  const animations = useRef<AnimationsType>(
    noiseGroups.reduce(
      (acc, group) => ({
        ...acc,
        [group.title]: new Animated.Value(1),
      }),
      {}
    )
  ).current;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const toggleGroup = (groupTitle: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isExpanding = !expandedGroups[groupTitle];

    Animated.timing(animations[groupTitle], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const handleNoiseTap = async (noise: NoiseType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (isPlaying === noise.name) {
        await sound?.stopAsync();
        await sound?.unloadAsync();
        setSound(null);
        setIsPlaying(null);
      } else {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }

        if (noise.soundFile) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            noise.soundFile,
            {
              isLooping: true,
              shouldPlay: true,
              volume: 1.0,
            }
          );
          setSound(newSound);
          setIsPlaying(noise.name);
        }
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <SafeAreaView className="flex-1 bg-[#021d32]">
      <Text className="text-white text-center font-bold text-[25px] mb-8 mt-4">
        GammaNoise
      </Text>

      <View className="px-4">
        {noiseGroups.map((group, groupIndex) => (
          <View
            key={groupIndex}
            className="mb-4 rounded-xl bg-[#052642]"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Pressable
              onPress={() => toggleGroup(group.title)}
              className="flex-row justify-between items-center p-4"
            >
              <Text className="text-white text-[18px] font-semibold">
                {group.title}
              </Text>
              <Ionicons
                name={
                  expandedGroups[group.title] ? "chevron-up" : "chevron-down"
                }
                size={24}
                color="white"
              />
            </Pressable>

            <Animated.View
              style={{
                maxHeight: animations[group.title].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
                opacity: animations[group.title],
                overflow: "hidden",
              }}
            >
              {expandedGroups[group.title] && (
                <View className="p-4 pt-0">
                  <View className="flex-row justify-between">
                    {group.noises.map((noise, noiseIndex) => (
                      <Pressable
                        key={noiseIndex}
                        onPress={() => handleNoiseTap(noise)}
                        className="items-center"
                      >
                        <View
                          className="w-14 h-14 rounded-full mb-2"
                          style={{
                            backgroundColor: noise.color,
                            shadowColor: noise.color,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            elevation: 5,
                          }}
                        />
                        <Text className="text-white text-center text-[12px] max-w-16">
                          {noise.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </Animated.View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
