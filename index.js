import dotenv from "dotenv";
import { twitterClient } from "./twitterClient.js";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT-Generated Solana Tweet
const generateSolanaTweet = async () => {
  try {
    // Define system and user messages for GPT
    const systemMessage = {
      role: "system",
      content:
        "You are a software developer that has a bachelors of science in computer science. no need to boast, you are humble and extremely intelligent which is why people follow your tweets. You keep up to date with the latest and popoular soccer (football) games. You are also a DJ that mixes hard groove, deep house, baile, guaracha, chancla and techno. This is your twitter account and your task is to get maximum exposure + build your platform. ",
    };

    const topics = [
      "Solana, memecoin trading, shitcoins, elon musk, future, ai, spooky",
      "Solana Devs",
      "Solana's growing DeFi ecosystem",
      "Manchester United, Real Madrid, Barcelona, Juventus, AC Milan, Inter Milan, Borussia Dortmund",
      "House Music, Minimal House, Deep House, Hard Groove, Techno, Melodic House, Progressive House",
      "Front End Development, Backend Development, Full Stack Development, App Development",
      "NextJS, React, React Native, Javascript, Typescript, Python, R, Rust, Ruby, Ruby on Rails",
    ];

    // Shuffle the topics array and select a random topic
    const shuffledTopic = topics[Math.floor(Math.random() * topics.length)];

    const userMessage = {
      role: "user",
      content: `Write a tweet with relevant information: "${shuffledTopic}" Use less than 260 characters, do not use emojis or quotations, use max 3 hashtags.`,
    };
    // Generate a tweet using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [systemMessage, userMessage],
      max_tokens: 50,
      temperature: 0.7,
    });

    // Extract the generated tweet text
    const tweet = response.choices[0]?.message?.content.trim();
    console.log("Generated Tweet:", tweet);
    return tweet;
  } catch (error) {
    console.error("Error generating tweet with GPT:", error);
  }
};

// Function to tweet
const tweet = async () => {
  try {
    const tweetContent = await generateSolanaTweet();
    const response = await twitterClient.v2.tweet(tweetContent);
    console.log("Tweet sent successfully:", response);
  } catch (e) {
    if (e.code === 429) {
      const resetTime = e.rateLimit?.day?.reset || e.rateLimit?.reset;
      const waitTime = resetTime * 1000 - Date.now();
      console.error(
        `Rate limit exceeded. Retrying in ${Math.ceil(
          waitTime / 1000 / 60
        )} minutes...`
      );
      setTimeout(tweet, waitTime);
    } else {
      console.error("Error sending tweet:", e);
    }
  }
};

// Schedule the tweet every 4 hours
setInterval(tweet, 4 * 60 * 60 * 1000);

// Run the tweet function immediately at startup
tweet();
