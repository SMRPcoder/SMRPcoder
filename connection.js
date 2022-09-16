const mongoose=require("mongoose");
require("dotenv").config();
// password=5dgn0aeqv0oIjNcV
myuri="mongodb+srv://smrpcoder:5dgn0aeqv0oIjNcV@mastertheblaster.hnreu7z.mongodb.net/mydata?retryWrites=true&w=majority"
module.exports=()=>{
    mongoose.connect(myuri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
},(err)=>{
    if(err){ 
        console.log(err);  
    }else{
        console.log("DB sucessfuly connected");
    }
})
}
// srajaamma@143