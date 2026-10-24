import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BookOpen, Trophy, User } from 'lucide-react-native';

import LearnScreen from './src/screens/LearnScreen';
import LeadersScreen from './src/screens/LeadersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    border: colors.border,
    text: colors.text,
    primary: colors.primary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingTop: 5,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
          }}
        >
          <Tab.Screen 
            name="Learn" 
            component={LearnScreen} 
            options={{
              tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />
            }}
          />
          <Tab.Screen 
            name="Leaders" 
            component={LeadersScreen} 
            options={{
              tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
