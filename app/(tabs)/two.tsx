import {
  View,
  Text,
  SafeAreaView,
  Switch,
  Modal,
  TouchableOpacity,
  Linking,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import * as StoreReview from "expo-store-review";

import { useSound } from "../../context/SoundContext";
import useRevenueCat from "@/hooks/useRevenueCat";

export default function SettingsScreen() {
  const { sound, setSound, setIsPlaying } = useSound();
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerValue, setTimerValue] = useState(30); // minutes
  const [timerActive, setTimerActive] = useState(false);
  const [volumeValue, setVolumeValue] = useState(0.8);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const router = useRouter();

  const { isProMember } = useRevenueCat();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    if (timerEnabled && timerActive && sound) {
      const endTime = Date.now() + timerValue * 60 * 1000;

      // Update remaining time every second
      countdownInterval = setInterval(() => {
        const remaining = Math.ceil((endTime - Date.now()) / (1000 * 60));
        setRemainingTime(remaining);

        if (remaining <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      // Stop sound when timer ends
      timer = setTimeout(async () => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
          setIsPlaying(null);
          setTimerActive(false);
          setTimerEnabled(false);
          setRemainingTime(null);
        } catch (error) {
          console.log("Error stopping sound:", error);
        }
      }, timerValue * 60 * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [timerEnabled, timerActive, timerValue, sound]);

  const handleTimerToggle = () => {
    if (!timerEnabled) {
      setShowTimerModal(true);
    } else {
      setTimerEnabled(false);
      setTimerActive(false);
    }
  };

  const handleTimerSet = () => {
    setShowTimerModal(false);
    setTimerEnabled(true);
    setTimerActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleVolumeChange = async (value: number) => {
    setVolumeValue(value);

    try {
      if (sound) {
        await sound.setVolumeAsync(value);
      }
    } catch (error) {
      console.log("Error updating volume:", error);
    }
  };

  const handleContactUs = async () => {
    const email = "zionstudiosapps@gmail.com";
    const subject = "GammaNoise Question";
    const body =
      "Hello, I would like to contact you regarding GammaNoise App on the App Store...";

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      }
    } catch (error) {
      console.log("Error opening email:", error);
    }
  };

  const handlePrivacyPolicy = async () => {
    const url = "https://www.apple.com/legal/privacy/data/en/app-store/";
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.log("Error opening privacy policy:", error);
    }
  };

  const handleTellAFriend = async () => {
    try {
      const result = await Share.share({
        message:
          "Hey, check-out this app I've been trying out with sleeping better. It also has a bunch more sound for focus and relaxation.",
      });
    } catch (error) {
      console.log("Error sharing app:", error);
    }
  };

  const handleRateApp = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.log("Error opening review:", error);
    }
  };

  const renderPremiumBanner = () => {
    return (
      <View className="mb-4">
        <View className="rounded-xl overflow-hidden">
          <LinearGradient
            colors={["#FFD700", "#C27F06"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="p-10"
          >
            <View className="flex-row items-center p-4 justify-between">
              <View>
                <Text className="text-[#021d32] text-[20px] font-semibold">
                  Enjoy All Sounds
                </Text>
                <Text className="text-[#021d32] text-base">
                  Unlock 9+ Premium Sounds & More
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/paywall")}
                className="bg-white px-4 py-2 rounded-full"
                activeOpacity={0.7}
              >
                <Text className="text-[#021d32] font-semibold">Get Access</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#021d32]">
      {/* Options Section */}
      <View className="px-4">
        <Text className="text-gray-400 text-[14px] mb-4 font-semibold mt-4">
          OPTIONS
        </Text>

        {/* Timer Control */}
        <View className="bg-[#0A3A5A] rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="timer-outline" size={24} color="#FFD700" />
              <Text className="text-white text-[16px] font-semibold ml-3">
                Set a Timer
              </Text>
            </View>
            <Switch
              value={timerEnabled}
              onValueChange={handleTimerToggle}
              trackColor={{ false: "#4A4A4A", true: "#FFD700" }}
              thumbColor={timerEnabled ? "#FFFFFF" : "#f4f3f4"}
            />
          </View>
          {timerEnabled && (
            <Text className="text-gray-300 text-[14px]">
              Sound will stop after {remainingTime ?? Math.round(timerValue)}{" "}
              {(remainingTime ?? Math.round(timerValue)) === 1
                ? "minute"
                : "minutes"}
            </Text>
          )}
        </View>

        {/* Volume Control */}
        <View className="bg-[#0A3A5A] rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="volume-high-outline" size={24} color="#FFD700" />
            <Text className="text-white text-[16px] font-semibold ml-3">
              Volume
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Slider
              style={{ width: "80%", height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={volumeValue}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor="#FFD700"
              maximumTrackTintColor="#4A4A4A"
              thumbTintColor="#FFD700"
            />
            <Text className="text-white text-[14px] ml-2">
              {Math.round(volumeValue * 100)}%
            </Text>
          </View>
        </View>
      </View>

      {/* General Section */}
      <View className="px-4 mt-6">
        <Text className="text-gray-400 text-[14px] mb-4 font-semibold">
          GENERAL
        </Text>

        {/* Premium Banner - only show if not pro member */}
        {!isProMember && renderPremiumBanner()}

        <View className="bg-[#0A3A5A] rounded-xl overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-[#1E3951]"
            activeOpacity={0.7}
            onPress={handlePrivacyPolicy}
          >
            <Text className="text-white text-[16px]">Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFD700" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-[#1E3951]"
            activeOpacity={0.7}
            onPress={() => router.push("/terms")}
          >
            <Text className="text-white text-[16px]">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFD700" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            activeOpacity={0.7}
            onPress={handleContactUs}
          >
            <Text className="text-white text-[16px]">Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View className="px-4 mt-6">
        <Text className="text-gray-400 text-[14px] mb-4 font-semibold">
          ABOUT
        </Text>

        <View className="bg-[#0A3A5A] rounded-xl overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-[#1E3951]"
            activeOpacity={0.7}
            onPress={handleTellAFriend}
          >
            <Text className="text-white text-[16px]">Tell a Friend</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFD700" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            activeOpacity={0.7}
            onPress={handleRateApp}
          >
            <Text className="text-white text-[16px]">Rate the App</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Timer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimerModal}
        onRequestClose={() => setShowTimerModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-[#0A3A5A] p-6 rounded-2xl w-[80%]">
            <Text className="text-white text-center text-[18px] font-semibold mb-6">
              Set Timer Duration
            </Text>
            <View className="flex-row items-center justify-between mb-8">
              <Slider
                style={{ width: "80%", height: 40 }}
                minimumValue={5}
                maximumValue={360}
                step={5}
                value={timerValue}
                onValueChange={(value) => {
                  setTimerValue(value);
                }}
                minimumTrackTintColor="#FFD700"
                maximumTrackTintColor="#4A4A4A"
                thumbTintColor="#FFD700"
              />
              <Text className="text-white text-[14px] ml-2">
                {Math.round(timerValue)}m
              </Text>
            </View>
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() => setShowTimerModal(false)}
                className="px-4 py-2"
              >
                <Text className="text-gray-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTimerSet}
                className="bg-[#FFD700] px-4 py-2 rounded-lg"
              >
                <Text className="text-[#021d32] font-semibold">Set Timer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
