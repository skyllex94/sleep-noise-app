import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

import { Audio } from "expo-av";

import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome6,
} from "@expo/vector-icons";

interface NoiseType {
  name: string;
  color: string;
  soundFile?: number;
  icon?: string;
  iconFamily?:
    | "Ionicons"
    | "MaterialCommunityIcons"
    | "FontAwesome6"
    | "FontAwesome5";
  iconColor?: string;
}

interface NoiseGroupType {
  title: string;
  noises: NoiseType[];
}

const noiseGroups: NoiseGroupType[] = [
  {
    title: "Sleep Aid & Anxiety",
    noises: [
      {
        name: "White Noise",
        color: "#FFFFFF",
        soundFile: require("../../assets/noises/white.mp3"),
      },
      {
        name: "Pink Noise",
        color: "#FFB6C1",
        soundFile: require("../../assets/noises/pink.mp3"),
      },
      {
        name: "Brown Noise",
        color: "#8B4513",
        soundFile: require("../../assets/noises/brown.mp3"),
      },
    ],
  },
  {
    title: "Stress Management",
    noises: [
      {
        name: "Green Noise",
        color: "#00FF00",
        soundFile: require("../../assets/noises/green.mp3"),
      },
      {
        name: "Nature Sound",
        color: "#FFFFFF",
        icon: "leaf",
        iconFamily: "Ionicons",
        iconColor: "black",
        soundFile: require("../../assets/noises/stress-nature.mp3"),
      },
      {
        name: "Relaxing Noise",
        color: "#FFFFFF",
        icon: "bee-flower",
        iconFamily: "MaterialCommunityIcons",
        iconColor: "black",
        soundFile: require("../../assets/noises/stress-relaxing.mp3"),
      },
    ],
  },
  {
    title: "Tinnitus Relief",
    noises: [
      {
        name: "Blue Noise",
        color: "#0000FF",
        soundFile: require("../../assets/noises/blue.mp3"),
      },
      {
        name: "Purple Noise",
        color: "#9400D3",
        soundFile: require("../../assets/noises/purple.mp3"),
      },
      {
        name: "Tinnitus Noise",
        color: "#FFFFFF",
        icon: "ear-listen",
        iconFamily: "FontAwesome6",
        iconColor: "black",
        soundFile: require("../../assets/noises/tinnitus-silk.mp3"),
      },
    ],
  },
  {
    title: "Focus & Productivity",
    noises: [
      {
        name: "40hz Binaural Beats",
        color: "#FFFFFF",
        icon: "hand-holding-water",
        iconFamily: "FontAwesome5",
        iconColor: "black",
        soundFile: require("../../assets/noises/focus-40hz.mp3"),
      },
      {
        name: "Fosus & Memory Sound",
        color: "#FFFFFF",
        icon: "brain",
        iconFamily: "FontAwesome5",
        iconColor: "black",
        soundFile: require("../../assets/noises/focus-quantum.mp3"),
      },
      {
        name: "Universe Sound",
        color: "#FFFFFF",
        icon: "cloud",
        iconFamily: "FontAwesome5",
        iconColor: "black",
        soundFile: require("../../assets/noises/focus-universe.mp3"),
      },
    ],
  },
];

interface AnimationsType {
  [key: string]: Animated.Value;
}

interface PulseRing {
  animation: Animated.Value;
  delay: number;
}

export default function NoisesScreen() {
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

  const pulseAnimations = useRef<{ [key: string]: PulseRing[] }>(
    noiseGroups.reduce(
      (acc, group) => ({
        ...acc,
        ...group.noises.reduce(
          (noiseAcc, noise) => ({
            ...noiseAcc,
            [noise.name]: [
              { animation: new Animated.Value(1), delay: 0 },
              { animation: new Animated.Value(1), delay: 500 },
              { animation: new Animated.Value(1), delay: 1000 },
            ],
          }),
          {}
        ),
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

  const startPulseAnimation = (noiseName: string) => {
    pulseAnimations[noiseName].forEach((ring) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring.animation, {
            toValue: 1.8,
            duration: 2500,
            useNativeDriver: true,
            delay: ring.delay,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          Animated.timing(ring.animation, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const stopPulseAnimation = (noiseName: string) => {
    pulseAnimations[noiseName].forEach((ring) => {
      Animated.timing(ring.animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start(() => {
        ring.animation.setValue(1);
      });
    });
  };

  useEffect(() => {
    // Request notification permissions
    Notifications.requestPermissionsAsync();

    // Configure notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const showPlayingNotification = async (noiseName: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Now Playing",
        body: noiseName,
        data: { noiseName },
        categoryIdentifier: "playback",
      },
      trigger: null,
    });
  };

  const handleNoiseTap = async (noise: NoiseType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (isPlaying === noise.name) {
        stopPulseAnimation(noise.name);
        await sound?.stopAsync();
        await sound?.unloadAsync();
        setSound(null);
        setIsPlaying(null);
        await Notifications.dismissAllNotificationsAsync();
      } else {
        if (sound) {
          stopPulseAnimation(isPlaying!);
          await sound.stopAsync();
          await sound.unloadAsync();
          await Notifications.dismissAllNotificationsAsync();
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
          startPulseAnimation(noise.name);
          await showPlayingNotification(noise.name);
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

  // Add this useEffect at the top level of your component
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Error setting audio mode:", error);
      }
    };

    configureAudio();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#05243c]">
      <Text className="text-white text-center font-bold text-[25px] mb-8 mt-4">
        Gamma Noise
      </Text>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View className="px-4">
          {noiseGroups.map((group, groupIndex) => (
            <View
              key={groupIndex}
              className="mb-4 rounded-xl bg-[#052642]"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 1,
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
                  <View>
                    <View className="flex-row justify-around px-2">
                      {group.noises.map((noise, noiseIndex) => (
                        <Pressable
                          key={noiseIndex}
                          onPress={() => handleNoiseTap(noise)}
                          className="items-center px-4"
                        >
                          <View className="w-24 h-24 items-center justify-center">
                            {isPlaying === noise.name &&
                              pulseAnimations[noise.name].map((ring, index) => (
                                <Animated.View
                                  key={index}
                                  className="absolute w-[48px] h-[48px] rounded-full"
                                  style={{
                                    backgroundColor: noise.color,
                                    opacity: ring.animation.interpolate({
                                      inputRange: [1, 1.3, 1.8],
                                      outputRange: [0.3, 0.15, 0],
                                      extrapolate: "clamp",
                                    }),
                                    transform: [
                                      {
                                        scale: ring.animation,
                                      },
                                    ],
                                    position: "absolute",
                                  }}
                                />
                              ))}

                            <View
                              className="w-12 h-12 rounded-full items-center justify-center"
                              style={{
                                backgroundColor: noise.color,
                                shadowColor: noise.color,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.6,
                                shadowRadius: 6,
                                elevation: 5,
                              }}
                            >
                              {noise.icon &&
                                noise.iconFamily === "Ionicons" && (
                                  <Ionicons
                                    name={noise.icon as any}
                                    size={24}
                                    color={noise.iconColor || "#052642"}
                                  />
                                )}
                              {noise.icon &&
                                noise.iconFamily ===
                                  "MaterialCommunityIcons" && (
                                  <MaterialCommunityIcons
                                    name={noise.icon as any}
                                    size={24}
                                    color={noise.iconColor || "#052642"}
                                  />
                                )}
                              {noise.icon &&
                                noise.iconFamily === "FontAwesome6" && (
                                  <FontAwesome6
                                    name={noise.icon as any}
                                    size={24}
                                    color={noise.iconColor || "#052642"}
                                  />
                                )}
                              {noise.icon &&
                                noise.iconFamily === "FontAwesome5" && (
                                  <FontAwesome5
                                    name={noise.icon as any}
                                    size={22}
                                    color={noise.iconColor || "#052642"}
                                  />
                                )}
                            </View>
                          </View>
                          <Text className="text-white text-center text-[12px] max-w-16 mb-2">
                            {/* {noise.name} */}
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
      </ScrollView>
    </SafeAreaView>
  );
}
