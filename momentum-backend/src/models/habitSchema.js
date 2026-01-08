import mongoose from "mongoose";

const habitTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 25,
  },
  type: {
    type: String,
    enum: ["binary", "quantitative"],
    default: "binary",
  },
});
