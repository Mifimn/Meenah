// app/auth.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView, Modal
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import UniversalBackground from '../components/UniversalBackground';
import { Mail, Lock, User, Phone, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function AuthScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Form State
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  // Sign In Logic
  async function signInWithEmail() {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields.');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
    else router.replace('/'); 
    setLoading(false);
  }

  // Sign Up Logic
  async function signUpWithEmail() {
    if (!name || !phone || !email || !password || !confirmPassword) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match!');
    }

    setLoading(true);
    
    // Pass name and phone into Supabase's user_metadata securely
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
        }
      }
    });

    if (error) {
      Alert.alert('Registration Error', error.message);
    } else {
      // Generate a random 8-digit Member ID for the UI
      const newMemberId = 'MH' + Math.floor(10000000 + Math.random() * 90000000).toString();
      setGeneratedId(newMemberId);
      setShowSuccessModal(true);
    }
    setLoading(false);
  }

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/'); // Send them into the app
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <UniversalBackground />
      
      {/* Top Navigation Back Button */}
      <View style={[styles.topNav, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>
              {isLogin ? 'Enter your details to sign in' : 'Join the Meenah network today'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            
            {/* Conditional Sign-Up Fields */}
            {!isLogin && (
              <>
                <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                  <User size={20} color={theme.icon} style={styles.icon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="Full Name (e.g. Ashabi)"
                    placeholderTextColor={theme.icon}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                  <Phone size={20} color={theme.icon} style={styles.icon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder="Phone Number"
                    placeholderTextColor={theme.icon}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            {/* Email Input */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
              <Mail size={20} color={theme.icon} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="Email Address"
                placeholderTextColor={theme.icon}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
              <Lock size={20} color={theme.icon} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="Password"
                placeholderTextColor={theme.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Conditional Confirm Password Field */}
            {!isLogin && (
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
                <Lock size={20} color={theme.icon} style={styles.icon} />
                <TextInput
                  style={[styles.input, { color: theme.text }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.icon}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity 
              style={[styles.mainBtn, { backgroundColor: theme.primary }]} 
              onPress={isLogin ? signInWithEmail : signUpWithEmail}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
              )}
            </TouchableOpacity>

            {/* Toggle View Button */}
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
              <Text style={[styles.toggleText, { color: theme.text }]}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- SUCCESS MODAL --- */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          
          <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
            <View style={styles.iconRing}>
              <CheckCircle size={40} color="#10B981" />
            </View>
            
            <Text style={[styles.modalTitle, { color: theme.text }]}>Account Created!</Text>
            <Text style={[styles.modalSubtitle, { color: theme.icon }]}>
              Welcome to the network, {name || 'Member'}.
            </Text>
            
            <View style={[styles.idBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.idLabel, { color: theme.icon }]}>Your Official Member ID</Text>
              <Text style={[styles.idValue, { color: theme.primary }]}>{generatedId}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.continueBtn, { backgroundColor: theme.primary }]} 
              activeOpacity={0.8}
              onPress={handleModalClose}
            >
              <Text style={styles.continueBtnText}>Enter Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { paddingHorizontal: 24, zIndex: 10, marginBottom: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'center' },
  
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 16 },

  formContainer: { gap: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 60, borderRadius: 16, paddingHorizontal: 16, elevation: 2 },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },

  mainBtn: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 5 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  toggleBtn: { alignItems: 'center', marginTop: 20 },
  toggleText: { fontSize: 15 },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  iconRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  modalSubtitle: { fontSize: 15, textAlign: 'center', marginBottom: 30 },
  idBox: { width: '100%', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: 'rgba(150,150,150,0.1)' },
  idLabel: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  idValue: { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  continueBtn: { width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center', elevation: 5 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
