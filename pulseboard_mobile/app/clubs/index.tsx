import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Search, Check } from 'lucide-react-native';
import { useFocusEffect, router } from 'expo-router';
import { toggleFollowClubApi, getAllClubs } from '@/src/api/club.api';
import { getUserProfile } from '@/src/api/user.api';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const THEME = {
  ACCENT: '#CCF900',
  ACCENT_GLOW: 'rgba(204, 249, 0, 0.15)',
};

// emoji mapping from your old design
const clubIcons: Record<number, string> = {
  1: '📈',
  2: '💻',
  3: '🤖',
  4: '👾',
  5: '📱',
  6: '⌨️',
  7: '🎸',
  8: '📸',
  9: '🎨',
  10: '🎬',
  11: '📐',
  12: '🎭',
  13: '💼',
  14: '💡',
  15: '🎮',
};

type UIClub = {
  id: number;      // clubId
  _id: string;     // mongo id
  name: string;
  description: string;
  category: string;
  icon: string;
};

export default function ClubsScreen() {
  const [clubs, setClubs] = useState<UIClub[]>([]);
  const [followedClubs, setFollowedClubs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch clubs from API
  const fetchClubs = async () => {
    const data = await getAllClubs();

    const mapped: UIClub[] = data.map((club: any) => ({
      id: club.clubId,
      _id: club._id,
      name: club.name,
      description: club.description,
      category: club.category,
      icon: clubIcons[club.clubId] || '🔥',
    }));

    setClubs(mapped);
  };

  // Fetch following from profile
  const fetchUserFollowing = async () => {
    const res: any = await getUserProfile();
    setFollowedClubs(res.following || []);
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      await fetchClubs();
      await fetchUserFollowing();
      setLoading(false);
    };
    init();
  }, []);

  // Re-sync on focus
  useFocusEffect(
    useCallback(() => {
      fetchUserFollowing();
    }, [])
  );

  // Categories derived from DB
  const categories = useMemo(() => {
    const unique = Array.from(new Set(clubs.map(c => c.category)));
    return ['all', ...unique];
  }, [clubs]);

  // Toggle follow
  const toggleFollow = async (clubId: number) => {
    setLoadingId(clubId);
    try {
      const res: any = await toggleFollowClubApi(clubId);
      setFollowedClubs(res.following || []);
    } catch {
      Alert.alert('Error', 'Could not update follow status');
    } finally {
      setLoadingId(null);
    }
  };

  // Filtering
  const displayedClubs = useMemo(() => {
    return clubs.filter(club => {
      const matchesCategory =
        activeCategory === 'all' || club.category === activeCategory;

      const matchesSearch =
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [clubs, activeCategory, searchQuery]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#050505]">
        <ActivityIndicator size="large" color={THEME.ACCENT} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* HEADER */}
      <View style={{ paddingHorizontal: wp('7%'), paddingTop: hp('3.5%'), paddingBottom: hp('2%') }}>
        <Text className="text-neutral-500 font-bold uppercase"
          style={{ fontSize: hp('1.5%'), letterSpacing: 4 }}>
          Explore
        </Text>
        <Text className="text-white font-black"
          style={{ fontSize: hp('4%') }}>
          DIRECTORY
        </Text>
      </View>

      {/* STATS */}
      <View style={{ paddingHorizontal: wp('6%'), marginBottom: hp('3%') }}>
        <View className="flex-row bg-[#09090B] border border-white/10 rounded-2xl overflow-hidden"
          style={{ height: hp('10%') }}>
          <View className="flex-1 justify-center border-r border-white/5"
            style={{ paddingHorizontal: wp('5%') }}>
            <Text className="text-neutral-500 font-bold uppercase"
              style={{ fontSize: hp('1.2%') }}>
              Total Clubs
            </Text>
            <Text className="text-white font-black"
              style={{ fontSize: hp('3%') }}>
              {clubs.length}
            </Text>
          </View>

          <View className="flex-1 justify-center relative"
            style={{ paddingHorizontal: wp('5%') }}>
            <LinearGradient
              colors={[THEME.ACCENT_GLOW, 'transparent']}
              className="absolute inset-0"
            />
            <Text className="text-[#CCF900] font-bold uppercase"
              style={{ fontSize: hp('1.2%') }}>
              Following
            </Text>
            <Text className="text-white font-black"
              style={{ fontSize: hp('3%') }}>
              {followedClubs.length}
            </Text>
          </View>
        </View>
      </View>

      {/* SEARCH */}
      <View style={{ paddingHorizontal: wp('6%'), marginBottom: hp('3%') }}>
        <View className="flex-row items-center bg-[#121212] border border-white/10 rounded-xl px-4"
          style={{ height: hp('6%') }}>
          <Search color={THEME.ACCENT} size={hp('2.2%')} />
          <TextInput
            className="flex-1 text-white ml-3"
            placeholder="Search for clubs..."
            placeholderTextColor="#52525B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* CATEGORY STRIP */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp('6%') }}>
        {categories.map(category => {
          const isActive = activeCategory === category;
          return (
            <TouchableOpacity key={category}
              onPress={() => setActiveCategory(category)}
              style={{ marginRight: wp('3%') }}>
              <View className={`rounded-full border ${isActive ? 'bg-[#CCF900]' : 'border-white/15'}`}
                style={{ paddingHorizontal: wp('5%'), paddingVertical: hp('1.2%') }}>
                <Text className={`font-bold uppercase ${isActive ? 'text-black' : 'text-neutral-400'}`}>
                  {category}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* GRID */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp('6%'), paddingBottom: hp('15%') }}
      >
        <View className="flex-row flex-wrap justify-between">
          {displayedClubs.map(club => {
            const isFollowed = followedClubs.includes(club.id);
            const isLoading = loadingId === club.id;

            return (
              <TouchableOpacity
                key={club.id}
                onPress={() => router.push(`/clubs/${club._id}`)}
                style={{ width: wp('42%'), marginBottom: hp('2%') }}
                activeOpacity={0.9}
              >
                <View className={`rounded-[20px] border p-4 justify-between ${isFollowed
                  ? 'bg-[#0E0E10] border-[#CCF900]/30'
                  : 'bg-[#09090B] border-white/5'}`}
                  style={{ height: hp('26%') }}
                >
                  <View>
                    <View className="flex-row justify-between items-start mb-3">
                      <Text style={{ fontSize: hp('3.5%') }}>{club.icon}</Text>
                      {isFollowed && (
                        <Check size={hp('1.5%')} color="#CCF900" strokeWidth={4} />
                      )}
                    </View>

                    <Text className="text-white font-extrabold mb-1"
                      style={{ fontSize: hp('2%') }}>
                      {club.name}
                    </Text>

                    <Text className="text-neutral-500"
                      numberOfLines={3}
                      style={{ fontSize: hp('1.3%') }}>
                      {club.description}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleFollow(club.id)}
                    disabled={isLoading}
                    className={`w-full rounded-lg items-center justify-center ${isFollowed
                      ? 'bg-white/5 border border-white/10'
                      : 'bg-[#CCF900]'}`}
                    style={{ paddingVertical: hp('1.2%') }}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={isFollowed ? 'white' : 'black'} />
                    ) : (
                      <Text className={`font-bold uppercase ${isFollowed ? 'text-white/60' : 'text-black'}`}>
                        {isFollowed ? 'Following' : 'Follow'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
