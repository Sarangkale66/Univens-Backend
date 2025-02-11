const mongoose =require('mongoose');

const visitorSchema = new mongoose.Schema({
  Clicks:Number
});

module.exports = mongoose.model("visitor",visitorSchema);