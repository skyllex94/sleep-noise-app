import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function PaywallScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#021d32]">
      {/* Image Container with Gradient */}
      <View className="h-[45%] w-full pt-10 absolute top-0">
        <Image
          source={require("../assets/images/paywall-image.jpg")}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "#021d32"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "30%",
          }}
        />
        <LinearGradient
          colors={["#021d32", "transparent"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "50%",
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      <View className="flex-1 px-6">
        {/* Header */}
        <View className="mt-8">
          <Text className="text-white text-center font-bold text-[28px] mb-2">
            Enjoy the Full Benefits
          </Text>
          <Text className="text-gray-300 text-center text-[16px]">
            Get Access to Your Better You!
          </Text>
        </View>

        {/* Content Container - pushes content to bottom */}
        <View className="flex-1 justify-end mb-6">
          {/* Benefits */}
          <View className="space-y-12 mb-10 gap-y-4">
            {/* Benefit 1 */}
            <View className="flex-row">
              <View className="w-[20%] items-center pt-1">
                <Ionicons name="layers-outline" size={28} color="#FFD700" />
              </View>
              <View className="w-[80%]">
                <Text className="text-white font-semibold text-[16px] mb-1">
                  Full Access to all Sounds
                </Text>
                <Text className="text-gray-300 text-[14px]">
                  Unlock our complete library of carefully crafted sounds for
                  every mood and moment
                </Text>
              </View>
            </View>

            {/* Benefit 2 */}
            <View className="flex-row">
              <View className="w-[20%] items-center pt-1">
                <Ionicons name="infinite-outline" size={28} color="#FFD700" />
              </View>
              <View className="w-[80%]">
                <Text className="text-white font-semibold text-[16px] mb-1">
                  More Noises to Come
                </Text>
                <Text className="text-gray-300 text-[14px]">
                  Be the first to experience new sounds as we continuously
                  expand our collection
                </Text>
              </View>
            </View>

            {/* Benefit 3 */}
            <View className="flex-row">
              <View className="w-[20%] items-center pt-1">
                <Ionicons name="sparkles-outline" size={28} color="#FFD700" />
              </View>
              <View className="w-[80%]">
                <Text className="text-white font-semibold text-[16px] mb-1">
                  Continuous Sound Refinement
                </Text>
                <Text className="text-gray-300 text-[14px]">
                  Experience enhanced audio quality with our regularly updated
                  and optimized sounds
                </Text>
              </View>
            </View>
          </View>

          {/* Subscription Options */}
          <View className="gap-y-3">
            {/* Monthly Option */}
            <TouchableOpacity
              className="bg-[#0A3A5A] p-4 rounded-3xl border border-[#1E90FF]"
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold text-[16px]">
                Monthly Plan
              </Text>
              <Text className="text-gray-300 text-center text-[12px] mt-1">
                3-day free trial, then $1.99/month
              </Text>
            </TouchableOpacity>

            {/* Yearly Option */}
            <TouchableOpacity
              className="bg-[#0A3A5A] p-4 rounded-3xl border border-[#FFD700]"
              activeOpacity={0.7}
            >
              <View className="absolute -top-2 right-4 bg-[#FFD700] px-2 py-1 rounded-full">
                <Text className="text-[#021d32] text-[10px] font-bold">
                  SAVE 16%
                </Text>
              </View>
              <Text className="text-white text-center font-semibold text-[16px]">
                Yearly Plan
              </Text>
              <Text className="text-gray-300 text-center text-[12px] mt-1">
                3-day free trial, then $9.99/year
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Links with dividers */}
          <View className="flex-row justify-center items-center mt-6">
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-gray-400 text-[12px]">Privacy Policy</Text>
            </TouchableOpacity>
            <Text className="text-gray-400 text-[12px] mx-3">|</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-gray-400 text-[12px]">
                Restore Purchase
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-400 text-[12px] mx-3">|</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-gray-400 text-[12px]">
                Terms of Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
