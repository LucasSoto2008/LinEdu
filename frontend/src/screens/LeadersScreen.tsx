import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Trophy } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { API_URL } from '../config/api';

export default function LeadersScreen() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [])
  );

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/users/leaderboard`);
      const data = await res.json();
      setLeaders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Trophy color={colors.primary} size={24} />
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>
      <Text style={styles.headerSub}>Weekly ranking • resets in 4d 12h</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {leaders.map((user) => (
          <View 
            key={user.id} 
            style={[styles.userCard, user.isYou && styles.userCardActive]}
          >
            <View style={styles.rankContainer}>
              {user.medal ? (
                <Text style={styles.medalText}>{user.medal}</Text>
              ) : (
                <Text style={[styles.rankText, user.isYou && { color: colors.primary }]}>#{user.rank}</Text>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[styles.userName, user.isYou && { color: colors.primary }]}>
                {user.name} {user.isYou && <Text style={styles.youBadge}>• YOU</Text>}
              </Text>
              <Text style={styles.streakText}>
                {user.streak}🔥 streak
              </Text>
            </View>

            <Text style={[styles.xpText, user.isYou && { color: colors.primary }]}>
              {user.xp} XP
            </Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 10,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 30,
  },
  listContainer: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  medalText: {
    fontSize: 20,
  },
  rankText: {
    color: colors.textMuted,
    fontWeight: 'bold',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  youBadge: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'normal',
  },
  streakText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  xpText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
  }
});
