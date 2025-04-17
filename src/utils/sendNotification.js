import { collection, addDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

const sendNotification = async (reciever, type, message, redirect) => {
  try {
    // Reference to the user's notifications collection
    const notificationsRef = collection(
      db,
      "notifications",
      reciever,
      "userNotifications"
    );
    const newDocRef = doc(notificationsRef); // auto-generates ID

    // Add a new notification with a unique ID
    const newNotification = {
      id: newDocRef.id,
      type,
      message,
      read: false,
      redirect,
      createdAt: serverTimestamp(),
    };

    await addDoc(notificationsRef, newNotification);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export default sendNotification;
