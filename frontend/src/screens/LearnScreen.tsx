import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { API_URL } from '../config/api';

export default function LearnScreen() {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<any[]>([]);
  const [initialBlocks, setInitialBlocks] = useState<any[]>([]);
  
  const [challenges, setChallenges] = useState<any[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/challenges/1`); // The backend actually returns all challenges now
      const data = await res.json();
      
      if (data && data.length > 0) {
        setChallenges(data);
        loadChallenge(data[0]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const loadChallenge = (challenge: any) => {
    setInitialBlocks(challenge.blocks);
    setAvailableBlocks(challenge.blocks);
    setSelectedBlocks([]);
  };

  const handleSelectBlock = (block: any) => {
    setSelectedBlocks([...selectedBlocks, block.text]);
    setAvailableBlocks(availableBlocks.filter(b => b.id !== block.id));
  };

  const handleRemoveBlock = (text: string) => {
    setSelectedBlocks(selectedBlocks.filter(b => b !== text));
    const block = initialBlocks.find(b => b.text === text);
    if (block) setAvailableBlocks([...availableBlocks, block]);
  };

  const handleRunCommand = async () => {
    if (selectedBlocks.length === 0) return;
    
    const currentChallenge = challenges[currentChallengeIndex];
    const isLast = currentChallengeIndex === challenges.length - 1;

    try {
      setValidating(true);
      const res = await fetch(`${API_URL}/challenges/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          blocks: selectedBlocks,
          isLast
        })
      });
      const data = await res.json();
      
      if (data.success) {
        let msg = `${data.message}\nYou gained ${data.xpGained} XP!`;
        if (data.streakIncremented) {
          msg += '\n🔥 Daily Streak Incremented!';
        }

        Alert.alert('Success!', msg, [
          { 
            text: isLast ? 'Finish Lesson' : 'Next Challenge', 
            onPress: () => {
              if (isLast) {
                // Lesson complete, loop back or stay
                Alert.alert('Lesson Complete!', 'You finished all challenges for today.');
                setCurrentChallengeIndex(0);
                loadChallenge(challenges[0]);
              } else {
                const nextIndex = currentChallengeIndex + 1;
                setCurrentChallengeIndex(nextIndex);
                loadChallenge(challenges[nextIndex]);
              }
            }
          }
        ]);
      } else {
        Alert.alert('Oops!', data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to validate command.');
    } finally {
      setValidating(false);
    }
  };

  const currentChallenge = challenges[currentChallengeIndex];

  if (loading || !currentChallenge) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn}>
          <X color={colors.text} size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerSub}>FILE MANAGEMENT • LEVEL 3</Text>
          <Text style={styles.headerTitle}>Challenge {currentChallengeIndex + 1} of {challenges.length}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>{currentChallenge?.xpReward} XP</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{currentChallengeIndex + 1}/{challenges.length}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${((currentChallengeIndex + 1) / challenges.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(((currentChallengeIndex + 1) / challenges.length) * 100)}%</Text>
      </View>

      {/* Challenge Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>CHALLENGE</Text>
        <Text style={styles.challengeText}>
          {currentChallenge?.instruction || 'Loading instruction...'}
        </Text>
      </View>

      {/* Terminal View */}
      <View style={styles.terminal}>
        <Text style={styles.promptSign}>$</Text>
        <View style={styles.terminalContent}>
          {selectedBlocks.length === 0 ? (
            <Text style={styles.terminalPlaceholder}>tap blocks below to build your command...</Text>
          ) : (
            <View style={styles.selectedBlocksContainer}>
              {selectedBlocks.map((blockText, index) => (
                <TouchableOpacity key={index} onPress={() => handleRemoveBlock(blockText)}>
                  <View style={styles.selectedBlock}>
                    <Text style={styles.selectedBlockText}>{blockText}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Blocks Grid */}
      <Text style={styles.sectionTitle}>SELECT BLOCKS IN ORDER</Text>
      <View style={styles.blocksGrid}>
        {availableBlocks.map(block => (
          <TouchableOpacity 
            key={block.id} 
            style={styles.blockBtn}
            onPress={() => handleSelectBlock(block)}
          >
            <Text style={styles.blockText}>{block.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.spacer} />

      {/* Action Button */}
      <TouchableOpacity 
        style={[styles.startBtn, selectedBlocks.length > 0 && styles.startBtnActive]}
        onPress={handleRunCommand}
        disabled={selectedBlocks.length === 0 || validating}
      >
        {validating ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.startBtnText, selectedBlocks.length > 0 && styles.startBtnTextActive]}>
            {selectedBlocks.length > 0 ? 'RUN COMMAND' : 'SELECT BLOCKS TO START'}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  headerTitles: {
    flex: 1,
  },
  headerSub: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
  xpBadge: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  xpText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    width: 30,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.cardLight,
    marginHorizontal: 10,
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  challengeText: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 28,
  },
  terminal: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    minHeight: 80,
    marginBottom: 30,
  },
  promptSign: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  terminalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  terminalPlaceholder: {
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  selectedBlocksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedBlock: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectedBlockText: {
    color: colors.background,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  blocksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  blockBtn: {
    backgroundColor: colors.blockBackground,
    borderWidth: 1,
    borderColor: colors.blockBorder,
    width: '22%',
    aspectRatio: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockText: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
  startBtn: {
    backgroundColor: colors.card,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  startBtnActive: {
    backgroundColor: colors.primary,
  },
  startBtnText: {
    color: colors.textMuted,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  startBtnTextActive: {
    color: colors.background,
  }
});
