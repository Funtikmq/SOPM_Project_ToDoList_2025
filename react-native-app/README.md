# Todo List React Native (Expo)

Această aplicație React Native este o conversie completă a unui proiect React web într-o aplicație mobilă folosind Expo.

## Structura Proiectului

```
react-native-app/
├── App.js
├── app.json
├── package.json
├── babel.config.js
└── src/
    ├── components/
    │   ├── TaskItem.js
    │   └── TaskInput.js
    ├── screens/
    │   ├── HomeScreen.js
    │   ├── LoginScreen.js
    │   └── RegisterScreen.js
    ├── navigation/
    │   └── AppNavigator.js
    ├── services/
    │   └── firebase.js
    └── styles/
        └── global.js
```

## Instalare și Rulare

### Pasul 1: Instalează dependențele

```bash
cd react-native-app
npm install
```

### Pasul 2: Configurează Firebase

Deschide `src/services/firebase.js` și înlocuiește valorile din `firebaseConfig` cu datele tale din Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Pasul 3: Rulează aplicația

```bash
# Pornește Expo
npm start

# Sau specific pentru Android
npm run android

# Sau specific pentru iOS
npm run ios
```

## Funcționalități

✅ **Autentificare completă**
- Login cu email/parolă
- Înregistrare utilizatori noi
- Persistență autentificare cu AsyncStorage

✅ **Gestionare task-uri**
- Adăugare task-uri cu titlu și descriere
- Vizualizare listă task-uri în timp real
- Ștergere task-uri cu confirmare
- FlatList optimizat pentru performanță

✅ **Firebase Integration**
- Firebase Authentication
- Cloud Firestore pentru stocarea task-urilor
- Actualizări în timp real cu onSnapshot

✅ **Navigare**
- React Navigation cu Native Stack
- Navigare automată bazată pe starea autentificării
- Tranziții native pentru iOS și Android

✅ **UI/UX Native**
- Componente React Native pure (View, Text, TouchableOpacity, etc.)
- StyleSheet pentru stilizare
- SafeAreaView pentru compatibilitate iOS
- KeyboardAvoidingView pentru formulare
- Alerte native pentru confirmări

## Componente Principale

### TaskItem
Component pentru afișarea unui task individual cu buton de ștergere.

### TaskInput
Formular controlat pentru adăugarea de task-uri noi.

### HomeScreen
Ecran principal cu listă de task-uri, utilizează FlatList pentru randare eficientă.

### LoginScreen & RegisterScreen
Ecrane de autentificare cu validare și gestionare erori.

### AppNavigator
Configurarea navigării cu switch automat între ecrane autentificate/neautentificate.

## Diferențe față de React Web

- ❌ Fără HTML tags (div, span, button, etc.)
- ✅ Doar componente React Native (View, Text, TouchableOpacity, etc.)
- ❌ Fără CSS clasic
- ✅ StyleSheet.create() pentru stiluri
- ❌ Fără localStorage/sessionStorage
- ✅ AsyncStorage pentru persistență
- ❌ Fără react-router-dom
- ✅ @react-navigation/native pentru navigare

## Reguli Firebase Firestore (Recomandare)

Pentru a funcționa corect, configurează aceste reguli în Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Următorii Pași

- [ ] Adaugă funcționalitate de marcare task completat
- [ ] Implementează edit pentru task-uri existente
- [ ] Adaugă filtrare și sortare task-uri
- [ ] Implementează notificări push
- [ ] Adaugă sincronizare offline cu Firestore
- [ ] Implementează dark mode
- [ ] Adaugă animații pentru tranziții

## Suport

Pentru probleme sau întrebări, consultă:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
