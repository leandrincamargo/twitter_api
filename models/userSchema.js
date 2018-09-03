var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  user: {
    type: String,
    unique: true,
    required: true
  },
  passwd: {
    type: String,
    required: true
  },
  follow: [{
    type: String,
    ref: 'User'
  }]
}, {
  collection: 'usercollection'
});

module.exports = {
  User: userSchema
}