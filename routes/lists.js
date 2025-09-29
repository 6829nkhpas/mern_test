const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Agent = require("../models/Agent");
const List = require("../models/List");
const auth = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV, XLSX, and XLS files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Normalize column names (case insensitive)
        const normalizedData = {};
        Object.keys(data).forEach((key) => {
          const normalizedKey = key.toLowerCase().trim();
          if (
            normalizedKey.includes("firstname") ||
            normalizedKey.includes("first")
          ) {
            normalizedData.firstName = data[key].trim();
          } else if (
            normalizedKey.includes("phone") ||
            normalizedKey.includes("mobile")
          ) {
            normalizedData.phone = data[key].trim();
          } else if (normalizedKey.includes("note")) {
            normalizedData.notes = data[key].trim() || "";
          }
        });

        if (normalizedData.firstName && normalizedData.phone) {
          results.push(normalizedData);
        }
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

// Helper function to parse Excel file
const parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const results = [];
    jsonData.forEach((row) => {
      const normalizedData = {};
      Object.keys(row).forEach((key) => {
        const normalizedKey = key.toLowerCase().trim();
        if (
          normalizedKey.includes("firstname") ||
          normalizedKey.includes("first")
        ) {
          normalizedData.firstName = String(row[key]).trim();
        } else if (
          normalizedKey.includes("phone") ||
          normalizedKey.includes("mobile")
        ) {
          normalizedData.phone = String(row[key]).trim();
        } else if (normalizedKey.includes("note")) {
          normalizedData.notes = String(row[key]).trim() || "";
        }
      });

      if (normalizedData.firstName && normalizedData.phone) {
        results.push(normalizedData);
      }
    });

    return results;
  } catch (error) {
    throw new Error("Error parsing Excel file: " + error.message);
  }
};

// Helper function to distribute items among agents
const distributeItems = (items, agents) => {
  const distributions = [];
  const itemsPerAgent = Math.floor(items.length / agents.length);
  const remainingItems = items.length % agents.length;

  let currentIndex = 0;

  agents.forEach((agent, index) => {
    const itemCount = itemsPerAgent + (index < remainingItems ? 1 : 0);
    const agentItems = items.slice(currentIndex, currentIndex + itemCount);

    distributions.push({
      agentId: agent._id,
      agentName: agent.name,
      items: agentItems,
      itemCount: agentItems.length,
    });

    currentIndex += itemCount;
  });

  return distributions;
};

// @route   POST /api/lists/upload
// @desc    Upload and distribute CSV file
// @access  Private
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please select a file to upload" });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Get all active agents
    const agents = await Agent.find({ isActive: true }).select("name email");

    if (agents.length === 0) {
      fs.unlinkSync(filePath); // Clean up uploaded file
      return res
        .status(400)
        .json({ message: "No active agents found. Please add agents first." });
    }

    // Parse the file based on extension
    let items = [];
    try {
      if (fileExt === ".csv") {
        items = await parseCSV(filePath);
      } else if (fileExt === ".xlsx" || fileExt === ".xls") {
        items = await parseExcel(filePath);
      }
    } catch (parseError) {
      fs.unlinkSync(filePath); // Clean up uploaded file
      return res.status(400).json({
        message: "Error parsing file: " + parseError.message,
      });
    }

    if (items.length === 0) {
      fs.unlinkSync(filePath); // Clean up uploaded file
      return res.status(400).json({
        message:
          "No valid data found. Please ensure your file has FirstName and Phone columns.",
      });
    }

    // Distribute items among agents
    const distributions = distributeItems(items, agents);

    // Save to database
    const list = new List({
      filename: req.file.originalname,
      totalItems: items.length,
      distributions,
      uploadedBy: req.user._id,
    });

    await list.save();

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: "File uploaded and distributed successfully",
      list: {
        id: list._id,
        filename: list.filename,
        totalItems: list.totalItems,
        distributions: list.distributions,
        createdAt: list.createdAt,
      },
    });
  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
});

// @route   GET /api/lists
// @desc    Get all lists with distributions
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const lists = await List.find()
      .populate("uploadedBy", "email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      lists,
    });
  } catch (error) {
    console.error("Get lists error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/lists/:id
// @desc    Get single list with distributions
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id).populate(
      "uploadedBy",
      "email"
    );

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    res.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error("Get list error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/lists/:id
// @desc    Delete list
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    await List.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "List deleted successfully",
    });
  } catch (error) {
    console.error("Delete list error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
