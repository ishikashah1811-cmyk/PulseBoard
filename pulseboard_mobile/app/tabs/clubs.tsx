import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { Search, Filter } from 'lucide-react-native';

export default function ClubsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [followedClubs, setFollowedClubs] = useState(['Dramatics', 'Fine Arts']);

  const clubs = [
    { id: 1, name: 'DevClub', icon: '💻', category: 'technical', followers: '1.2K', description: 'Code, Build, Deploy' },
    { id: 2, name: 'Dramatics Society', icon: '🎭', category: 'cultural', followers: '850', description: 'Theater & Performance' },
    { id: 3, name: 'Music Society', icon: '🎵', category: 'cultural', followers: '920', description: 'Harmony & Rhythm' },
    { id: 4, name: 'Photography Club', icon: '📸', category: 'arts', followers: '640', description: 'Capture Moments' },
    { id: 5, name: 'Robotics Club', icon: '🤖', category: 'technical', followers: '780', description: 'Build the Future' },
    { id: 6, name: 'Fine Arts', icon: '🎨', category: 'arts', followers: '560', description: 'Creative Expression' },
    { id: 7, name: 'Sports Committee', icon: '⚽', category: 'sports', followers: '1.5K', description: 'Athletic Excellence' },
    { id: 8, name: 'Dance Society', icon: '💃', category: 'cultural', followers: '890', description: 'Movement & Grace' },
    { id: 9, name: 'ACM Chapter', icon: '🖥️', category: 'technical', followers: '950', description: 'Computing Innovations' },
    { id: 10, name: 'Literary Society', icon: '📚', category: 'academic', followers: '670', description: 'Words & Wisdom' },
  ];

  const categories = ['all', 'technical', 'cultural', 'arts', 'sports', 'academic'];

  const filterClubs = () => {
    let filtered = clubs;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(club => club.category === activeCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const toggleFollow = (clubName) => {
    setFollowedClubs(prev => 
      prev.includes(clubName) 
        ? prev.filter(c => c !== clubName)
        : [...prev, clubName]
    );
  };

  const displayedClubs = filterClubs();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View className="px-5 py-4 border-b-2 border-cyber-green/30">
        <Text className="text-2xl font-black text-cyber-green tracking-widest mb-1">
          CLUBS
        </Text>
        <Text className="text-cyber-cyan text-sm">
          Discover & Join Communities
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-cyber-green/5 border border-cyber-green/30 rounded-full mx-5 mt-4 mb-3 px-4">
        <Search color="#00ff88" size={20} className="mr-2" />
        <TextInput
          className="flex-1 text-white text-base py-3"
          placeholder="Search clubs..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Filter color="#00ff88" size={20} />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-4">
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            className={`px-5 py-2 rounded-full mr-2 border ${
              activeCategory === category 
                ? 'bg-cyber-green/20 border-cyber-green' 
                : 'bg-cyber-green/5 border-cyber-green/30'
            }`}
            onPress={() => setActiveCategory(category)}
          >
            <Text className="text-cyber-green text-sm font-medium capitalize">
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats */}
      <View className="flex-row px-5 mb-4">
        <View className="flex-1 bg-cyber-green/10 border border-cyber-green/30 rounded-xl p-3 mr-2">
          <Text className="text-cyber-cyan text-xs font-semibold">TOTAL CLUBS</Text>
          <Text className="text-white text-2xl font-bold mt-1">{clubs.length}</Text>
        </View>
        <View className="flex-1 bg-cyber-green/10 border border-cyber-green/30 rounded-xl p-3 ml-2">
          <Text className="text-cyber-cyan text-xs font-semibold">FOLLOWING</Text>
          <Text className="text-white text-2xl font-bold mt-1">{followedClubs.length}</Text>
        </View>
      </View>

      {/* Clubs Grid */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-cyber-green mb-3">
          {activeCategory === 'all' ? 'All Clubs' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Clubs`}
        </Text>
        
        <View className="flex-row flex-wrap justify-between pb-8">
          {displayedClubs.map(club => (
            <View key={club.id} className="w-[48%] bg-[#00140f]/60 border-2 border-cyber-green/30 rounded-xl p-4 mb-4">
              <Text className="text-5xl mb-3 text-center">{club.icon}</Text>
              <Text className="text-base font-bold text-cyber-cyan mb-1 text-center">
                {club.name}
              </Text>
              <Text className="text-neutral-400 text-xs mb-2 text-center">
                {club.description}
              </Text>
              <Text className="text-cyber-green text-xs mb-3 text-center font-semibold">
                {club.followers} followers
              </Text>
              <TouchableOpacity
                className={`py-2 rounded-full border ${
                  followedClubs.includes(club.name)
                    ? 'bg-cyber-green/20 border-cyber-cyan'
                    : 'bg-transparent border-cyber-green'
                }`}
                onPress={() => toggleFollow(club.name)}
              >
                <Text className="text-cyber-green text-xs font-semibold text-center">
                  {followedClubs.includes(club.name) ? '✓ Following' : '+ Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {displayedClubs.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-6xl mb-4">🔍</Text>
            <Text className="text-neutral-400 text-base">No clubs found</Text>
            <Text className="text-neutral-500 text-sm mt-2">Try adjusting your filters</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}