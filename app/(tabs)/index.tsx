import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";

export default function TabOneScreen() {
  return (
    <View className="flex-1 align-items-center justify-center">
      <Text className="font-bold text-center uppercase">Tab asf</Text>

      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}
