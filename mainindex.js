// declaring objects
const express=require("express");
const cors=require("cors");
const bcrypt=require("bcrypt");
const bodyParser = require("body-parser");
const jwt=require("jsonwebtoken");
const dotenv=require("dotenv");
const joi=require("joi");
const moment=require("moment");
const axios=require("axios");


//validating user...
function validate_user(req,res,next){
    const user_v={
        username:req.body.username,
        password:req.body.password
    }

    const joischema=joi.object({
        username:joi.string().email().min(5).max(30).required(),
        password:joi.string().min(8).max(24).required(),
    }).options({abortEarly:false});

    const is_valid= joischema.validate(user_v);
    console.log(is_valid);
    if(!is_valid.error){
        // res.send({message:"validate successfull",status:1});
        // console.log("validate sucessfull")
        req.validate=1
        next();
    }else{
        // res.send({message:"not valid email or password",status:3});
        // console.log("not valid email or password")
        req.validate=0
        next();
    }
}


// axios
let lat=""
let long=""
let city=""
let isocode=""
let loc_dict={}


axios.get("https://api.bigdatacloud.net/data/reverse-geocode-client").then(response=>{
    const resdata=response.data;
    lat=resdata.latitude
    long=resdata.longitude
    city=resdata.city
    isocode=resdata.principalsubdivisioncode
    // loc_dict={
    //     "latitude":lat,
    //     "longitude":long,
    //     "city":city,
    //     "isocode":isocode 
    // }
    // console.log(resdata)
    console.log(`this is the  ${lat},${long}`);
}).catch(error=>console.log("error to fetch data"));



// check admin...
function check_admin(req,res,next){
    if(req.body.role=="admin"){
        return true, next();
    }else{
        return false, next();
    }
}

// declaring constants, variables,etc...
const app=express();
const port=8000
dotenv.config();

// connecting the another files
const connection=require("./connection");
const model=require("./models");

// using app 
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// establising....
connection();
const user=model.User;
const role=model.Role;
const time=model.Time;
const location=model.Location;

// to discover time
const l_date=moment().format(`MMMM Do YYYY`);
const l_day=moment().format(`dddd`);
const l_time=moment().format(`hh:mm:ss a`);


// token  functions
function generatetoken(user){
    const jwtoken=jwt.sign({user},process.env.JWT,{expiresIn:"87000s"});
    return jwtoken;
}

function verifytoken(req,res,next){
    console.log(req.body.token);
    jwt.verify(req.body.token,process.env.JWT,(err,thedata)=>{
        if(err){
            req.user=0;
            next();
        }else{
            console.log(thedata);
            req.user=thedata;
            next();
        }
    })
}


// check
app.get("/gTK",async(req,res)=>{
    gtk=await generatetoken(user)
    res.send(`${gtk}`)
})



// creating a login feature
app.post("/login",(req,res)=>{
    console.log(req.body);
    user.findOne({username:req.body.username}, async(err,data)=>{
        if(!err){
            if(data){
                const getpass=await bcrypt.compare(req.body.password,data.password);
                if(getpass){
                    const token=generatetoken(data);
                    res.send({message:"User Logged In",status:1,token:token});
                    const newloc=new location({
                        userid:token,
                        City:city,
                        Latitude:lat,
                        Longitude:long,
                        Isocode:isocode
                    })
                    newloc.save()
                    const newtime=new time({
                        username:req.body.username,
                        date:l_date,
                        day:l_day,
                        time:l_time
                    })
                    newtime.save()
                }else{
                    res.send({message:"Password is WRONG!!!",status:0});
                }
            }else{
                res.send({message:"User Not Found",status:0});
            }
        }
    })

})

// creating a new user
app.post("/createuser",verifytoken,validate_user,(req,res)=>{
    
        if (req.user!=0){
        validate_user
    if(req.validate==1){
    console.log(req.body)
    user.findOne({username:req.body.username},async(err,data)=>{
        if(!err){
            if(data){
                res.send({message:"User Already Exits",status:0});
            }else{
                const salt = await bcrypt.genSalt(Number(process.env.SALT));
                const hash = await bcrypt.hash(req.body.password, salt);

                console.log(salt,hash);

                const newuser=new user({
                    username:req.body.username,
                    password:hash,
                    role:req.body.role
                })
            newuser.save((err)=>{
                if(!err){
                    res.send({message:"Sucessfully Created User...",status:1});
                }else{
                    res.send({message:"User Not Created !!!!",status:0});
                }
            })

            }
        }
    })
}else{
    res.send({message:"Invalid Form",status:0});
}
    }else{
        res.send({message:"Token expired",status:0});
    }
})


// creating a home navigation after login
app.post("/home",verifytoken,(req,res)=>{
    if(req.user!=0){
        console.log(req.user)
        role.findOne({_id:req.user.user.role},(err,data)=>{
            res.send({name:req.user,userrole:data.role});
        })
        
    }else{
        res.send({message:"token expired",status:2});
    }
})


// creating navi to find a userdetails
app.post("/viewuser",(req,res)=>{
    const user_to_view=req.body.username
    console.log(req.body)
    if(JSON.stringify(req.body)!='{}'){
    user.findOne({username:user_to_view},(err,data)=>{
        if(!err){
            if(data){
                res.send(data);
            }else{
                res.send("user not found!!!");
            }
        }else{
            res.send(error);
        }
    })
}
else{
    user.find({},(err,data)=>{
        res.send(data);
    })
}
})

// adding role
app.post("/addrole",(req,res)=>{
    const role_m=new role({
        role:req.body.role
    }
    )
    role_m.save(err=>{
        if(!err){
            res.send({message:"role saved",status:1});
        }else{
            res.send({message:err,status:0});
        }
    })
})

// useing find()....
app.get("/role",(req,res)=>{
    role.find({},(err,data)=>{
        res.send(data);
    })
})



// making a server to host
app.listen(port,()=>{
    console.log("server started");
})