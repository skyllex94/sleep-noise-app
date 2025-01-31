import { View, Text, Pressable } from "react-native";
import React from "react";
import Animated from "react-native-reanimated";
import {
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
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
  proAccess?: boolean;
}

//  NoiseButton({
//     noise,
//     noiseIndex,
//     isPlaying,
//     pulseAnimations,
//     startPulseAnimation,
//     stopPulseAnimation,
//     sound,
//     setSound,
//     setIsPlaying,
//     trialTimer,
//     setTrialTimer,
//     router,
//     isProMember,
//     Haptics,
//     Audio,
//     Notifications,
//     showPlayingNotification,
//   })

export default function NoiseButton(
  noise: NoiseType,
  noiseIndex: number,
  isPlaying: string,
  pulseAnimations: any,
  startPulseAnimation: any,
  stopPulseAnimation: any,
  sound: any,
  setSound: any,
  setIsPlaying: any,
  trialTimer: any,
  setTrialTimer: any,
  router: any,
  isProMember: boolean,
  Haptics: any,
  Audio: any,
  Notifications: any,
  showPlayingNotification: any
) {
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

  return (
    <Pressable
      key={noiseIndex}
      onPress={() => handleNoiseTap(noise)}
      className="items-center px-4"
    >
      <View className="w-24 h-24 items-center justify-center">
        {isPlaying === noise.name && (
          <View className="absolute w-24 h-24 items-center justify-center">
            {pulseAnimations[noise.name].map((ring: any, index: any) => (
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
}
