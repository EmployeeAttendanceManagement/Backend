const express=require('express');
const connectDB=require("./config/database");
const app=express();

const User=require("../src/models/user");

app.use(express.json());


//Working well
app.get("/user",async(req,res)=>{
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
app.patch("/user/:userId",async(req,res)=>{
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
app.delete("/user",async(req,res)=>{
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
app.get("/feed",async(req,res)=>{
    try{
        const users=await User.find({});
        res.send(users);
    }
    catch(err){
        res.send("Something went wrong in feed API");
    }
})


//SignUp API Working well
app.post("/signup",async(req,res)=>{
    const user=new User(req.body);
    try{
        await user.save();
        res.send("user added successfully");
    }
    catch(err){
        res.status(400).send("Error saving the user data signup API"+err);
    }
})



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