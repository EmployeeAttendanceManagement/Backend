const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique:true
  },
  checkInTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  checkInLocation: {
    latitude: Number,
    longitude: Number,
  },
  checkOutTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  checkOutLocation: {
    latitude: Number,
    longitude: Number,
  },
  leaveStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'none'],
    default: 'none'
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
