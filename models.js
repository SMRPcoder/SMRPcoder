const mongoose=require("mongoose");


const userschema=mongoose.Schema({
    username:String,
    password:String,
    loginstatus:String,
    role:String,
})
const roleschema=mongoose.Schema({
    role:String,
    roleid:Number,
})
const timeschema=mongoose.Schema({
    username:String,
    date:String,
    day:String,
    time:String,
})
const locationschema=mongoose.Schema({
    userid:String,
    City:String,
    Latitude:String,
    Longitude:String,
    Isocode:String,
})

const User=new mongoose.model("userlogins",userschema);
const Role=new mongoose.model("roleschema",roleschema);
const Time=new mongoose.model("timeschema",timeschema);
const Location=new mongoose.model("location",locationschema);
module.exports={User,Role,Time,Location}
// joi
