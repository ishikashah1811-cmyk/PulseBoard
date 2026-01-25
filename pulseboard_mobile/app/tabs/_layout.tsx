import { Tabs } from 'expo-router';
import { Home, Users, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: 'rgba(0, 255, 136, 0.3)',
          borderTopWidth: 2,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#00ff88',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'CLUBS',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
