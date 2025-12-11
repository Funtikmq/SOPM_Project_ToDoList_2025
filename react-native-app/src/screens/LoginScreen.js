import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert 
} from 'react-native';

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
          <Text style={styles.title}>Todo List</Text>
          <Text style={styles.subtitle}>Autentificare</Text>

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
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  testInfo: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  testLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  testText: {
    fontSize: 12,
    color: '#856404',
    fontFamily: 'monospace',
  },
});

export default LoginScreen;
