import React from "react";
import axios from "axios";
import { db } from "../utils/firebaseConfig";
import { doc, addDoc, collection, getDoc, updateDoc } from "firebase/firestore";

const UpdateTailorRating = async ({ message, stars, userId, tailorId }) => {
  let statusMessage = "";

  try {
    // Step 1: Store the review in "tailor_reviews"
    const reviewData = {
      message,
      stars,
      tailor_id: tailorId,
      user_id: userId,
    };

    await addDoc(collection(db, "tailor_reviews"), reviewData);

    // Step 2: Analyze sentiment score using API
    const options = {
      method: "GET",
      url: "https://twinword-sentiment-analysis.p.rapidapi.com/analyze/",
      params: {
        text: message,
      },
      headers: {
        "x-rapidapi-key": "81513d3818msh58072953e50b553p1aa3f6jsn0c617c2823cf",
        "x-rapidapi-host": "twinword-sentiment-analysis.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    const sentimentScore = response.data.score;

    // Step 3: Update "tailors" collection
    const tailorRef = doc(db, "tailors", tailorId);
    const tailorSnapshot = await getDoc(tailorRef);

    if (tailorSnapshot.exists()) {
      const currentData = tailorSnapshot.data();
      const currentRating = currentData.rating || 0; 
      const currentTotalRating = currentData.total_rating || 0;

      // Calculate updated values
      const updatedRating = currentRating + stars + sentimentScore;
      const updatedTotalRating = currentTotalRating + 6;

      // Update Firestore with the new values
      await updateDoc(tailorRef, {
        rating: updatedRating,
        total_rating: updatedTotalRating,
      });

      statusMessage = "Rating and review updated successfully.";
    } else {
      throw new Error("Tailor document not found!");
    }
  } catch (error) {
    console.error("Error updating rating:", error);
    statusMessage = "Failed to update rating and review.";
  }

  return statusMessage;
};

export default UpdateTailorRating;
