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
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSuccess(authentication);
    }
  }, [response]);

  const handleGoogleSuccess = async (authentication) => {
    try {
      // Here you would verify the token with your backend/Firebase
      global.testUser = { 
        uid: 'google-user', 
        email: 'google@example.com',
        provider: 'google'
      };
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Eroare', 'Autentificare Google eșuată.');
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
    Alert.alert(
      'Google Sign-In',
      'Pentru a activa autentificarea cu Google, trebuie să configurezi Firebase:\n\n1. Mergi la Firebase Console\n2. Authentication → Sign-in Method\n3. Activează Google\n4. Adaugă Client IDs în cod\n\nPentru demo, voi simula autentificarea.',
      [
        { text: 'Anulează', style: 'cancel' },
        { 
          text: 'Demo Login', 
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
              <View style={styles.logoCircle}>
                <Text style={styles.logoIcon}>✓</Text>
              </View>
              <Text style={styles.logoText}>Just Do It</Text>
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

            {/* Demo Info */}
            <View style={styles.demoInfo}>
              <Text style={styles.demoText}>
                💡 Demo: Orice email și parolă funcționează
              </Text>
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
    marginBottom: 52,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ff4dd2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#ff4dd2',
    shadowOpacity: 0.6,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  logoIcon: {
    fontSize: 44,
    color: '#0a0118',
    fontWeight: '900',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: 0.5,
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
