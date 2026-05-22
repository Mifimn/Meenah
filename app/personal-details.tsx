// app/personal-details.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Platform, StatusBar, KeyboardAvoidingView, Modal, Image
} from 'react-native';
import Animated, { FadeInDown, SlideInDown, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import UniversalBackground from '../components/UniversalBackground';
import GlassHeader from '../components/GlassHeader';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, CalendarDays, X, Crosshair, Check } from 'lucide-react-native';

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  // State for editable fields
  const [name, setName] = useState('Ashabi');
  const [email, setEmail] = useState('ashabi@meenah.com');
  const [phone, setPhone] = useState('+234 800 000 0000');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('February 14th');

  // Map Modal State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Standard Reusable Input Component
  const InputField = ({ icon: Icon, label, value, onChangeText, keyboardType = 'default' }: any) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.icon }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
        <Icon size={20} color={theme.primary} style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={theme.icon}
          underlineColorAndroid="transparent"
        />
      </View>
    </View>
  );

  // Custom Map Location Field
  const LocationField = () => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.icon }]}>Delivery Address</Text>
      <TouchableOpacity 
        style={[styles.inputWrapper, { backgroundColor: theme.surface }]}
        activeOpacity={0.7}
        onPress={() => setIsMapOpen(true)}
      >
        <MapPin size={20} color={theme.primary} style={styles.inputIcon} />
        <Text style={[styles.textInput, { color: address ? theme.text : theme.icon, flex: 1, marginTop: Platform.OS === 'ios' ? 0 : 2 }]}>
          {address || "Tap to set live location..."}
        </Text>
        <View style={[styles.mapBadge, { backgroundColor: 'rgba(255,105,180,0.1)' }]}>
          <Text style={[styles.mapBadgeText, { color: theme.primary }]}>Map</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Simulate GPS Location Fetch
  const handleAutoLocate = () => {
    setIsLocating(true);
    setTimeout(() => {
      setAddress('Offa Central Area, Kwara State');
      setIsLocating(false);
      setIsMapOpen(false);
    }, 1500);
  };

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
          {/* Top Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
              <ArrowLeft size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Personal Details</Text>
          </View>

          {/* Profile Picture Edit */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarLarge, { backgroundColor: theme.primary }]} />
            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: theme.surface }]} activeOpacity={0.8}>
              <Camera size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <InputField icon={User} label="Full Name" value={name} onChangeText={setName} />
            <InputField icon={Mail} label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <InputField icon={Phone} label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <InputField icon={CalendarDays} label="Date of Birth" value={dob} onChangeText={setDob} />
            
            {/* New Live Location Picker */}
            <LocationField />
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* WhatsApp-Style Map Modal */}
      <Modal visible={isMapOpen} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsMapOpen(false)}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>

          <View style={[styles.drawerContent, { backgroundColor: theme.background }]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.text }]}>Pin Location</Text>
              <TouchableOpacity onPress={() => setIsMapOpen(false)} style={styles.closeBtn}>
                <X size={20} color={theme.icon} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.drawerSubtitle, { color: theme.icon }]}>Drag the map to set your exact delivery spot.</Text>

            {/* Simulated Map View */}
            <View style={styles.mapPlaceholder}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800' }} 
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.mapOverlay} />
              
              {/* Center Pin */}
              <View style={styles.centerPinContainer}>
                <View style={styles.pinBubble}>
                  <Text style={styles.pinText}>Delivery Here</Text>
                </View>
                <MapPin size={40} color="#FF69B4" fill="#fff" />
              </View>

              {/* GPS Target Button */}
              <TouchableOpacity style={styles.gpsBtn} activeOpacity={0.8}>
                <Crosshair size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Confirm Actions */}
            <TouchableOpacity 
              style={[styles.confirmLocationBtn, { backgroundColor: theme.primary }]} 
              activeOpacity={0.8}
              onPress={handleAutoLocate}
              disabled={isLocating}
            >
              {isLocating ? (
                <Text style={styles.confirmLocationText}>Locating GPS...</Text>
              ) : (
                <>
                  <Check size={20} color="#fff" />
                  <Text style={styles.confirmLocationText}>Confirm Location</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Save Button */}
      <Animated.View entering={SlideInDown.duration(600).delay(200)} style={styles.bottomBar}>
        <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={styles.saveContent}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: theme.primary }]} 
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: Platform.OS === 'ios' ? 80 : 100, paddingBottom: 150 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  pageTitle: { fontSize: 26, fontWeight: '900' },
  avatarSection: { alignItems: 'center', marginBottom: 32, position: 'relative' },
  avatarLarge: { width: 110, height: 110, borderRadius: 55, elevation: 10, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15 },
  cameraBtn: { position: 'absolute', bottom: 0, right: '35%', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  formContainer: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 55, borderRadius: 20, paddingHorizontal: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 16, fontWeight: '500', padding: 0, margin: 0 },
  mapBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  mapBadgeText: { fontSize: 12, fontWeight: 'bold' },

  // Map Modal Styles
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  drawerContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, elevation: 20 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  drawerTitle: { fontSize: 22, fontWeight: '900' },
  closeBtn: { padding: 4 },
  drawerSubtitle: { fontSize: 14, marginBottom: 20 },
  
  mapPlaceholder: { height: 250, borderRadius: 24, overflow: 'hidden', marginBottom: 20, backgroundColor: '#e5e5e5', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.1)' },
  centerPinContainer: { alignItems: 'center', marginTop: -20 },
  pinBubble: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 4 },
  pinText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  gpsBtn: { position: 'absolute', bottom: 16, right: 16, width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  
  confirmLocationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 18, borderRadius: 30, elevation: 2, gap: 8 },
  confirmLocationText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 100 : 85, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', elevation: 20 },
  saveContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  saveBtn: { width: '100%', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 5, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
