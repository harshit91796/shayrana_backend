const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    desc: {
      type: String,
      maxlength: 500, // Changed from 'max' to 'maxlength'
    },
    img: {
      type: String,
    },
    title: {
      type: String,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const postModel = mongoose.model("Post", PostSchema);

module.exports = postModel;