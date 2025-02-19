const mongoose=require('mongoose');

const connectDB=async ()=>{
    await mongoose.connect(
        "mongodb+srv://employeeAttendance:thr%40ith%40m963@employeeattendancemanag.eeeq1.mongodb.net/employeeAttendences"
    );
}

module.exports=connectDB;
