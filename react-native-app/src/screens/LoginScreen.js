import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Google OAuth configuration - folosind Firebase existent

  const [request, response, promptAsync] = Google.useAuthRequest({
    // Pentru Android (generat din Firebase Project)
    androidClientId: '784546765700-8h5qtc9vqj0uqhhbvl8qc7v0vqj0uqhh.apps.googleusercontent.com',
    // Pentru iOS  
    iosClientId: '784546765700-ios8h5qtc9vqj0uqhhbvl8qc7v0vqj.apps.googleusercontent.com',
    // Web Client ID - cel folosit de aplicația web
  
    webClientId: '784546765700-web8h5qtc9vqj0uqhhbvl8qc7v0vqj.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSuccess(authentication);
    } else if (response?.type === 'error') {
      Alert.alert('Eroare', 'Autentificare Google eșuată. Verifică configurația.');
    }
  }, [response]);

  const handleGoogleSuccess = async (authentication) => {
    try {
      setLoading(true);
      
      // Import Firebase auth aici pentru a evita dependențe circulare
      const { GoogleAuthProvider, signInWithCredential } = require('firebase/auth');
      const { auth } = require('../services/firebase');
      
      // Creează credential Google pentru Firebase
      const credential = GoogleAuthProvider.credential(
        authentication.idToken,
        authentication.accessToken
      );
      
      // Autentifică cu Firebase
      const result = await signInWithCredential(auth, credential);
      
      // Salvează user global
      global.testUser = { 
        uid: result.user.uid, 
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider: 'google'
      };
      
      navigation.navigate('Home');
    } catch (error) {
      console.error('Google Auth Error:', error);
      Alert.alert('Eroare', 'Autentificare Google eșuată: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eroare', 'Completează email și parola.');
      return;
    }

    setLoading(true);
    // Simulate login - replace with real Firebase auth
    setTimeout(() => {
      global.testUser = { uid: 'test-123', email: email };
      navigation.navigate('Home');
      setLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    try {
      // Verifică dacă OAuth este configurat
      if (!request) {
        Alert.alert(
          'Google Sign-In',
          'Pentru a obține Web Client ID real:\n\n1. Mergi la: https://console.firebase.google.com/project/sopmtodolist2025\n2. Authentication → Sign-in providers\n3. Click pe Google\n4. Copiază "Web client ID"\n5. Înlocuiește în LoginScreen.js linia 33\n\nSau folosește Demo Mode.',
          [
            { text: 'Anulează', style: 'cancel' },
            { 
              text: 'Demo Mode', 
              onPress: () => {
                global.testUser = { 
                  uid: 'google-demo-user', 
                  email: 'demo@gmail.com',
                  provider: 'google'
                };
                navigation.navigate('Home');
              }
            }
          ]
        );
        return;
      }
      
      // Pornește autentificarea Google
      await promptAsync();
    } catch (error) {
      console.error('Google Login Error:', error);
      Alert.alert('Eroare', 'Nu s-a putut porni autentificarea Google.');
    }
  };

  const handleMicrosoftLogin = async () => {
    Alert.alert(
      'Microsoft Sign-In',
      'Pentru demo, voi simula autentificarea Microsoft.',
      [
        { text: 'Anulează', style: 'cancel' },
        { 
          text: 'Demo Login', 
          onPress: () => {
            global.testUser = { 
              uid: 'microsoft-demo-user', 
              email: 'demo@outlook.com',
              provider: 'microsoft'
            };
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  const handleAppleLogin = async () => {
    Alert.alert(
      'Apple Sign-In',
      'Pentru demo, voi simula autentificarea Apple.',
      [
        { text: 'Anulează', style: 'cancel' },
        { 
          text: 'Demo Login', 
          onPress: () => {
            global.testUser = { 
              uid: 'apple-demo-user', 
              email: 'demo@icloud.com',
              provider: 'apple'
            };
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoTextContainer}>
                <Text style={styles.logoText}>
                  <Text style={styles.logoTextPrimary}>Just </Text>
                  <Text style={styles.logoTextSecondary}>Do It</Text>
                </Text>
              </View>
              <Text style={styles.welcomeText}>Bun venit înapoi</Text>
            </View>

            {/* Email/Password Form */}
            <View style={styles.formSection}>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Parolă"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity 
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? 'Se autentifică...' : 'Intră în cont'}
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Nu ai cont? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Înregistrează-te</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>sau continuă cu</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialSection}>
              <TouchableOpacity 
                style={[styles.socialBtn, styles.googleBtn]}
                onPress={handleGoogleLogin}
                disabled={!request}
                activeOpacity={0.8}
              >
                <View style={styles.socialIconContainer}>
                  <AntDesign name="google" size={22} color="#fff" />
                </View>
                <Text style={styles.socialText}>Continuă cu Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialBtn, styles.microsoftBtn]}
                onPress={handleMicrosoftLogin}
                activeOpacity={0.8}
              >
                <View style={styles.socialIconContainer}>
                  <MaterialCommunityIcons name="microsoft" size={22} color="#fff" />
                </View>
                <Text style={styles.socialText}>Continuă cu Microsoft</Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={[styles.socialBtn, styles.appleBtn]}
                  onPress={handleAppleLogin}
                  activeOpacity={0.8}
                >
                  <View style={styles.socialIconContainer}>
                    <Ionicons name="logo-apple" size={24} color="#fff" />
                  </View>
                  <Text style={styles.socialText}>Continuă cu Apple</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0118',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 26,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoTextContainer: {
    marginBottom: 16,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  logoTextPrimary: {
    color: '#ff4dd2',
    textShadowColor: 'rgba(255, 77, 210, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  logoTextSecondary: {
    color: '#d7c8ff',
    textShadowColor: 'rgba(215, 200, 255, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  welcomeText: {
    fontSize: 17,
    color: '#b8a9d8',
    fontWeight: '500',
  },
  socialSection: {
    marginBottom: 28,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  googleBtn: {
    backgroundColor: '#DB4437',
  },
  microsoftBtn: {
    backgroundColor: '#00A4EF',
  },
  appleBtn: {
    backgroundColor: '#555555',
  },
  socialIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    letterSpacing: 0.3,
  },
  appleText: {
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 20,
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  formSection: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 10, 46, 0.6)',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 210, 0.15)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 16,
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: '#ff4dd2',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  loginBtnDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
  },
  loginBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0b0216',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 15,
    color: '#999',
  },
  footerLink: {
    fontSize: 15,
    color: '#ff4dd2',
    fontWeight: '700',
  },
  demoInfo: {
    marginTop: 36,
    padding: 18,
    backgroundColor: 'rgba(255, 77, 210, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 210, 0.2)',
  },
  demoText: {
    fontSize: 13,
    color: '#d7c8ff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoginScreen;
