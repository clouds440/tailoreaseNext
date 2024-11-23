import React from "react";
import axios from "axios";
import { db } from "../utils/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const UpdateTailorRating = ({ bid, message, stars }) => {
  const updateRating = async () => {
    try {
      // Twinword Sentiment API via RapidAPI
      const options = {
        method: "GET",
        url: "https://twinword-sentiment-analysis.p.rapidapi.com/analyze/",
        params: {
          text: message,
        },
        headers: {
          "x-rapidapi-key": "81513d3818msh58072953e50b553p1aa3f6jsn0c617c2823cf", // Replace with your actual API key
          "x-rapidapi-host": "twinword-sentiment-analysis.p.rapidapi.com",
        },
      };

      // Fetch sentiment score
      const response = await axios.request(options);
      const sentimentScore = response.data.score; // Extract score

      // Fetch current rating and total_rating from Firestore
      const tailorRef = doc(db, "tailors", bid);
      const tailorSnapshot = await getDoc(tailorRef);

      if (tailorSnapshot.exists()) {
        const currentData = tailorSnapshot.data();
        const currentRating = currentData.rating || 0; // Default to 0 if not set
        const currentTotalRating = currentData.total_rating || 0; // Default to 0 if not set

        // Calculate updated values
        const updatedRating = currentRating + stars + sentimentScore;
        const updatedTotalRating = currentTotalRating + 6;

        // Update Firestore with the new values
        await updateDoc(tailorRef, { 
          rating: updatedRating,
          total_rating: updatedTotalRating,
        });

        console.log(`Updated rating for ${bid}: ${updatedRating}`);
        console.log(`Updated total_rating for ${bid}: ${updatedTotalRating}`);
      } else {
        console.error("Tailor document not found!");
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  return (
    <button
      onClick={updateRating}
      className="px-4 py-2 bg-green-500 text-white rounded"
    >
      Update Rating
    </button>
  );
};

export default UpdateTailorRating;
