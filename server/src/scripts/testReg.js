import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: "../../.env" });

async function testRegistration() {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Hacker User",
        email: "hacker@test.com",
        password: "password123",
        role: "admin"
      })
    });
    
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}

testRegistration();
