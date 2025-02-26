const visitorSchema = require("../model/visitor.model");
const mongoose = require("mongoose");

module.exports.indexControl = async (req, res, next) => {
  try {
    res.send("helloworld");
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};