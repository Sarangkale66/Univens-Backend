const visitorSchema = require("../model/visitor.model");
const mongoose = require("mongoose");

module.exports.indexControl = async (req, res, next) => {
  try {
    const { visitorId } = req.params;

    if (!visitorId || visitorId.trim() === "" || !mongoose.Types.ObjectId.isValid(visitorId)) {
      const visitor = await visitorSchema.create({ Clicks: 1 });
      return res.status(200).json({ message: "newId", token: visitor._id });
    }

    let visitor = await visitorSchema.findById(visitorId);

    if (visitor) {
      visitor.Clicks += 1;
      await visitor.save();
    } else {
      visitor = await visitorSchema.create({ _id: visitorId, Clicks: 1 });
    }

    res.status(200).json({ message: "hello world", token: visitor._id });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};