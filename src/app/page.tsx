"use client";

import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
  
export default function KitchenAssistant() {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('');
  const [currentTask, setCurrentTask] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const getAvailableItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "availableItems"));
      const items = querySnapshot.docs.map(doc => doc.data().name);
      return items.join(', ');
    } catch (error) {
      console.error("Error fetching available items: ", error);
      return ''; // Return an empty string or handle the error as needed
    }
  };

  const handleVoiceCommand = async (commandText: string) => {
    setCommand(commandText.toLowerCase());
  
    if (commandText.includes("suggest a recipe")) {
      await suggestRecipe();
    } else if (commandText.includes("make a grocery list")) {
      setCurrentTask('groceryList');
      setResponse("Sure, start telling me the items.");
      speak("Sure, start telling me the items.");
    } else if (commandText.includes("weather")) {
      await checkWeather();
    } else if (commandText.includes("play a song")) {
      await playSong(commandText.replace("play a song", "").trim());
    } else if (currentTask === 'groceryList') {
      await addToGroceryList(commandText);
    } else {
      await handleGeneralCommand(commandText);
    }
  };
  
  // New function to handle general commands using LLaMA
  const handleGeneralCommand = async (commandText: string) => {
    try {
      const res = await fetch('/api/llama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: commandText }),
      });
  
      if (!res.ok) {
        throw new Error('Failed to process command with LLaMA');
      }
  
      const data = await res.json();
      const responseText = data.response;
  
      setResponse(responseText);
      speak(responseText);
    } catch (error) {
      console.error('Error in handleGeneralCommand:', error);
      setResponse("Sorry, I couldn't process your request.");
      speak("Sorry, I couldn't process your request.");
    }
  };
  

  const suggestRecipe = async () => {
    const availableItems = await getAvailableItems();
    const res = await fetch('/api/llama', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Based on the available ingredients: ${availableItems}, suggest a recipe.`,
      }),
    });

    if (!res.ok) {
      console.error("Failed to fetch recipe");
      setResponse("Sorry, I couldn't find a recipe.");
      speak("Sorry, I couldn't find a recipe.");
      return;
    }

    const data = await res.json();
    const recipe = data.response;

    setResponse(recipe);
    speak(recipe);
  };

  const addToGroceryList = async (item: string) => {
    try {
      await addDoc(collection(db, 'groceryLists'), { item });
      setResponse(`Added ${item} to your grocery list.`);
      speak(`Added ${item} to your grocery list.`);
    } catch (error) {
      console.error("Error adding document: ", error);
      setResponse("Sorry, I couldn't add the item to the list.");
      speak("Sorry, I couldn't add the item to the list.");
    }
  };

  const checkWeather = async () => {
    const res = await fetch('/api/weather', {
      method: 'GET',
    });

    if (!res.ok) {
      console.error("Failed to fetch weather");
      setResponse("Sorry, I couldn't get the weather information.");
      speak("Sorry, I couldn't get the weather information.");
      return;
    }

    const data = await res.json();
    const weather = data.weather;

    setResponse(`The current weather is: ${weather}.`);
    speak(`The current weather is: ${weather}.`);
  };

  const playSong = async (song: string) => {
    // Implement song playback through an API like Spotify or a music service.
    setResponse(`Playing ${song}.`);
    speak(`Playing ${song}.`);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onerror = (event: any) => {
      console.error("Speech synthesis error:", event.error);
    };
    speechSynthesis.speak(utterance);
  };

  const interruptSpeech = () => {
    speechSynthesis.cancel();  // Stops any ongoing speech
    console.log("Speech interrupted.");
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition API is not supported in this browser.");
      alert("SpeechRecognition API is not supported in this browser.");
      return;
    }

    const newRecognition = new SpeechRecognition();
    newRecognition.lang = 'en-US';
    newRecognition.interimResults = false;
    newRecognition.maxAlternatives = 1;

    newRecognition.onstart = () => {
      console.log("Speech recognition started.");
    };

    newRecognition.onresult = (event: any) => {
      if (event.results.length > 0) {
        const speechToText = event.results[0][0].transcript;
        console.log("Recognized text:", speechToText);
        handleVoiceCommand(speechToText);
      } else {
        console.log("No speech recognized.");
      }
    };

    newRecognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    newRecognition.onend = () => {
      console.log("Speech recognition ended.");
      if (recognition) {
        startRecognition();  // Automatically restart recognition if not stopped
      }
    };

    newRecognition.start();
    setRecognition(newRecognition);  // Save the recognition instance in state
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Smart Kitchen App</h1>
      <div className="flex justify-center space-x-4 mb-8">
        <button onClick={startRecognition} className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 focus:outline-none">
          Start Listening
        </button>
        <button onClick={interruptSpeech} className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 focus:outline-none">
          Interrupt
        </button>
      </div>
      <div className="w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
          <h2 className="text-2xl font-semibold mb-4">Transcript</h2>
          <p className="text-gray-800 text-lg">{command}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Response</h2>
          <p className="text-gray-800 text-lg">{response}</p>
        </div>
      </div>
    </div>
  );
}
