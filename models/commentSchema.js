var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
  comment: String,
  data: {
    type: Date,
    default: Date.now
  },
  author: {
    type: String,
    ref: 'Users'
  },
  tweet:{
    type: mongoose.Schema.ObjectId,
    ref: 'Tweet'
  }
}, {
  collection: 'commentcollection'
});

module.exports = {
  Comment: commentSchema
}