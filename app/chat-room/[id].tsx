// app/chat-room/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, StatusBar, Image, Modal 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import UniversalBackground from '../../components/UniversalBackground';
import { ArrowLeft, Send, Paperclip, Lock, Gift, ShoppingCart, X, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { encryptMessage, decryptMessage } from '../../lib/crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DUMMY_WISHLIST = [
  { id: 'w1', name: 'Pink Velvet Cake', price: 12.00, image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80' },
  { id: 'w2', name: 'Strawberry Cookies', price: 8.50, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80' },
  { id: 'w3', name: 'Meenah Croissants', price: 6.00, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80' }
];

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 1. Fetch History & Subscribe to Live Updates
  useEffect(() => {
    if (!user || !id) return;
    fetchMessages();
    markAsSeen(); 

    const channel = supabase
      .channel('realtime-messages')
      // Listen for NEW messages in this specific chat
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, 
        (payload) => {
          const newMessage = payload.new;
          if (newMessage.sender_id === user.id) return;
          
          setMessages((prev) => {
            const updated = [...prev, {
              id: newMessage.id,
              type: 'text',
              text: decryptMessage(newMessage.ciphertext, id as string),
              sender: 'them',
              status: 'seen',
              time: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];
            AsyncStorage.setItem(`messages_${id}`, JSON.stringify(updated));
            return updated;
          });
          
          markAsSeen();
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        }
      )
      // 🔥 THE FIX: Listen for ALL updates, and filter them locally to prevent Supabase from dropping the event
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, 
        (payload) => {
          setMessages(prev => {
            // Check if this updated message actually belongs in our current list
            const messageExists = prev.some(m => m.id === payload.new.id);
            if (!messageExists) return prev; // If not, ignore it

            const updated = prev.map(m => m.id === payload.new.id ? { ...m, status: payload.new.status } : m);
            AsyncStorage.setItem(`messages_${id}`, JSON.stringify(updated)); 
            return updated;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, id]);

  const fetchMessages = async () => {
    try {
      const cached = await AsyncStorage.getItem(`messages_${id}`);
      if (cached) {
        setMessages(JSON.parse(cached));
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      }
    } catch (e) { console.log('Offline load failed'); }

    const { data } = await supabase.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true });
    if (data) {
      const freshMessages = data.map(msg => ({
        id: msg.id,
        type: 'text',
        text: decryptMessage(msg.ciphertext, id as string),
        sender: msg.sender_id === user?.id ? 'me' : 'them',
        status: msg.status,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(freshMessages);
      await AsyncStorage.setItem(`messages_${id}`, JSON.stringify(freshMessages)); 
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  };

  const markAsSeen = async () => {
    await supabase.from('messages').update({ status: 'seen' }).eq('conversation_id', id).neq('sender_id', user?.id).eq('status', 'sent');
  };

  const sendMessage = async () => {
    if (messageText.trim().length === 0 || !user || !id) return;
    
    const textToSend = messageText.trim();
    setMessageText(''); 
    
    const tempId = Date.now().toString();
    
    setMessages((prev) => {
      const updated = [...prev, {
        id: tempId,
        type: 'text',
        text: textToSend,
        sender: 'me',
        status: 'sent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      AsyncStorage.setItem(`messages_${id}`, JSON.stringify(updated)); 
      return updated;
    });
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const scrambled = encryptMessage(textToSend, id as string);

    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user.id,
      ciphertext: scrambled,
      status: 'sent'
    });
  };

  const sendWishlistItem = (product: any) => {
    setMessages((prev) => {
      const updated = [
        ...prev, 
        { id: Date.now().toString(), type: 'wishlist', product: product, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ];
      AsyncStorage.setItem(`messages_${id}`, JSON.stringify(updated));
      return updated;
    });
    setIsWishlistDrawerOpen(false); 
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender === 'me';
    
    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageMe : styles.messageThem]}>
        <View style={[
          styles.messageBubble, 
          { backgroundColor: isMe ? theme.primary : theme.surface }, 
          isMe ? styles.bubbleMe : styles.bubbleThem
        ]}>
          
          {item.type === 'text' && (
            <Text style={[styles.messageText, { color: isMe ? '#fff' : theme.text }]}>{item.text}</Text>
          )}

          {item.type === 'wishlist' && (
            <View style={styles.wishlistCardMessage}>
              <Text style={[styles.wishlistIntroText, { color: isMe ? 'rgba(255,255,255,0.9)' : theme.text }]}>
                {isMe ? "I'd love this from my Wishlist! 🎁" : "Check out my wishlist! 🎁"}
              </Text>
              
              <View style={[styles.embeddedProductCard, { backgroundColor: isMe ? 'rgba(255,255,255,0.15)' : theme.background }]}>
                <Image source={{ uri: item.product.image }} style={styles.embeddedProductImage} />
                <View style={styles.embeddedProductInfo}>
                  <Text style={[styles.embeddedProductName, { color: isMe ? '#fff' : theme.text }]} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={[styles.embeddedProductPrice, { color: isMe ? '#fff' : theme.primary }]}>
                    ${item.product.price.toFixed(2)}
                  </Text>
                </View>
              </View>

              {!isMe && (
                <TouchableOpacity style={[styles.giftBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8}>
                  <ShoppingCart size={14} color="#fff" />
                  <Text style={styles.giftBtnText}>Gift to {name}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 4 }}>
            <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.icon, alignSelf: 'auto' }]}>{item.time}</Text>
            {isMe && (
              item.status === 'seen' ? (
                // Double Circle Check (Overlapping)
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircle size={12} color="#fff" style={{ marginRight: -6, zIndex: 1 }} />
                  <CheckCircle size={12} color="#fff" />
                </View>
              ) : (
                // Single Circle Check
                <CheckCircle size={12} color="rgba(255,255,255,0.7)" />
              )
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <UniversalBackground />

      <View style={[styles.chatHeader, { paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10 }]}>
        <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileClickArea} 
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/user-profile/[id]', params: { id: id as string, name: name as string } })}
          >
            <View style={[styles.avatarSmall, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
               <Text style={{color: '#fff', fontWeight: 'bold'}}>{(name || 'S').charAt(0)}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerName, { color: theme.text }]} numberOfLines={1}>{name || "Secured Chat"}</Text>
              <Text style={[styles.headerStatus, { color: theme.primary }]}>E2E Encrypted</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 1, backgroundColor: theme.text, opacity: 0.05 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
      >
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.encryptionBanner, { backgroundColor: 'rgba(150,150,150,0.1)' }]}>
              <Lock size={12} color={theme.icon} style={{ marginRight: 6 }} />
              <Text style={[styles.encryptionText, { color: theme.icon }]}>Messages are end-to-end encrypted.</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={styles.inputRow}>
            
            <TouchableOpacity style={styles.attachBtn} onPress={() => setIsWishlistDrawerOpen(true)}>
              <Gift size={22} color={theme.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachBtn}>
              <Paperclip size={22} color={theme.icon} />
            </TouchableOpacity>
            
            <View style={[styles.textInputWrapper, { backgroundColor: theme.surface }]}>
              <TextInput 
                style={[styles.textInput, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="Type a message..."
                placeholderTextColor={theme.icon}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                underlineColorAndroid="transparent" 
              />
            </View>

            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: messageText.trim().length > 0 ? theme.primary : theme.surface }]}
              onPress={sendMessage}
              activeOpacity={0.8}
            >
              <Send size={18} color={messageText.trim().length > 0 ? '#fff' : theme.icon} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={isWishlistDrawerOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
          style={styles.modalContainer}
        >
          
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setIsWishlistDrawerOpen(false)}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>

          <View style={[styles.drawerContent, { backgroundColor: theme.background }]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.text }]}>Share from Wishlist</Text>
              <TouchableOpacity onPress={() => setIsWishlistDrawerOpen(false)} style={styles.closeBtn}>
                <X size={20} color={theme.icon} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.drawerSubtitle, { color: theme.icon }]}>
              Select an item to request it as a gift. It will be delivered to your address!
            </Text>

            <FlatList
              data={DUMMY_WISHLIST}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.wishlistItemRow, { backgroundColor: theme.surface }]}
                  activeOpacity={0.8}
                  onPress={() => sendWishlistItem(item)}
                >
                  <Image source={{ uri: item.image }} style={styles.wishlistRowImage} />
                  <View style={styles.wishlistRowInfo}>
                    <Text style={[styles.wishlistRowName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.wishlistRowPrice, { color: theme.primary }]}>${item.price.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.shareBtn, { backgroundColor: 'rgba(255,105,180,0.1)' }]}>
                    <Send size={16} color={theme.primary} />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, paddingBottom: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  profileClickArea: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  headerText: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: 'bold' },
  headerStatus: { fontSize: 11, fontWeight: '600' },
  messageListContent: { paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 110 : 120, paddingBottom: 20 },
  encryptionBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 12, marginBottom: 20, marginHorizontal: 20 },
  encryptionText: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
  messageWrapper: { marginBottom: 14, width: '100%' },
  messageMe: { alignItems: 'flex-end' },
  messageThem: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, elevation: 1 },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22, marginBottom: 4 },
  timeText: { fontSize: 10, alignSelf: 'flex-end', fontWeight: '500' },
  wishlistCardMessage: { minWidth: 200 },
  wishlistIntroText: { fontSize: 13, marginBottom: 8, fontWeight: '500' },
  embeddedProductCard: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 12, marginBottom: 8 },
  embeddedProductImage: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  embeddedProductInfo: { flex: 1 },
  embeddedProductName: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  embeddedProductPrice: { fontSize: 12, fontWeight: '900' },
  giftBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, gap: 6, marginTop: 4 },
  giftBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  inputContainer: { overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 15 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 34 : 26, gap: 8 },
  attachBtn: { width: 40, height: 46, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  textInputWrapper: { flex: 1, minHeight: 50, maxHeight: 120, borderRadius: 25, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 14 : 12, justifyContent: 'center' },
  textInput: { flex: 1, fontSize: 16, maxHeight: 90, padding: 0, margin: 0 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  drawerContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, elevation: 20, maxHeight: '60%' },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  drawerTitle: { fontSize: 22, fontWeight: '900' },
  closeBtn: { padding: 4 },
  drawerSubtitle: { fontSize: 14, marginBottom: 24 },
  wishlistItemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  wishlistRowImage: { width: 50, height: 50, borderRadius: 12, marginRight: 12 },
  wishlistRowInfo: { flex: 1, marginRight: 10 },
  wishlistRowName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  wishlistRowPrice: { fontSize: 14, fontWeight: '900' },
  shareBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }
});
