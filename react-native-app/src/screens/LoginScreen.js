import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eroare', 'Te rog completează email și parola.');
      return;
    }

    setLoading(true);
    try {
      // TEST: Orice email și parolă funcționează pentru testare
      if (email && password.length >= 6) {
        // Salvez user în mock state
        global.testUser = { uid: 'test-user-123', email };
        // Navigheaza la Home
        setTimeout(() => {
          navigation.navigate('Home');
          setLoading(false);
        }, 300);
      } else {
        Alert.alert('Eroare', 'Parolă trebuie să aibă minim 6 caractere.');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Eroare', error.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoKick}>JUST</Text>
            <Text style={styles.logoDoIt}>DO IT</Text>
          </View>
          <Text style={styles.subtitle}>Autentificare în cont</Text>

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

          <TextInput
            style={styles.input}
            placeholder="Parolă"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Se autentifică...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Nu ai cont? Înregistrează-te
            </Text>
          </TouchableOpacity>

          <View style={styles.testInfo}>
            <Text style={styles.testLabel}>🧪 MODE TESTARE</Text>
            <Text style={styles.testText}>
              Email: test@example.com{'\n'}
              Parolă: 123456
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // dark slate background for a bold intro
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoKick: {
    fontSize: 44,
    letterSpacing: 2,
    color: '#ffffff',
    fontWeight: '800',
  },
  logoDoIt: {
    fontSize: 44,
    letterSpacing: 2,
    color: '#ff00ff', // magenta accent
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#0b1220',
    color: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  button: {
    backgroundColor: '#ff00ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#ff00ff',
    fontSize: 14,
  },
  testInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  testLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 8,
  },
  testText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
});

export default LoginScreen;
