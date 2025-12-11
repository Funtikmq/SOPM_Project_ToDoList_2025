# Ghid Configurare Firebase - Todo List React Native

## Pasul 1: Creează un proiect Firebase

1. Deschide [Firebase Console](https://console.firebase.google.com/)
2. Apasă **"Create Project"** (Crează Proiect)
3. Introdu un nume pentru proiect (ex: "todo-list-app")
4. Apasă **"Create"**
5. Abia vai primi o pagină cu opțiuni de inițializare

---

## Pasul 2: Obține Credențialele Firebase

1. În Firebase Console, apasă pe icoană **"⚙️ Settings"** (Setări) din stânga sus
2. Selectează **"Project settings"** (Setări Proiect)
3. Mergi la tab-ul **"General"**
4. Scroll în jos până vezi secțiunea **"Your apps"** (Aplicațiile tale)
5. Apasă pe **"</>Web"** (aplicație web)
6. Completează numele aplicației: **"Todo List App"**
7. Apasă **"Register app"** (Înregistrează aplicația)
8. Vei vedea codul de configurare - **COPIE aceasta!**

Vei vedea ceva similar cu asta:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDjZXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "todo-list-app-xxxxx.firebaseapp.com",
  projectId: "todo-list-app-xxxxx",
  storageBucket: "todo-list-app-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcd"
};
```

---

## Pasul 3: Activează Authentication (Autentificare)

1. În Firebase Console, mergi la **"Build"** din stânga
2. Selectează **"Authentication"**
3. Apasă tab-ul **"Sign-in method"** (Metoda de autentificare)
4. Apasă **"Email/Password"**
5. Activează toggle-ul pentru **"Email/Password"**
6. Apasă **"Save"**

Acum utilizatorii pot să se înregistreze cu email și parolă.

---

## Pasul 4: Activează Firestore Database

1. În Firebase Console, mergi la **"Build"** din stânga
2. Selectează **"Firestore Database"**
3. Apasă **"Create Database"**
4. Selectează locația: **"eur3 (Europe)"** (pentru România)
5. Pentru reguli de securitate, selectează **"Start in test mode"** (doar pentru testare!)
6. Apasă **"Create"**

---

## Pasul 5: Configurează Reguli Firestore (Siguranta)

1. După ce ai creat Firestore, mergi la tab-ul **"Rules"**
2. Șterge regulile default și înlocuiește cu:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite fiecărui utilizator să citească și să scrie doar în folderul său
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Apasă **"Publish"**

---

## Pasul 6: Înlocuiește Credențialele în Aplicație

1. Deschide fișierul: `src/services/firebase.js` din proiect
2. Înlocuiește complet conținutul cu:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Înlocuiește cu datele tale din Firebase Console
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

// Inițializare Firebase
const app = initializeApp(firebaseConfig);

// Inițializare Authentication
const auth = getAuth(app);

// Inițializare Firestore
const db = getFirestore(app);

export { auth, db };
```

3. Exemplu complet (cu valori reale):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDjZXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "todo-list-app-xxxxx.firebaseapp.com",
  projectId: "todo-list-app-xxxxx",
  storageBucket: "todo-list-app-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcd"
};
```

---

## Pasul 7: Restarteaza Aplicația

1. În terminal, apasă `Ctrl+C` pentru a opri serverul
2. Rulează comanda:
```bash
npx expo start --tunnel --clear
```
3. Scanează QR code-ul cu Expo Go pe telefon

---

## Ce se întâmplă după setup?

✅ Utilizatorii pot să se **înregistreze** cu email și parolă
✅ Utilizatorii pot să se **autentifice** (login)
✅ Fiecare utilizator are propriul **folder de task-uri** în Firestore
✅ Task-urile sunt **salvate automat** în cloud
✅ Task-urile se **sincronizează în timp real**

---

## Teste

### Test 1: Înregistrare
1. Deschide aplicația în Expo Go
2. Apasă **"Nu ai cont? Înregistrează-te"**
3. Introdu:
   - Email: `test@example.com`
   - Parolă: `123456` (minim 6 caractere)
   - Confirmă parola: `123456`
4. Apasă **"Register"**

### Test 2: Login
1. Deschide aplicația
2. Apasă **"Autentificare"**
3. Introdu:
   - Email: `test@example.com`
   - Parolă: `123456`
4. Apasă **"Login"**
5. Ar trebui să vezi ecranul **"My Tasks"**

### Test 3: Adaugă un Task
1. După login, apasă pe **câmpul de titlu**
2. Scrie: `Cumpara lapte`
3. (Opțional) Adaugă descriere
4. Apasă **"Add Task"**
5. Task-ul ar trebui să apară în listă

### Test 4: Șterge un Task
1. Apasă **"✕"** roșu din dreapta task-ului
2. Confirmă ștergerea
3. Task-ul dispare

---

## Depanare

### Eroare: "Cannot find module 'firebase/app'"
- Rulează: `npm install`

### Eroare: "Auth function not available"
- Verifică dacă ai Firebase config cu valori reale (nu placeholder)

### Task-urile nu se salvează
- Verifică în Firebase Console dacă Firestore Database este creat
- Verifică regulile Firestore (Rules tab)

### App se strică după configurare
- Apasă `r` în terminal pentru a recarica aplicația
- Apasă `Ctrl+C` și repornește cu `npx expo start --tunnel`

---

## Următoarele Funcționalități (opționale)

- [ ] Marcare task ca "completat"
- [ ] Edit task existent
- [ ] Filtrare task-uri (toate, completate, necompletate)
- [ ] Sortare task-uri
- [ ] Dark mode
- [ ] Notificări push
- [ ] Backup/Export date
