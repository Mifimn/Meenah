// app/chat.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, StatusBar, TouchableOpacity, 
  TextInput, Platform, Modal, KeyboardAvoidingView 
} from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import BottomNav from '../components/BottomNav';
import GlassHeader from '../components/GlassHeader';
import UniversalBackground from '../components/UniversalBackground';
import { useRouter } from 'expo-router';
import { Search, Plus, X, UserCheck, ShieldCheck } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const DUMMY_CHATS = [
  { id: '1', name: 'Meenah Support', preview: 'Your custom wedding cake order has been confirmed!', time: '10:00 AM', unread: 2 },
  { id: '2', name: 'Baker John', preview: 'Yes, we can make it gluten-free!', time: 'Yesterday', unread: 0 },
  { id: '3', name: 'Delivery Team', preview: 'Your package is 5 minutes away.', time: 'Monday', unread: 0 }
];

export default function ChatScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  // Drawer & Search State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [memberDigits, setMemberDigits] = useState('');
  const [foundMember, setFoundMember] = useState<{name: string, id: string} | null>(null);

  // Simulate Database Lookup when 8 digits are entered
  useEffect(() => {
    if (memberDigits.length === 8) {
      // In a real app, you would query Supabase here. 
      // For now, we instantly verify the user!
      setFoundMember({ 
        name: memberDigits === '12345678' ? 'Aminah (Ashabi)' : 'Verified Member', 
        id: `MH${memberDigits}` 
      });
    } else {
      setFoundMember(null);
    }
  }, [memberDigits]);

  const handleStartNewChat = () => {
    if (!foundMember) return;
    setIsDrawerOpen(false);
    setMemberDigits(''); // Reset for next time
    router.push({ pathname: `/chat-room/${foundMember.id}`, params: { name: foundMember.name } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      <UniversalBackground />
      <GlassHeader scrollY={scrollY} />

      <Animated.ScrollView 
        onScroll={scrollHandler} scrollEventThrottle={16} entering={FadeInDown.duration(800)}
        showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.pageTitle, { color: theme.text }]}>Messages</Text>
        
        {/* --- MAIN SEARCH BAR (For existing chats) --- */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputWrapper, { backgroundColor: theme.surface }]}>
            <Search size={20} color={theme.icon} style={{ marginRight: 10 }} />
            <TextInput 
              placeholder="Search messages..." 
              placeholderTextColor={theme.icon} 
              style={[styles.searchInput, { color: theme.text }]} 
              underlineColorAndroid="transparent"
            />
          </View>
          {/* --- NEW CHAT DRAWER TRIGGER --- */}
          <TouchableOpacity 
            style={[styles.newChatBtn, { backgroundColor: theme.primary }]} 
            activeOpacity={0.8}
            onPress={() => setIsDrawerOpen(true)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* --- EXISTING CHATS --- */}
        {DUMMY_CHATS.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            style={[styles.chatRow, { borderBottomColor: theme.icon + '20' }]}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: `/chat-room/${chat.id}`, params: { name: chat.name } })}
          >
            <View style={[styles.avatar, { backgroundColor: theme.primary }]} />
            <View style={styles.chatInfo}>
              <Text style={[styles.chatName, { color: theme.text }]}>{chat.name}</Text>
              <Text style={[styles.chatPreview, { color: theme.icon, fontWeight: chat.unread > 0 ? 'bold' : 'normal' }]} numberOfLines={1}>
                {chat.preview}
              </Text>
            </View>
            <View style={styles.metaInfo}>
              <Text style={[styles.timeText, { color: chat.unread > 0 ? theme.primary : theme.icon }]}>{chat.time}</Text>
              {chat.unread > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.unreadText}>{chat.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {/* --- NEW CHAT DRAWER (BOTTOM MODAL) --- */}
      <Modal visible={isDrawerOpen} transparent animationType="slide">
        {/* FIXED: Switched Android to 'padding' and added vertical offset */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
          style={styles.modalContainer}
        >
          
          {/* Blur Backdrop (Click to close) */}
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setIsDrawerOpen(false)}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>

          {/* Drawer Content */}
          <View style={[styles.drawerContent, { backgroundColor: theme.background }]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.text }]}>Start Secure Chat</Text>
              <TouchableOpacity onPress={() => setIsDrawerOpen(false)} style={styles.closeBtn}>
                <X size={20} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.drawerSubtitle, { color: theme.icon }]}>
              Enter the 8-digit Member ID to verify and connect.
            </Text>

            {/* Prefix & Input Layout */}
            <View style={[styles.idInputContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.idPrefix, { color: theme.primary }]}>MH</Text>
              <TextInput 
                style={[styles.idTextInput, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="00000000"
                placeholderTextColor={theme.icon}
                keyboardType="number-pad"
                maxLength={8}
                value={memberDigits}
                onChangeText={(text) => setMemberDigits(text.replace(/[^0-9]/g, ''))} // Forces numbers only
                autoFocus
              />
            </View>

            {/* Found Member Profile Card */}
            {foundMember ? (
              <View style={[styles.verifiedCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' }]}>
                <View style={styles.verifiedLeft}>
                  <View style={[styles.avatarSmall, { backgroundColor: theme.primary }]} />
                  <View>
                    <Text style={[styles.verifiedName, { color: theme.text }]}>{foundMember.name}</Text>
                    <View style={styles.badgeRow}>
                      <ShieldCheck size={12} color="#10B981" />
                      <Text style={[styles.verifiedId, { color: '#10B981' }]}>{foundMember.id}</Text>
                    </View>
                  </View>
                </View>
                <UserCheck size={20} color="#10B981" />
              </View>
            ) : (
              <View style={styles.placeholderCard}>
                <Text style={{ color: theme.icon, fontSize: 13 }}>Waiting for 8 digits...</Text>
              </View>
            )}

            {/* Start Chat Action */}
            <TouchableOpacity 
              style={[styles.startBtn, { backgroundColor: foundMember ? theme.primary : theme.surface }]}
              activeOpacity={0.8}
              disabled={!foundMember}
              onPress={handleStartNewChat}
            >
              <Text style={[styles.startBtnText, { color: foundMember ? '#fff' : theme.icon }]}>
                Start Encrypted Chat
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 100, paddingBottom: 180 }, 
  pageTitle: { fontSize: 32, fontWeight: '900', marginBottom: 20 },
  
  // Top Area
  searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 20, height: 50, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, height: '100%', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any },
  newChatBtn: { width: 50, height: 50, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },

  // Chat List
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  chatInfo: { flex: 1, marginRight: 10 },
  chatName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  chatPreview: { fontSize: 13 },
  metaInfo: { alignItems: 'flex-end', gap: 6 },
  timeText: { fontSize: 12, fontWeight: '500' },
  unreadBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Modal Drawer Styles
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  drawerContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  drawerTitle: { fontSize: 22, fontWeight: '900' },
  closeBtn: { padding: 4 },
  drawerSubtitle: { fontSize: 14, marginBottom: 24 },
  
  // MH Input Form
  idInputContainer: { flexDirection: 'row', alignItems: 'center', height: 60, borderRadius: 20, paddingHorizontal: 20, marginBottom: 20, elevation: 2 },
  idPrefix: { fontSize: 24, fontWeight: '900', marginRight: 10, letterSpacing: 2 },
  idTextInput: { flex: 1, fontSize: 24, fontWeight: 'bold', letterSpacing: 4, height: '100%', padding: 0 },
  
  // Verified Member Result
  verifiedCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  verifiedLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  verifiedName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedId: { fontSize: 12, fontWeight: 'bold' },
  
  placeholderCard: { height: 78, justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(150,150,150,0.2)', borderStyle: 'dashed', marginBottom: 24 },

  // Action Button
  startBtn: { width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', elevation: 2 },
  startBtnText: { fontSize: 16, fontWeight: 'bold' }
});
