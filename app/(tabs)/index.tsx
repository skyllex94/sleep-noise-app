import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  Animated,
  Easing,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Link, useRouter } from "expo-router";
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
import Paywall from "../paywall";
import { LinearGradient } from "expo-linear-gradient";

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
  proAccess?: boolean;
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
        proAccess: true,
      },
      {
        name: "Pink Noise",
        color: "#FFB6C1",
        soundFile: require("../../assets/noises/pink.mp3"),
        proAccess: true,
      },
      {
        name: "Brown Noise",
        color: "#8B4513",
        soundFile: require("../../assets/noises/brown.mp3"),
        proAccess: false,
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
        proAccess: true,
      },
      {
        name: "Nature Sound",
        color: "#FFFFFF",
        icon: "leaf",
        iconFamily: "Ionicons",
        iconColor: "black",
        soundFile: require("../../assets/noises/stress-nature.mp3"),
        proAccess: false,
      },
      {
        name: "Relaxing Noise",
        color: "#FFFFFF",
        icon: "bee-flower",
        iconFamily: "MaterialCommunityIcons",
        iconColor: "black",
        soundFile: require("../../assets/noises/stress-relaxing.mp3"),
        proAccess: false,
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
        proAccess: false,
      },
      {
        name: "Purple Noise",
        color: "#9400D3",
        soundFile: require("../../assets/noises/purple.mp3"),
        proAccess: false,
      },
      {
        name: "Tinnitus Noise",
        color: "#FFFFFF",
        icon: "ear-listen",
        iconFamily: "FontAwesome6",
        iconColor: "black",
        soundFile: require("../../assets/noises/tinnitus-silk.mp3"),
        proAccess: false,
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
        proAccess: false,
      },
      {
        name: "Fosus & Memory Sound",
        color: "#FFFFFF",
        icon: "brain",
        iconFamily: "FontAwesome5",
        iconColor: "black",
        soundFile: require("../../assets/noises/focus-quantum.mp3"),
        proAccess: false,
      },
      {
        name: "Universe Sound",
        color: "#FFFFFF",
        icon: "cloud",
        iconFamily: "FontAwesome5",
        iconColor: "black",
        soundFile: require("../../assets/noises/focus-universe.mp3"),
        proAccess: false,
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get("window");

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

  const toggleGroup = (groupTitle: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isExpanding = !expandedCategories[groupTitle];

    Animated.timing(animations[groupTitle], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpandedCategories((prev) => ({
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

  const showTrialNotification = () => {
    Alert.alert(
      "Trial Mode",
      "This premium sound will play for 1 minute. Get Premium access with 3 days free trial to unlock unlimited listening!",
      [
        {
          text: "Get Premium",
          onPress: () => {
            if (sound) {
              sound.stopAsync();
              setSound(null);
              setIsPlaying(null);
            }
            router.push("/paywall");
          },
          style: "default",
        },
        {
          text: "Continue Trial",
          style: "cancel",
        },
      ]
    );
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

  // Load saved states on mount
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

  // Cleanup on unmount
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

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("hasSeenOnboarding");
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

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
        <LinearGradient
          colors={["rgba(255,215,0,0.15)", "rgba(255,215,0,0)"]}
          className="w-24 h-24 rounded-full items-center justify-center mb-8"
        >
          <Ionicons name={item.icon as any} size={48} color="#FFD700" />
        </LinearGradient>

        <Text className="text-white text-3xl font-bold mb-4 text-center">
          {item.title}
        </Text>
        <Text className="text-gray-400 text-lg mb-8 text-center leading-6">
          {item.description}
        </Text>
      </View>
    );
  };

  const renderOnboarding = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showOnboarding}
        onRequestClose={() => setShowOnboarding(false)}
      >
        <View className="flex-1 bg-[#021d32]">
          <SafeAreaView className="flex-1">
            {currentSlide < 3 ? (
              <>
                <FlatList
                  ref={flatListRef}
                  data={onboardingSlides}
                  renderItem={renderSlide}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(
                      e.nativeEvent.contentOffset.x / width
                    );
                    setCurrentSlide(newIndex);
                  }}
                />

                {/* Pagination Dots */}
                <View className="flex-row justify-center mb-8">
                  {onboardingSlides.map((_, index) => (
                    <View
                      key={index}
                      className={`h-2 w-2 rounded-full mx-1 ${
                        currentSlide === index
                          ? "bg-[#FFD700]"
                          : "bg-gray-500/30"
                      }`}
                    />
                  ))}
                </View>

                {/* Navigation Buttons */}
                <View className="px-6 mb-8">
                  <TouchableOpacity
                    onPress={() => {
                      if (currentSlide < 2) {
                        flatListRef.current?.scrollToIndex({
                          index: currentSlide + 1,
                          animated: true,
                        });
                        setCurrentSlide(currentSlide + 1);
                      } else {
                        setCurrentSlide(3); // Show paywall
                      }
                    }}
                    className="bg-[#FFD700] p-4 rounded-full w-full mb-4"
                  >
                    <Text className="text-[#021d32] text-center font-bold text-lg">
                      {currentSlide === 2 ? "Get Premium Access" : "Next"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      AsyncStorage.setItem("hasSeenOnboarding", "true");
                      setShowOnboarding(false);
                    }}
                    className="p-4"
                  >
                    <Text className="text-gray-400 text-center">
                      Skip for now
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Paywall
                onClose={() => {
                  AsyncStorage.setItem("hasSeenOnboarding", "true");
                  setShowOnboarding(false);
                }}
                onPurchaseComplete={() => {
                  AsyncStorage.setItem("hasSeenOnboarding", "true");
                  setShowOnboarding(false);
                }}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
    );
  };

  // Don't render anything until we check AsyncStorage
  if (showOnboarding === null) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#021d32]">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-center px-4 mb-8 mt-4">
          <View className="flex-1" />
          <Text className="text-white text-center font-bold text-[25px]">
            Gamma Noise
          </Text>
          <View className="flex-1 items-end">
            {/* Right-aligned container */}
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

        {showOnboarding && renderOnboarding()}
      </SafeAreaView>
    </View>
  );
}
