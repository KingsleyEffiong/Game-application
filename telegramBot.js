import fs from 'fs';
import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import admin from 'firebase-admin';

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const bot = new Telegraf(process.env.BOT_API_TOKEN);

// Telegram bot logic
bot.start(async (ctx) => {
  const refId = ctx.startPayload; // This captures the 'start' parameter (referral ID)
  
  if (refId) {
    try {
      // Look up the user with the referral ID in the Firestore database
      const userQuery = db.collection('users').where('id', '==', refId);
      const querySnapshot = await userQuery.get();
      
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnap) => {
          const userRef = db.collection('users').doc(docSnap.id);
          const currentPoints = docSnap.data().point;
          const newPoints = currentPoints + 1000; // Add 1000 points

          // Update the user's points in the database
          await userRef.update({ point: newPoints });

          // Optionally, send a confirmation message to the user
          ctx.reply(`Congratulations! You've earned 1000 points for sharing your referral link.`);
        });
      } else {
        ctx.reply("Referral link is invalid or user not found.");
      }
    } catch (error) {
      console.error("Error handling referral:", error);
      ctx.reply("There was an error processing your referral.");
    }
  } else {
    ctx.reply("Welcome to the bot! Use the commands to start earning points.");
  }
});

// // Set up the webhook
// bot.telegram.setWebhook('https://your-render-app-url.com/your-webhook-path');

// Launch the bot
bot.launch().then(() => {
  console.log("Bot is running!");
}).catch((error) => {
  console.error("Error launching bot:", error);
});
