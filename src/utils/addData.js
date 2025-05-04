// utils/addData.js

import { auth, db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { users, tailors } from './dummyData';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const addDataToFirestore = async () => {
  try {
    // Adding Users to Firebase Authentication
    for (const user of users) {
      try {
        // Create Auth user if it doesn't already exist
        await createUserWithEmailAndPassword(auth, user.email, 'Test@1234');
        console.log(`✅ Auth account created for ${user.email}`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`ℹ️ Auth user already exists: ${user.email}`);
        } else {
          console.error(`❌ Error creating auth user ${user.email}:`, error);
        }
      }

      // Add user to Firestore
      await setDoc(doc(db, 'users', user.uid), user);
    }

    // Adding Tailors to Firestore
    for (const tailor of tailors) {
      await setDoc(doc(db, 'tailors', tailor.ownerId), tailor);
    }

    console.log("✅ Data successfully added to Firestore!");
  } catch (error) {
    console.error("❌ Error adding data:", error);
  }
};
