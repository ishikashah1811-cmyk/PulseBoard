import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

type ClubCardProps = {
  icon: string;
  name: string;
  selected: boolean;
  clubId: string;
  onPress?: () => void;
};

export default function ClubCard({
  icon,
  name,
  selected,
  clubId,
  onPress,
}: ClubCardProps) {
  
  const handlePress = () => {
    // 1. Log to verify the button is actually working
    console.log("Card pressed! Target ID:", clubId);

    // 2. Run parent logic (like highlighting the card) if it exists
    if (onPress) {
      onPress();
    }

    // 3. ALWAYS navigate to the club profile
    // Note: Ensure your file is named [clubId].tsx in app/clubs/
    router.push(`/clubs/${clubId}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`border-2 rounded-2xl p-4 mb-4 flex-row items-center justify-between
        ${selected ? "border-green-400 bg-green-500/10" : "border-green-800 bg-black"}
      `}
    >
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">{icon}</Text>
        <Text className="text-white text-lg font-semibold">{name}</Text>
      </View>

      <View
        className={`w-5 h-5 rounded-full border-2
          ${selected ? "bg-green-400 border-green-400" : "border-gray-500"}
        `}
      />
    </TouchableOpacity>
  );
}