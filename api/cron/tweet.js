// api/cron/tweet.js
import dotenv from "dotenv";
import { twitterClient } from "../../utils/twitterClient.js";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT-Generated Solana Tweet
const generateSolanaTweet = async () => {
  try {
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

    const shuffledTopic = topics[Math.floor(Math.random() * topics.length)];

    const userMessage = {
      role: "user",
      content: `Write a tweet with relevant information: "${shuffledTopic}" Use less than 260 characters, do not use emojis or quotations, use max 3 hashtags.`,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [systemMessage, userMessage],
      max_tokens: 50,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content.trim();
  } catch (error) {
    console.error("Error generating tweet with GPT:", error);
    throw error;
  }
};

const tweet = async () => {
  try {
    const tweetContent = await generateSolanaTweet();
    const response = await twitterClient.v2.tweet(tweetContent);
    return response;
  } catch (error) {
    console.error("Error sending tweet:", error);
    throw error;
  }
};

// New function to determine if we should tweet based on current hour
const shouldTweetAtCurrentHour = () => {
  const currentHour = new Date().getUTCHours();
  // Array of hours when we want to tweet (in UTC)
  // Example: [0, 6, 12, 18] for every 6 hours
  const tweetHours = [0, 6, 12, 18];
  return tweetHours.includes(currentHour);
};

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Option 1: Single tweet per day
    const response = await tweet();
    return res.status(200).json({ success: true, data: response });

    /* Option 2: Multiple tweets simulation (uncomment to use)
    if (shouldTweetAtCurrentHour()) {
      const response = await tweet();
      return res.status(200).json({ success: true, data: response });
    } else {
      return res.status(200).json({ success: true, message: "Not scheduled for this hour" });
    }
    */
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
