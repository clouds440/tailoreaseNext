"use client";
import React from "react";
import Link from "next/link";

const funkySentences = [
  "Oops! You seem lost. How about you you go back where you came from?",
  "This page took a vacation.",
  "Not all who wander are lost, but you might be!",
  "Uh-oh, you've reached the void.",
  "Nothing to see here, move along.",
  "The page you requested is currently binge-watching Netflix. Try again later!",
  "The page you're looking for is out chasing unicorns.",
  "Congratulations! You've met Blorpy, the Imaginary Page Guardian. Unfortunately, Blorpy is terrible with directions and has led you to a 404 error!",
  "Whoa! You've stumbled upon Blorpy, the Mischievous Byte Goblin. Blorpy loves to snack on pages, and it looks like this one was his latest meal!",
];

const getRandomSentence = () => {
  return funkySentences[Math.floor(Math.random() * funkySentences.length)];
};

const NotFoundPage = () => {
  return (
    <main
      className={`h-screen w-full flex flex-col justify-center items-center text-white bg-gray-700 bg-opacity-85`}
    >
      <h1 className={"text-9xl font-extrabold tracking-widest"}>404</h1>
      <div className={"px-2 rounded rotate-12 absolute text-red-700"}>
        Page Not Found
      </div>
      <p className={"mt-5"}>{getRandomSentence()}</p>
      <Link href="/">
        <button className="mt-5 px-8 py-3 rounded-md border border-white bg-gray-950 hover:bg-slate-900">
          Go Home
        </button>
      </Link>
    </main>
  );
};

export default NotFoundPage;
