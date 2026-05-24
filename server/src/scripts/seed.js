import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Models
import Author from "../models/Author.js";
import Song from "../models/Song.js";
import Poetry from "../models/Poetry.js";
import History from "../models/History.js";

// Setup env path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Dummy Data
const authors = [
  {
    name: "Hadraawi",
    biography: "Maxamed Ibraahim Warsame 'Hadraawi' is widely considered one of the greatest Somali poets. He is known for his philosophical, romantic, and patriotic poetry. His work deeply influenced modern Somali literature.",
    birthYear: 1943,
    specialties: ["Poetry", "Playwriting", "Songwriting"],
    photo: "https://via.placeholder.com/400x400?text=Hadraawi"
  },
  {
    name: "Cabdullaahi Suldaan 'Timacadde'",
    biography: "Cabdullaahi Suldaan Maxamed, famously known as Timacadde, was a renowned Somali poet whose words played a crucial role in the Somali independence movement.",
    birthYear: 1920,
    specialties: ["Poetry", "Patriotism"],
    photo: "https://via.placeholder.com/400x400?text=Timacadde"
  },
  {
    name: "Xasan Aadan Samatar",
    biography: "A legendary Somali singer and musician, known for his unique voice and contributions to the golden era of Somali music in the 1970s and 1980s.",
    birthYear: 1953,
    specialties: ["Singing", "Music Production"],
    photo: "https://via.placeholder.com/400x400?text=Xasan+Aadan"
  }
];

const songs = [
  {
    title: "Baladweyn",
    artist: "Xasan Aadan Samatar",
    description: "A classic Somali love song written by Hadraawi about the city of Baladweyne.",
    lyrics: "Waa Baladweyn, beertii jaceylka...\n\n(Note: Full lyrics to be added)",
    category: "Jacayl",
    tags: ["Classic", "1970s", "Hadraawi"],
    year: 1974
  },
  {
    title: "Qaran",
    artist: "Magool",
    description: "A patriotic song praising the Somali nation.",
    lyrics: "Soomaaliyeey toosoo, toosoo isku tiirsada...",
    category: "Waddani",
    tags: ["Patriotism", "Magool"],
    year: 1960
  }
];

const poetryList = [
  {
    title: "Hooyo",
    poet: "Hadraawi",
    content: "Hooyo waa qaali, ifka iyo aakhiraba... \n\n(A beautiful poem honoring mothers.)",
    category: "Jacayl",
    tags: ["Mother", "Hadraawi", "Classic"]
  },
  {
    title: "Kana Siib Kana Saar",
    poet: "Timacadde",
    content: "Kana siib kana saar... \n\n(A famous patriotic poem recited at independence.)",
    category: "Waddani",
    tags: ["Independence", "Timacadde", "History"]
  }
];

const historyArticles = [
  {
    title: "The Dervish Movement",
    content: "The Dervish movement (Somali: Daraawiish) was a popular, anti-colonial movement led by Sayid Mohamed Abdullahi Hassan. It lasted from 1899 to 1920 and successfully repelled the British Empire four times.",
    category: "Colonial Era",
    tags: ["Dervish", "Sayid Mohamed", "Resistance"]
  },
  {
    title: "The Golden Era of Somali Music",
    content: "The 1970s and 1980s are often referred to as the golden era of Somali music, characterized by the rise of influential bands like Iftin, Waaberi, and Dur-Dur Band, blending traditional Somali melodies with funk and soul.",
    category: "Arts & Culture",
    tags: ["Music", "Waaberi", "1970s"]
  }
];

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI is not defined in the environment variables.");
      process.exit(1);
    }

    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully!");

    // Clear existing data
    console.log("Clearing existing data...");
    await Author.deleteMany();
    await Song.deleteMany();
    await Poetry.deleteMany();
    await History.deleteMany();

    // Insert dummy data
    console.log("Inserting new data...");
    await Author.insertMany(authors);
    await Song.insertMany(songs);
    await Poetry.insertMany(poetryList);
    await History.insertMany(historyArticles);

    console.log("Data seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during data seeding:", error);
    process.exit(1);
  }
};

seedData();
