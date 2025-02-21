const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const userSchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4,
        maxLength:50
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email Address"+value);
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Invalid strong password Address"+value);
            }
        }
    },
    age:{
        type:Number,
        min:18,
        max:80
    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender data is not valid!");
            }
        }
    },
    about:{
        type:String,
        default:"This is a default about of a user!",
    },
    photoUrl:{
        type:String,
        default:"https://www.google.com/imgres?q=photo%20icon%20default&imgurl=https%3A%2F%2Fthumbs.dreamstime.com%2Fb%2Fdefault-avatar-profile-icon-vector-social-media-user-image-182145777.jpg&imgrefurl=https%3A%2F%2Fwww.dreamstime.com%2Fillustration%2Fdefault.html&docid=hzF46qAYeOYmJM&tbnid=XWg4py6RDWlHNM&vet=12ahUKEwiYmu_puc-LAxW7j68BHb5zBukQM3oECFcQAA..i&w=800&h=800&hcb=2&ved=2ahUKEwiYmu_puc-LAxW7j68BHb5zBukQM3oECFcQAA"
    }
},{timestamps:true});

userSchema.methods.getJWT=async function(){
    const user=this;
    const token=await jwt.sign({_id:user._id},"thr@ith@m963");
    return token;
}


userSchema.methods.validatePassword=async function(passwordGivenByUser){
    const user=this;
    const passwordHash=user.password;

    const isPasswordValid=await bcrypt.compare(passwordGivenByUser,passwordHash);
    return isPasswordValid;
}


module.exports=mongoose.model("User",userSchema);

