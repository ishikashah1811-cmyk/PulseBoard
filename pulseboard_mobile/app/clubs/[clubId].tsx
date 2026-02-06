import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getClubById } from "@/src/api/club.api";

export default function ClubProfileScreen() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;

    const fetchClub = async () => {
      try {
        const data = await getClubById(clubId);
        setClub(data);
      } catch (err) {
        console.error("Error fetching club", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId]);

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#C7F000" />
      </View>
    );
  }

  if (!club) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Club not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-10">
      {/* Emoji Logo */}
      <View className="items-center mb-6">
        <View className="w-28 h-28 rounded-full bg-zinc-800 items-center justify-center border border-zinc-700">
          <Text className="text-5xl">🏏</Text>
        </View>
      </View>

      {/* Club Name */}
      <Text className="text-white text-3xl font-bold text-center">
        {club.name}
      </Text>

      {/* Category (placeholder for now) */}
      <View className="self-center mt-3 px-4 py-1 rounded-full bg-lime-500/20">
        <Text className="text-lime-400 font-semibold tracking-wide">
          CLUB
        </Text>
      </View>

      {/* Followers count */}
      <Text className="text-gray-400 text-center mt-4">
        {club.following?.length || 0} followers
      </Text>

      {/* Follow Button (UI only for now) */}
      <Pressable className="mt-6 bg-lime-400 py-4 rounded-2xl">
        <Text className="text-black text-center font-bold text-lg">
          + FOLLOW CLUB
        </Text>
      </Pressable>

      {/* About Us */}
      <View className="mt-8 bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
        <Text className="text-white text-xl font-bold mb-3">
          About Us
        </Text>
        <Text className="text-gray-300 leading-6">
          {club.description || "No description added yet."}
        </Text>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
}
