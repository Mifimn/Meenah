// app/personal-details.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Platform, StatusBar, KeyboardAvoidingView, Modal, Switch, ActivityIndicator, Alert
} from 'react-native';
import Animated, { FadeInDown, SlideInDown, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import UniversalBackground from '../components/UniversalBackground';
import GlassHeader from '../components/GlassHeader';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Camera, User, Mail, Phone, MapPin, 
  X, Crosshair, Check, Bell, MessageSquare, Lock
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';
import LiveMap from '../components/LiveMap';
import { useOfflineData } from '../hooks/useOfflineData';

export default function PersonalDetailsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [alerts, setAlerts] = useState({ chat: true, email: true });

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 8.4799, 
    longitude: 4.5418,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // 🚀 OFFLINE-FIRST HOOK
  const { data, loading: isLoading } = useOfflineData(`details_${user?.id}`, async () => {
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('full_name, email, phone, address').eq('id', user.id).single();
    return data;
  });

  // Automatically populate the input fields when offline data loads
  useEffect(() => {
    if (data) {
      setName(data.full_name || '');
      setEmail(data.email || user?.email || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
    }
  }, [data]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: name, address: address }).eq('id', user.id);
    setIsSaving(false);
    if (error) Alert.alert('Error', 'Could not update profile details.');
    else router.back();
  };

  const locateMe = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'Allow location access to pin your address.'); return; }
    let location = await Location.getCurrentPositionAsync({});
    setMapRegion({ ...mapRegion, latitude: location.coords.latitude, longitude: location.coords.longitude });
  };

  const confirmLocation = async () => {
    setIsLocating(true);
    try {
      let geocode = await Location.reverseGeocodeAsync({ latitude: mapRegion.latitude, longitude: mapRegion.longitude });
      if (geocode.length > 0) {
        const place = geocode[0];
        const fullAddress = [place.street || place.name, place.city || place.subregion || place.region].filter(Boolean).join(', ');
        setAddress(fullAddress || 'Custom Location Pinned');
      } else { setAddress('Custom Location Pinned'); }
    } catch (error) { setAddress('Custom Location Pinned'); }
    setIsLocating(false); setIsMapOpen(false);
  };

  const fields = [name, email, phone, address];
  const filledCount = fields.filter(field => field?.trim().length > 0).length;
  const profileProgress = Math.round((filledCount / fields.length) * 100);

  const InputField = ({ icon: Icon, label, value, onChangeText, keyboardType = 'default', editable = true }: any) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        <Text style={[styles.inputLabel, { color: theme.icon }]}>{label}</Text>
        {!editable && <Lock size={12} color={theme.icon} style={{ marginLeft: 4 }} />}
      </View>
      <View style={[styles.inputWrapper, { backgroundColor: editable ? theme.surface : theme.background, opacity: editable ? 1 : 0.7 }]}>
        <Icon size={20} color={editable ? theme.primary : theme.icon} style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, { color: editable ? theme.text : theme.icon }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholderTextColor={theme.icon} underlineColorAndroid="transparent" editable={editable}
        />
      </View>
    </View>
  );

  if (isLoading) {
    return <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <UniversalBackground />
      <GlassHeader scrollY={scrollY} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.ScrollView 
          onScroll={scrollHandler} scrollEventThrottle={16} entering={FadeInDown.duration(800)}
          showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
              <ArrowLeft size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Settings</Text>
          </View>

          <View style={styles.avatarSection}>
            <View style={[styles.avatarLarge, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
               <Text style={{color: '#fff', fontSize: 36, fontWeight: 'bold'}}>{name.charAt(0) || 'M'}</Text>
            </View>
            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: theme.surface }]} activeOpacity={0.8}>
              <Camera size={20} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: theme.text }]}>Profile Strength: {profileProgress}%</Text>
              <View style={[styles.progressBarBackground, { backgroundColor: theme.surface }]}>
                <View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: `${profileProgress}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.sectionDivider}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Info</Text>
          </View>

          <View style={styles.formContainer}>
            <InputField icon={User} label="Full Name" value={name} onChangeText={setName} />
            <InputField icon={Mail} label="Email Address" value={email} onChangeText={setEmail} editable={false} />
            <InputField icon={Phone} label="Phone Number" value={phone} onChangeText={setPhone} editable={false} />
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.icon }]}>Delivery Address</Text>
              <TouchableOpacity style={[styles.inputWrapper, { backgroundColor: theme.surface }]} activeOpacity={0.7} onPress={() => setIsMapOpen(true)}>
                <MapPin size={20} color={theme.primary} style={styles.inputIcon} />
                <Text style={[styles.textInput, { color: address ? theme.text : theme.icon, flex: 1, marginTop: Platform.OS === 'ios' ? 0 : 2 }]}>
                  {address || "Tap to set live location..."}
                </Text>
                <View style={[styles.mapBadge, { backgroundColor: 'rgba(255,105,180,0.1)' }]}>
                  <Text style={[styles.mapBadgeText, { color: theme.primary }]}>Map</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionDivider}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
          </View>

          <View style={[styles.toggleCard, { backgroundColor: theme.surface }]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <MessageSquare size={20} color={theme.primary} />
                <Text style={[styles.toggleText, { color: theme.text }]}>Chat Notifications</Text>
              </View>
              <Switch value={alerts.chat} onValueChange={(val) => setAlerts({ ...alerts, chat: val })} trackColor={{ false: theme.icon, true: `${theme.primary}50` }} thumbColor={alerts.chat ? theme.primary : '#f4f3f4'} />
            </View>
            <View style={[styles.toggleDivider, { backgroundColor: theme.background }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Bell size={20} color={theme.primary} />
                <Text style={[styles.toggleText, { color: theme.text }]}>Order Push Alerts</Text>
              </View>
              <Switch value={alerts.email} onValueChange={(val) => setAlerts({ ...alerts, email: val })} trackColor={{ false: theme.icon, true: `${theme.primary}50` }} thumbColor={alerts.email ? theme.primary : '#f4f3f4'} />
            </View>
          </View>

        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isMapOpen} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsMapOpen(false)}><BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /></TouchableOpacity>
          <View style={[styles.drawerContent, { backgroundColor: theme.background }]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.text }]}>Pin Location</Text>
              <TouchableOpacity onPress={() => setIsMapOpen(false)} style={styles.closeBtn}><X size={20} color={theme.icon} /></TouchableOpacity>
            </View>
            <Text style={[styles.drawerSubtitle, { color: theme.icon }]}>Drag the map to set your exact delivery spot.</Text>

            <View style={styles.mapPlaceholder}>
              <LiveMap region={mapRegion} onRegionChangeComplete={(region: any) => setMapRegion(region)} />
              <View style={styles.centerPinContainer} pointerEvents="none">
                <View style={styles.pinBubble}><Text style={styles.pinText}>Delivery Here</Text></View>
                <MapPin size={40} color="#FF69B4" fill="#fff" />
              </View>
              <TouchableOpacity style={styles.gpsBtn} activeOpacity={0.8} onPress={locateMe}><Crosshair size={20} color="#333" /></TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.confirmLocationBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8} onPress={confirmLocation} disabled={isLocating}>
              {isLocating ? <Text style={styles.confirmLocationText}>Locating Address...</Text> : <><Check size={20} color="#fff" /><Text style={styles.confirmLocationText}>Confirm Location</Text></>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Animated.View entering={SlideInDown.duration(600).delay(200)} style={styles.bottomBar}>
        <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={styles.saveContent}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8} onPress={handleSaveProfile} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scrollContent: { padding: 24, paddingTop: Platform.OS === 'ios' ? 80 : 100, paddingBottom: 150 }, headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 }, backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 }, pageTitle: { fontSize: 26, fontWeight: '900' }, avatarSection: { alignItems: 'center', marginBottom: 20, position: 'relative' }, avatarLarge: { width: 110, height: 110, borderRadius: 55, elevation: 10, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15 }, cameraBtn: { position: 'absolute', top: 70, right: '32%', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 }, progressContainer: { width: '100%', alignItems: 'center', marginTop: 24 }, progressText: { fontSize: 13, fontWeight: 'bold', marginBottom: 8 }, progressBarBackground: { width: '80%', height: 8, borderRadius: 4, overflow: 'hidden' }, progressBarFill: { height: '100%', borderRadius: 4 }, sectionDivider: { marginTop: 24, marginBottom: 16 }, sectionTitle: { fontSize: 18, fontWeight: 'bold' }, formContainer: { gap: 16 }, inputGroup: { gap: 8 }, labelRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 }, inputLabel: { fontSize: 13, fontWeight: '600' }, inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 55, borderRadius: 20, paddingHorizontal: 16, elevation: 2 }, inputIcon: { marginRight: 12 }, textInput: { flex: 1, fontSize: 16, fontWeight: '500', padding: 0, margin: 0 }, mapBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }, mapBadgeText: { fontSize: 12, fontWeight: 'bold' }, toggleCard: { borderRadius: 24, padding: 8, elevation: 2 }, toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }, toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 }, toggleText: { fontSize: 15, fontWeight: '600' }, toggleDivider: { height: 1, marginHorizontal: 16 }, modalContainer: { flex: 1, justifyContent: 'flex-end' }, drawerContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, elevation: 20 }, drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }, drawerTitle: { fontSize: 22, fontWeight: '900' }, closeBtn: { padding: 4 }, drawerSubtitle: { fontSize: 14, marginBottom: 20 }, mapPlaceholder: { height: 300, borderRadius: 24, overflow: 'hidden', marginBottom: 20, backgroundColor: '#e5e5e5', position: 'relative', justifyContent: 'center', alignItems: 'center' }, centerPinContainer: { alignItems: 'center', marginTop: -40, position: 'absolute' }, pinBubble: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 4 }, pinText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }, gpsBtn: { position: 'absolute', bottom: 16, right: 16, width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 5 }, confirmLocationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 18, borderRadius: 30, elevation: 2, gap: 8 }, confirmLocationText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }, bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 100 : 85, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', elevation: 20 }, saveContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 20 : 0 }, saveBtn: { width: '100%', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 5 }, saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
