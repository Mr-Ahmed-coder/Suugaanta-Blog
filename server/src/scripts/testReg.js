import dotenv from "dotenv";

dotenv.config();

async function testRegistration() {
  try {
    const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`;
    const res = await fetch(`${apiBaseUrl}/auth/register`, {
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
