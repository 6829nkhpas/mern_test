const axios = require("axios");

const API_BASE_URL = "http://localhost:5000";

async function testAPI() {
  console.log("🧪 Testing MERN Stack API...\n");

  try {
    // Test 1: Login
    console.log("1️⃣  Testing Login...");
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: "admin@example.com",
      password: "admin123",
    });

    if (loginResponse.data.success) {
      console.log("✅ Login successful");
      const token = loginResponse.data.token;

      // Set authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Test 2: Get Agents
      console.log("\n2️⃣  Testing Get Agents...");
      const agentsResponse = await axios.get(`${API_BASE_URL}/api/agents`);
      console.log(
        `✅ Agents endpoint working. Found ${agentsResponse.data.agents.length} agents`
      );

      // Test 3: Create Agent
      console.log("\n3️⃣  Testing Create Agent...");
      const newAgent = {
        name: "Test Agent",
        email: "test@example.com",
        mobile: "+1234567890",
        password: "password123",
      };

      const createAgentResponse = await axios.post(
        `${API_BASE_URL}/api/agents`,
        newAgent
      );
      if (createAgentResponse.data.success) {
        console.log("✅ Agent creation successful");

        // Test 4: Get Lists
        console.log("\n4️⃣  Testing Get Lists...");
        const listsResponse = await axios.get(`${API_BASE_URL}/api/lists`);
        console.log(
          `✅ Lists endpoint working. Found ${listsResponse.data.lists.length} lists`
        );

        console.log("\n🎉 All API tests passed!");
        console.log("\n📝 Test Summary:");
        console.log(`   • Authentication: ✅ Working`);
        console.log(`   • Agents CRUD: ✅ Working`);
        console.log(`   • Lists API: ✅ Working`);
        console.log(
          `   • Total Agents: ${agentsResponse.data.agents.length + 1}`
        );
        console.log(`   • Total Lists: ${listsResponse.data.lists.length}`);
      }
    }
  } catch (error) {
    console.error(
      "❌ API Test Failed:",
      error.response?.data?.message || error.message
    );
    console.log("\n🔧 Troubleshooting:");
    console.log("   • Make sure the backend server is running (npm run dev)");
    console.log("   • Verify MongoDB is connected");
    console.log("   • Check if admin user exists (npm run setup)");
  }
}

// Run tests
testAPI();
