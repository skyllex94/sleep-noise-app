import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Audio } from "expo-av";

import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome6,
} from "@expo/vector-icons";

import { useSound } from "../../context/SoundContext";
import useRevenueCat from "@/hooks/useRevenueCat";

import onBoardingModal from "@/components/onBoardingModal";
import { noiseGroups, NoiseType } from "@/constants/noises";

interface AnimationsType {
  [key: string]: Animated.Value;
}

interface PulseRing {
  animation: Animated.Value;
  delay: number;
}

export default function NoisesScreen() {
  const { sound, setSound, isPlaying, setIsPlaying } = useSound();
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({
    Sleep: true,
    Focus: true,
    Relax: true,
    Nature: false,
  });

  const router = useRouter();
  const { isProMember } = useRevenueCat();
  const [trialTimer, setTrialTimer] = useState<NodeJS.Timeout | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

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
        shouldPresentAlert: true,
        shouldCustomizeAudioSession: true,
      }),
    });

    // Configure notification actions
    Notifications.setNotificationCategoryAsync("playback", [
      {
        identifier: "pause",
        buttonTitle: "Pause",
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: "play",
        buttonTitle: "Play",
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ]);

    // Handle notification actions
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const actionId = response.actionIdentifier;
        const noiseName = response.notification.request.content.data.noiseName;

        if (actionId === "pause" && sound) {
          sound.pauseAsync();
          showPlayingNotification(noiseName, false);
        } else if (actionId === "play" && sound) {
          sound.playAsync();
          showPlayingNotification(noiseName, true);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [sound]);

  const showPlayingNotification = async (
    noiseName: string,
    isPlaying: boolean,
    isPremiumPreview: boolean = false
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Now Playing",
        body: isPremiumPreview ? `${noiseName} (Minute Preview)` : noiseName,
        data: { noiseName },
        categoryIdentifier: "playback",
        sticky: true,
      },
      trigger: null,
    });
  };

  const handleNoiseTap = async (noise: NoiseType) => {
    try {
      // Check if noise requires pro access
      if (!noise.proAccess && !isProMember) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // If the same sound is playing, stop it and clear timer
        if (isPlaying === noise.name) {
          if (trialTimer) {
            clearTimeout(trialTimer);
            setTrialTimer(null);
          }
          if (sound) {
            stopPulseAnimation(noise.name);
            await sound.stopAsync();
            await sound.unloadAsync();
            await Notifications.dismissAllNotificationsAsync();
            setSound(null);
            setIsPlaying(null);
          }
          return;
        }

        // Play sound for 1 minute
        if (noise.soundFile) {
          // Clear any existing timer
          if (trialTimer) {
            clearTimeout(trialTimer);
            setTrialTimer(null);
          }

          // Stop any currently playing sound
          if (sound) {
            stopPulseAnimation(isPlaying!);
            await sound.stopAsync();
            await sound.unloadAsync();
            await Notifications.dismissAllNotificationsAsync();
          }

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
          await showPlayingNotification(noise.name, true, true);

          // Set timer to stop after 1 minute and show paywall
          const timer = setTimeout(async () => {
            if (newSound) {
              stopPulseAnimation(noise.name);
              await newSound.stopAsync();
              await newSound.unloadAsync();
              await Notifications.dismissAllNotificationsAsync();
              setSound(null);
              setIsPlaying(null);
              router.push("/paywall");
            }
          }, 60000); // 1 minute

          setTrialTimer(timer);
        }
        return;
      }

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
          await showPlayingNotification(noise.name, true, false);
        }
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Play sound in bg and silence mode
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

  // Load saved category open or collapese state
  useEffect(() => {
    const loadExpandedStates = async () => {
      try {
        const savedStates = await AsyncStorage.getItem("expandedCategories");
        if (savedStates) {
          setExpandedCategories(JSON.parse(savedStates));
        } else {
          // If no saved states, save the default states
          await AsyncStorage.setItem(
            "expandedCategories",
            JSON.stringify(expandedCategories)
          );
        }
      } catch (error) {
        console.log("Error loading category states:", error);
      }
    };

    loadExpandedStates();
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (trialTimer) {
        clearTimeout(trialTimer);
      }
    };
  }, [trialTimer]);

  const toggleCategory = async (category: string) => {
    try {
      const newStates = {
        ...expandedCategories,
        [category]: !expandedCategories[category],
      };

      // Update state
      setExpandedCategories(newStates);

      // Save to AsyncStorage immediately
      await AsyncStorage.setItem(
        "expandedCategories",
        JSON.stringify(newStates)
      );
    } catch (error) {
      console.log("Error saving category states:", error);
    }
  };

  const renderNoiseButton = (noise: NoiseType, noiseIndex: number) => {
    return (
      <Pressable
        key={noiseIndex}
        onPress={() => handleNoiseTap(noise)}
        className="items-center px-4"
      >
        <View className="w-24 h-24 items-center justify-center">
          {isPlaying === noise.name && (
            <View className="absolute w-24 h-24 items-center justify-center">
              {pulseAnimations[noise.name].map((ring, index) => (
                <Animated.View
                  key={index}
                  className="absolute w-[48px] h-[48px] rounded-full"
                  style={{
                    backgroundColor: noise.color,
                    opacity: ring.animation.interpolate({
                      inputRange: [0.3, 1.3, 1.8],
                      outputRange: [0.3, 0.15, 0],
                      extrapolate: "clamp",
                    }),
                    transform: [{ scale: ring.animation }],
                    position: "absolute",
                  }}
                />
              ))}
            </View>
          )}

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
            {!noise.proAccess && !isProMember && (
              <View className="absolute -top-1 -right-1 bg-[#FFD700] rounded-full p-1">
                <Ionicons name="lock-closed" size={12} color="#021d32" />
              </View>
            )}
            {noise.icon && noise.iconFamily === "Ionicons" && (
              <Ionicons
                name={noise.icon as any}
                size={24}
                color={noise.iconColor || "#052642"}
              />
            )}
            {noise.icon && noise.iconFamily === "MaterialCommunityIcons" && (
              <MaterialCommunityIcons
                name={noise.icon as any}
                size={24}
                color={noise.iconColor || "#052642"}
              />
            )}
            {noise.icon && noise.iconFamily === "FontAwesome6" && (
              <FontAwesome6
                name={noise.icon as any}
                size={24}
                color={noise.iconColor || "#052642"}
              />
            )}
            {noise.icon && noise.iconFamily === "FontAwesome5" && (
              <FontAwesome5
                name={noise.icon as any}
                size={22}
                color={noise.iconColor || "#052642"}
              />
            )}
          </View>
        </View>
        <Text className="text-white text-center text-[12px] max-w-16 mb-2">
          {noise.name}
        </Text>
      </Pressable>
    );
  };

  // Keep animations running even when category is collapsed
  useEffect(() => {
    if (isPlaying) {
      startPulseAnimation(isPlaying);
    }
  }, [expandedCategories]);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      setShowOnboarding(!hasSeenOnboarding);
    } catch (error) {
      console.error("Error checking first time:", error);
      setShowOnboarding(false);
    }
  };

  // Used for resetting onboarding local storage
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("hasSeenOnboarding");
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  // Don't render anything until we check AsyncStorage
  if (showOnboarding === null) {
    return null;
  }

  const handleResetStorage = async () => {
    try {
      await AsyncStorage.clear();
      // Optional: Show feedback
      Alert.alert("Success", "Local storage has been cleared");
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  return (
    <View className="flex-1 bg-[#021d32]">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-center px-4 mb-4 mt-2">
          <View className="flex-row items-start">
            <TouchableOpacity onPress={handleResetStorage}>
              <Ionicons name="trash-outline" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <Image
              className="w-12 h-12 mb-2"
              resizeMode="contain"
              source={require("../../assets/images/icon_no_bg_reduced.png")}
            />
            <Text className="text-white text-center -ml-1 font-bold text-[25px]">
              amma Noise
            </Text>
          </View>

          <View className="flex-1 items-end">
            <TouchableOpacity onPress={resetOnboarding} className="p-2">
              <Ionicons name="refresh-circle" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>

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
                  onPress={() => toggleCategory(group.title)}
                  className="flex-row justify-between items-center p-4"
                >
                  <Text className="text-white text-[18px] font-semibold">
                    {group.title}
                  </Text>
                  <Ionicons
                    name={
                      expandedCategories[group.title]
                        ? "chevron-up"
                        : "chevron-down"
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
                  {expandedCategories[group.title] && (
                    <View>
                      <View className="flex-row justify-around px-2">
                        {group.noises.map((noise, noiseIndex) =>
                          renderNoiseButton(noise, noiseIndex)
                        )}
                      </View>
                    </View>
                  )}
                </Animated.View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Show OnBoarding Modal */}
        {showOnboarding &&
          onBoardingModal({ showOnboarding, setShowOnboarding })}
      </SafeAreaView>
    </View>
  );
}
