import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Settings, Bell, Heart, Calendar, Trophy, Users, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const handleLogout = () => {
    router.replace('/');
  };

  const stats = [
    { label: 'Events Attended', value: '24', icon: Calendar, color: '#00ff88' },
    { label: 'Clubs Joined', value: '5', icon: Users, color: '#00ffff' },
    { label: 'Achievements', value: '12', icon: Trophy, color: '#ff0000' },
  ];

  const followedClubs = [
    { name: 'DevClub', icon: '💻' },
    { name: 'Dramatics', icon: '🎭' },
    { name: 'Music Society', icon: '🎵' },
    { name: 'Fine Arts', icon: '🎨' },
    { name: 'Sports Committee', icon: '⚽' },
  ];

  const upcomingEvents = [
    { title: 'AI Workshop', date: 'Jan 25, 2026', club: 'ACM Chapter' },
    { title: 'Drama Auditions', date: 'Jan 27, 2026', club: 'Dramatics' },
    { title: 'Basketball Finals', date: 'Jan 30, 2026', club: 'Sports' },
  ];

  const MenuItem = ({ icon: Icon, title, onPress, showBadge = false }) => (
    <TouchableOpacity 
      className="flex-row items-center justify-between py-4 px-4 bg-cyber-green/5 border border-cyber-green/30 rounded-xl mb-3"
      onPress={onPress}
    >
      <View className="flex-row items-center flex-1">
        <Icon color="#00ff88" size={22} />
        <Text className="text-white text-base ml-3 font-medium">{title}</Text>
      </View>
      {showBadge && (
        <View className="bg-cyber-red rounded-full w-5 h-5 items-center justify-center mr-2">
          <Text className="text-white text-xs font-bold">3</Text>
        </View>
      )}
      <ChevronRight color="#666" size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View className="px-5 py-4 border-b-2 border-cyber-green/30">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-black text-cyber-green tracking-widest mb-1">
              PROFILE
            </Text>
            <Text className="text-cyber-cyan text-sm">
              Your Dashboard
            </Text>
          </View>
          <TouchableOpacity>
            <Settings color="#00ff88" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View className="bg-[#00140f]/60 border-2 border-cyber-green/30 rounded-2xl p-5 my-5">
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-cyber-green/20 border-4 border-cyber-green rounded-full items-center justify-center mb-3">
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="text-white text-xl font-bold mb-1">John Doe</Text>
            <Text className="text-cyber-cyan text-sm">john.doe@university.edu</Text>
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 bg-cyber-green rounded-full mr-2" />
              <Text className="text-cyber-green text-xs font-semibold">ACTIVE MEMBER</Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mt-4 pt-4 border-t border-cyber-green/30">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <View key={idx} className="items-center flex-1">
                  <Icon color={stat.color} size={20} />
                  <Text className="text-white text-2xl font-bold mt-2">{stat.value}</Text>
                  <Text className="text-neutral-400 text-xs mt-1 text-center">{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-cyber-green mb-3">Quick Actions</Text>
        <MenuItem icon={Bell} title="Notifications" showBadge={true} onPress={() => {}} />
        <MenuItem icon={Heart} title="Saved Events" onPress={() => {}} />
        <MenuItem icon={Calendar} title="My Calendar" onPress={() => {}} />

        {/* Following */}
        <Text className="text-lg font-bold text-cyber-green mb-3 mt-5">Following ({followedClubs.length})</Text>
        <View className="flex-row flex-wrap mb-5">
          {followedClubs.map((club, idx) => (
            <View key={idx} className="bg-cyber-green/10 border border-cyber-green/30 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center">
              <Text className="mr-2">{club.icon}</Text>
              <Text className="text-cyber-green text-sm font-medium">{club.name}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Events */}
        <Text className="text-lg font-bold text-cyber-green mb-3">Your Upcoming Events</Text>
        {upcomingEvents.map((event, idx) => (
          <View key={idx} className="bg-[#00140f]/60 border border-cyber-green/30 rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-white text-base font-bold mb-1">{event.title}</Text>
                <Text className="text-cyber-cyan text-xs mb-1">{event.club}</Text>
                <Text className="text-neutral-400 text-xs">📅 {event.date}</Text>
              </View>
              <TouchableOpacity className="bg-cyber-green/20 border border-cyber-green px-3 py-1 rounded-full">
                <Text className="text-cyber-green text-xs font-semibold">Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity 
          className="flex-row items-center justify-center py-4 px-4 bg-cyber-red/20 border-2 border-cyber-red/50 rounded-xl my-5"
          onPress={handleLogout}
        >
          <LogOut color="#ff0000" size={20} />
          <Text className="text-cyber-red text-base ml-3 font-bold">LOGOUT</Text>
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}