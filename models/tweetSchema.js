var mongoose = require('mongoose');

var tweetSchema = new mongoose.Schema({
  tweet: String,
  data: {
    type: Date,
    default: Date.now
  },
  author: {
    type: String,
    ref: 'Users'
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  collection: 'tweetcollection'
});

module.exports = {
  Tweet: tweetSchema
}