import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header Section */}
      <View className="h-[50vh] bg-black justify-center items-center border-b-2 border-cyber-green/30">
        <SafeAreaView className="items-center">
          {/* Logo */}
          <View className="w-[140px] h-[140px] border-4 border-cyber-green rounded-[20px] rotate-45 justify-center items-center bg-cyber-green/5">
            <Text className="-rotate-45 text-cyber-green text-[56px] font-black tracking-tighter">
              PB
            </Text>
          </View>

          {/* Title */}
          <Text className="text-[32px] font-black text-cyber-green mt-10 tracking-[4px]">
            PULSEBOARD
          </Text>
          
          {/* Live Indicator */}
          <View className="flex-row items-center mt-4">
            <View className="w-2 h-2 bg-cyber-red rounded mr-2" />
            <Text className="text-cyber-cyan text-[13px] font-semibold">
              LIVE SYSTEM
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <View className="flex-1 px-8 justify-between pb-10">
        <View className="mt-12 items-center">
          <Text className="text-[28px] font-bold text-white mb-4 text-center tracking-wide">
            Welcome to the Future
          </Text>
          <Text className="text-[15px] text-neutral-300 text-center leading-6 px-5">
            Experience the ultimate platform for campus events, clubs, and opportunities. Stay connected in real-time.
          </Text>
        </View>

        {/* Buttons */}
        <View className="gap-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/auth/login')}
            className="h-14 rounded-full justify-center items-center bg-transparent border-2 border-cyber-green"
          >
            <Text className="text-cyber-green font-bold text-base tracking-widest">
              LOGIN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/auth/register')}
            className="h-14 rounded-full justify-center items-center bg-cyber-green"
          >
            <Text className="text-black font-black text-base tracking-widest">
              REGISTER NOW
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}