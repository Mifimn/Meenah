// app/chat.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, StatusBar, TouchableOpacity, 
  TextInput, Platform, Modal, KeyboardAvoidingView, ActivityIndicator, Alert 
} from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import BottomNav from '../components/BottomNav';
import GlassHeader from '../components/GlassHeader';
import UniversalBackground from '../components/UniversalBackground';
import { useRouter, Redirect } from 'expo-router';
import { Search, Plus, X, UserCheck, ShieldCheck, MessageCircle } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useOfflineData } from '../hooks/useOfflineData';

export default function ChatScreen() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [memberDigits, setMemberDigits] = useState('');
  const [foundMember, setFoundMember] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // 🚀 OFFLINE-FIRST HOOK
  const { data: offlineConversations, loading: isLoadingChats } = useOfflineData(`chats_${user?.id}`, async () => {
    if (!user) return [];
    const { data: convos } = await supabase.from('conversations').select('*').or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`).order('created_at', { ascending: false });

    if (convos && convos.length > 0) {
      return await Promise.all(convos.map(async (c) => {
        const otherId = c.participant1_id === user.id ? c.participant2_id : c.participant1_id;
        const { data: profile } = await supabase.from('profiles').select('full_name, member_id').eq('id', otherId).single();
        return {
          id: c.id,
          name: profile?.full_name || 'Member',
          member_id: profile?.member_id,
          preview: 'Encrypted message', 
          time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }));
    }
    return [];
  });

  // Default to empty array if data isn't loaded yet
  const conversations = offlineConversations || [];

  useEffect(() => {
    async function searchUser() {
      if (memberDigits.length === 8) {
        setIsSearching(true);
        const fullId = `MH${memberDigits}`;
        const { data } = await supabase.from('profiles').select('id, full_name, member_id').eq('member_id', fullId).single();
        if (data && data.id !== user?.id) setFoundMember({ name: data.full_name, id: data.id, member_id: data.member_id });
        else setFoundMember(null);
        setIsSearching(false);
      } else {
        setFoundMember(null);
      }
    }
    searchUser();
  }, [memberDigits]);

  const handleStartNewChat = async () => {
    if (!foundMember || !user) return;
    const { data: existing } = await supabase.from('conversations').select('id').or(`and(participant1_id.eq.${user.id},participant2_id.eq.${foundMember.id}),and(participant1_id.eq.${foundMember.id},participant2_id.eq.${user.id})`).single();

    let conversationId = existing?.id;
    if (!conversationId) {
      const { data: newConvo, error } = await supabase.from('conversations').insert({ participant1_id: user.id, participant2_id: foundMember.id }).select('id').single();
      if (error) { Alert.alert('Error', 'Could not start conversation.'); return; }
      conversationId = newConvo.id;
    }

    setIsDrawerOpen(false); setMemberDigits(''); setFoundMember(null);
    router.push({ pathname: `/chat-room/${conversationId}`, params: { name: foundMember.name } });
  };

  if (!initialized) return null; 
  if (!user) return <Redirect href="/auth" />; 

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
        
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputWrapper, { backgroundColor: theme.surface }]}>
            <Search size={20} color={theme.icon} style={{ marginRight: 10 }} />
            <TextInput placeholder="Search active chats..." placeholderTextColor={theme.icon} style={[styles.searchInput, { color: theme.text }]} underlineColorAndroid="transparent" />
          </View>
          <TouchableOpacity style={[styles.newChatBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8} onPress={() => setIsDrawerOpen(true)}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {isLoadingChats ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconRing, { backgroundColor: theme.surface }]}><MessageCircle size={32} color={theme.icon} /></View>
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No messages yet</Text>
            <Text style={[styles.emptyStateText, { color: theme.icon }]}>Tap the + button above and enter an 8-digit Member ID to start a secure chat.</Text>
          </View>
        ) : (
          conversations.map((chat) => (
            <TouchableOpacity key={chat.id} style={[styles.chatRow, { borderBottomColor: theme.icon + '20' }]} activeOpacity={0.7} onPress={() => router.push({ pathname: `/chat-room/${chat.id}`, params: { name: chat.name } })}>
              <View style={[styles.avatar, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{chat.name.charAt(0)}</Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={[styles.chatName, { color: theme.text }]}>{chat.name}</Text>
                <Text style={[styles.chatPreview, { color: theme.icon }]} numberOfLines={1}><ShieldCheck size={12} color={theme.primary} /> {chat.preview}</Text>
              </View>
              <View style={styles.metaInfo}>
                <Text style={[styles.timeText, { color: theme.icon }]}>{chat.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Animated.ScrollView>

      <Modal visible={isDrawerOpen} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25} style={styles.modalContainer}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsDrawerOpen(false)}><BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /></TouchableOpacity>
          <View style={[styles.drawerContent, { backgroundColor: theme.background }]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.text }]}>Start Secure Chat</Text>
              <TouchableOpacity onPress={() => setIsDrawerOpen(false)} style={styles.closeBtn}><X size={20} color={theme.icon} /></TouchableOpacity>
            </View>
            <Text style={[styles.drawerSubtitle, { color: theme.icon }]}>Enter an 8-digit Member ID to verify and connect.</Text>
            <View style={[styles.idInputContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.idPrefix, { color: theme.primary }]}>MH</Text>
              <TextInput style={[styles.idTextInput, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]} placeholder="00000000" placeholderTextColor={theme.icon} keyboardType="number-pad" maxLength={8} value={memberDigits} onChangeText={(text) => setMemberDigits(text.replace(/[^0-9]/g, ''))} autoFocus />
            </View>
            {isSearching ? <ActivityIndicator color={theme.primary} style={{ marginBottom: 24 }} /> : foundMember ? (
              <View style={[styles.verifiedCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' }]}>
                <View style={styles.verifiedLeft}>
                  <View style={[styles.avatarSmall, { backgroundColor: theme.primary }]} />
                  <View>
                    <Text style={[styles.verifiedName, { color: theme.text }]}>{foundMember.name}</Text>
                    <View style={styles.badgeRow}><ShieldCheck size={12} color="#10B981" /><Text style={[styles.verifiedId, { color: '#10B981' }]}>{foundMember.member_id}</Text></View>
                  </View>
                </View>
                <UserCheck size={20} color="#10B981" />
              </View>
            ) : <View style={styles.placeholderCard}><Text style={{ color: theme.icon, fontSize: 13 }}>{memberDigits.length === 8 ? "Member not found." : "Waiting for 8 digits..."}</Text></View>}
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: foundMember ? theme.primary : theme.surface }]} activeOpacity={0.8} disabled={!foundMember} onPress={handleStartNewChat}>
              <Text style={[styles.startBtnText, { color: foundMember ? '#fff' : theme.icon }]}>Start Encrypted Chat</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scrollContent: { padding: 24, paddingTop: 100, paddingBottom: 180 }, pageTitle: { fontSize: 32, fontWeight: '900', marginBottom: 20 }, searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 30 }, searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 20, height: 50, elevation: 2 }, searchInput: { flex: 1, fontSize: 14, height: '100%', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any }, newChatBtn: { width: 50, height: 50, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 }, emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 }, emptyIconRing: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 2 }, emptyStateTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 }, emptyStateText: { fontSize: 14, textAlign: 'center', lineHeight: 22 }, chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 }, avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 }, chatInfo: { flex: 1, marginRight: 10 }, chatName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 }, chatPreview: { fontSize: 13 }, metaInfo: { alignItems: 'flex-end', gap: 6 }, timeText: { fontSize: 12, fontWeight: '500' }, modalContainer: { flex: 1, justifyContent: 'flex-end' }, drawerContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 }, drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, drawerTitle: { fontSize: 22, fontWeight: '900' }, closeBtn: { padding: 4 }, drawerSubtitle: { fontSize: 14, marginBottom: 24 }, idInputContainer: { flexDirection: 'row', alignItems: 'center', height: 60, borderRadius: 20, paddingHorizontal: 20, marginBottom: 20, elevation: 2 }, idPrefix: { fontSize: 24, fontWeight: '900', marginRight: 10, letterSpacing: 2 }, idTextInput: { flex: 1, fontSize: 24, fontWeight: 'bold', letterSpacing: 4, height: '100%', padding: 0 }, verifiedCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 24 }, verifiedLeft: { flexDirection: 'row', alignItems: 'center' }, avatarSmall: { width: 44, height: 44, borderRadius: 22, marginRight: 12 }, verifiedName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 }, badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 }, verifiedId: { fontSize: 12, fontWeight: 'bold' }, placeholderCard: { height: 78, justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(150,150,150,0.2)', borderStyle: 'dashed', marginBottom: 24 }, startBtn: { width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', elevation: 2 }, startBtnText: { fontSize: 16, fontWeight: 'bold' }
});
