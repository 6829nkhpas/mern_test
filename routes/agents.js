const express = require("express");
const Agent = require("../models/Agent");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const agents = await Agent.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error("Get agents error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/agents
// @desc    Create new agent
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Validate input
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        message:
          "Please provide all required fields: name, email, mobile, password",
      });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res
        .status(400)
        .json({ message: "Agent with this email already exists" });
    }

    // Create new agent
    const agent = new Agent({
      name,
      email,
      mobile,
      password,
    });

    await agent.save();

    // Return agent without password
    const agentResponse = agent.toObject();
    delete agentResponse.password;

    res.status(201).json({
      success: true,
      message: "Agent created successfully",
      agent: agentResponse,
    });
  } catch (error) {
    console.error("Create agent error:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Agent with this email already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// @route   PUT /api/agents/:id
// @desc    Update agent
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, mobile, isActive } = req.body;
    const agentId = req.params.id;

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update fields
    if (name) agent.name = name;
    if (email) agent.email = email;
    if (mobile) agent.mobile = mobile;
    if (typeof isActive === "boolean") agent.isActive = isActive;

    await agent.save();

    // Return agent without password
    const agentResponse = agent.toObject();
    delete agentResponse.password;

    res.json({
      success: true,
      message: "Agent updated successfully",
      agent: agentResponse,
    });
  } catch (error) {
    console.error("Update agent error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Delete agent
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    await Agent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    console.error("Delete agent error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/agents/:id
// @desc    Get single agent
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select("-password");
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error("Get agent error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
