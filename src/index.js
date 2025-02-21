const express=require('express');
const connectDB=require("./config/database");
const app=express();

const User=require("../src/models/user");
const Attendance=require("../src/models/attendance");
const {validateSignUpData}=require("../src/utils/validation");

const bcrypt=require("bcrypt");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const {userAuth}=require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());



/*--Attendance APIs-- */

app.post("/attendance",userAuth,async(req,res)=>{
    const {userId,latitude,longitude}=req.body;
    try{
        const attendance=new Attendance({
            user:userId,
            checkInLocation:{latitude,longitude}
        });
        await attendance.save();
        res.status(200).send("Attendance Marked Successfully!");
    }
    catch(err){
        res.send(400).send("Error on Marking attendance "+err);
    }
})


//working well
app.patch("/attendance/:id", userAuth,async (req, res) => {
    const attendanceId = req.params.id;
    const { latitude, longitude } = req.body;
    try {
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        attendanceId,
        {
          checkOutTime: Date.now(),
          checkOutLocation: { latitude, longitude }
        },
        { new: true, runValidators: true }
      );
      if (!updatedAttendance) {
        return res.status(404).send("Attendance record not found");
      }
      res.status(200).send("Attendance check-out updated successfully!");
    } catch (err) {
      res.status(400).send("Error updating check-out time: " + err);
    }
  });
  

//working well
app.patch('/attendance/:id/leave', userAuth,async (req, res) => {
    const attendanceId = req.params.id;

    try {
        const attendance = await Attendance.findById(attendanceId);

        if (!attendance) {
            return res.status(404).send("Attendance record not found");
        }

        if (attendance.leaveStatus === "none") {
            attendance.leaveStatus = "pending";
            await attendance.save();
            return res.status(200).send("Attendance leave status updated to Pending successfully!");
        } else {
            return res.status(400).send("Leave status can only be updated from 'None' to 'Pending'");
        }
    } catch (err) {
        res.status(500).send("Error Updating leave status: " + err);
    }
});


//Working well

app.patch('/attendance/:id/approve-leave',userAuth, async (req, res) => {
    const attendanceId = req.params.id;
    const { approvReject } = req.body;

    try {
        const attendance = await Attendance.findById(attendanceId);

        if (!attendance) {
            return res.status(404).send("Attendance record not found");
        }

        if (attendance.leaveStatus === "pending") {
            attendance.leaveStatus = approvReject;
            await attendance.save();
            return res.status(200).send(`Leave status updated to ${approvReject} successfully!`);
        } else {
            return res.status(400).send("Only 'Pending' requests can be approved or rejected.");
        }
    } catch (err) {
        res.status(500).send("Error updating leave status: " + err);
    }
});




/*--User APIs--*/


//Working well
app.get("/user",userAuth,async(req,res)=>{
    const name=req.body.firstName;
    try{
        const userData=await User.find({firstName:name});
        (userData.length===0)?res.send("User not found"):res.send(userData);
    }
    catch(err){
        res.send("Error in user get API"+err);
    }
})


//Working Well
app.patch("/user/:userId",userAuth,async(req,res)=>{
    const id=req.params?.userId;
    const data=req.body;
    try{

        const ALLOWED_UPDATES=[
            "age","gender","about","photoUrl"
        ];
        const isUpdateAllowed=Object.keys(data).every(k =>
             ALLOWED_UPDATES.includes(k));
        if(!isUpdateAllowed){
            throw new Error("Update not allowed!");
        }

        await User.findByIdAndUpdate({_id:id},data,{returnDocument:"after",runValidators:true});
        res.send("User Updated Successfully");
    }
    catch(err){
        res.send("Something went wrong for Updating data patch API"+err);
    }
})



//Working well
app.delete("/user",userAuth,async(req,res)=>{
    const userId=req?.body.userId;
    try{
        await User.findOneAndDelete({_id:userId});
        res.send("User deleted Successfully!");
    }
    catch(err){
        res.send("Something wrong on delete user API"+err);
    }
})


// Working fine
app.get("/feed",userAuth,async(req,res)=>{
    try{
        const users=await User.find({});
        res.send(users);
    }
    catch(err){
        res.send("Something went wrong in feed API");
    }
})


//Profile API
app.get("/profile",userAuth,async (req,res)=>{
    try{
        const user=req.user;
        res.send(user);
    }
    catch(err){
        res.status(400).send("ERROR :"+err.message);
    }
})



//login working well
app.post("/login",async(req,res)=>{
    try{
        const {emailId,password}=req.body;
        const user=await User.findOne({emailId:emailId});

        if(!user){
            throw new Error("Invalid Credentials");
        }
        
        const isPasswordValid=await user.validatePassword(password);

        if(isPasswordValid){
            const token=await user.getJWT();
            res.cookie("token",token);
            res.send("Login Successfull!!!");
        }
        else{
            throw new Error("Invalid Credentials");
        }
    }
    catch(err){
        res.status(400).send("ERROR :"+err.message);
    }
})



//SignUp API Working well
app.post("/signup",async(req,res)=>{
    try{
        validateSignUpData(req);

        const {firstName,lastName,emailId,password}=req.body;
        const passwordHash=await bcrypt.hash(password,10);

        const user=new User({
            firstName,
            lastName,
            emailId,
            password:passwordHash,
        });
        await user.save();
        res.send("user added successfully");
    }
    catch(err){
        res.status(400).send("Error saving the user data signup API"+err);
    }
})



app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
      const token = req.user.getJWT ? req.user.getJWT() : jwt.sign({ _id: req.user._id }, 'thr@ith@m963', { expiresIn: '7d' });
      res.cookie("token", token, {
          secure: "thr@ith@m963"
      });
      res.redirect('/');
});



connectDB()
    .then(()=>{
        console.log("Database connection Established!");
        app.listen(3000,()=>{
            console.log("server created successfully!");
        });
    })
    .catch((err)=>{
        console.error("Database cannot be connected!"+err);
    })