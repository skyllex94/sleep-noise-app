import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#021d32]">
      {/* Sticky Header */}
      <View className="px-4 bg-[#021d32] z-10">
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-white text-center font-bold text-[24px] mb-2 -mt-10">
          Terms and Conditions
        </Text>
        <Text className="text-gray-400 text-[12px] mb-6 text-center">
          Last Updated: 01/29/2025
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-300 text-[14px] mb-4 leading-6">
          Welcome to GammaNoise! These Terms and Conditions ("Terms") govern
          your use of the GammaNoise mobile application ("App"). By downloading,
          accessing, or using the App, you agree to be bound by these Terms. If
          you do not agree, please do not use the App.
        </Text>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            1. Use of the App
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            • GammaNoise provides various noise options designed to promote
            relaxation and focus.{"\n"}• The App is intended for personal,
            non-commercial use only.{"\n"}• You agree not to use the App for any
            unlawful or prohibited activities.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            2. No Medical Claims or Guarantees
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            • The sounds provided in GammaNoise are for relaxation and relief
            purposes only.{"\n"}• GammaNoise is not a medical app and does not
            claim to diagnose, treat, cure, or prevent any medical conditions,
            including but not limited to anxiety, stress, tinnitus, or sleep
            disorders.{"\n"}• If you have any medical concerns, consult a
            healthcare professional.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            3. User Data and Privacy
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            • We do not collect or store any personal data. GammaNoise operates
            without requiring user profiles, logins, or personal information.
            {"\n"}• The App does not track usage or collect analytics.{"\n"}•
            For more information, refer to our Privacy Policy.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            4. Intellectual Property
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            • All sounds, logos, branding, and content within GammaNoise are
            owned by us or licensed for use.{"\n"}• You may not copy,
            distribute, modify, or sell any part of the App without prior
            written consent.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            5. Limitation of Liability
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            • GammaNoise is provided "as is" and "as available" without any
            warranties.{"\n"}• We are not responsible for any direct, indirect,
            incidental, or consequential damages resulting from your use of the
            App.{"\n"}• While we strive for high-quality audio experiences, we
            do not guarantee uninterrupted or error-free operation.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            6. Modifications to the Terms
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            • We reserve the right to update these Terms at any time. Changes
            will be reflected in the "Last Updated" date above.{"\n"}• Continued
            use of the App after updates constitutes acceptance of the new
            Terms.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            7. Termination
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            • We may suspend or terminate your access to the App at our
            discretion, without notice, if we believe you have violated these
            Terms.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            8. Governing Law
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            • These Terms are governed by and interpreted in accordance with the
            laws of United States.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-white font-semibold text-[16px] mb-2">
            9. Contact Information
          </Text>
          <Text className="text-gray-300 text-[14px] leading-6">
            If you have any questions about these Terms, please contact us at:
            zionstudiosapps@gmail.com
          </Text>
        </View>

        <Text className="text-gray-300 text-[14px] mb-8 leading-6">
          By using GammaNoise, you acknowledge that you have read, understood,
          and agreed to these Terms.{"\n"}
          Thank you for using GammaNoise!
        </Text>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
