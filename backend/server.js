const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Read email template
async function getEmailTemplate() {
  const templatePath = path.join(__dirname, "email_template.html");
  const template = await fs.readFile(templatePath, "utf8");
  return template;
}

// Send email function
async function sendAssignmentEmail(participant, recipientName) {
  try {
    const template = await getEmailTemplate();
    const html = template
      .replace(/{{ss_name}}/g, participant.name)
      .replace(/{{ss_target}}/g, recipientName);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: participant.email,
      subject: "Your Secret Santa Assignment! 🎄",
      html: html,
    });

    console.log(`Email sent to ${participant.email}`);
  } catch (error) {
    console.error(`Error sending email to ${participant.email}:`, error);
    throw error;
  }
}

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Participant Schema
const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  assignedTo: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Participant = mongoose.model("Participant", participantSchema);

// Routes
app.get("/api/participants", async (req, res) => {
  try {
    const participants = await Participant.find();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/participants", async (req, res) => {
  try {
    const participant = new Participant(req.body);
    await participant.save();
    res.status(201).json(participant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/assignments", async (req, res) => {
  try {
    const participants = await Participant.find();
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    // Create assignments and send emails
    const assignments = [];
    const emailPromises = [];

    for (let i = 0; i < shuffled.length; i++) {
      const nextIndex = (i + 1) % shuffled.length;
      const currentParticipant = shuffled[i];
      const recipientName = shuffled[nextIndex].name;

      assignments.push({
        participant: currentParticipant,
        assignedTo: recipientName,
      });

      // Send email asynchronously
      emailPromises.push(
        sendAssignmentEmail(currentParticipant, recipientName)
      );
    }

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    res.json({
      message: "Assignments created and emails sent successfully",
      assignments,
    });
  } catch (error) {
    console.error("Error in assignments:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete all participants
app.delete("/api/participants", async (req, res) => {
  try {
    await Participant.deleteMany({});
    res.json({ message: "All participants deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
