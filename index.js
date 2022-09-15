const express=require("express");

const app=express();

app.get("/",(req,res)=>{
    res.send("my name is raja");
})
app.listen(434,()=>{
    console.log("server is running");
})