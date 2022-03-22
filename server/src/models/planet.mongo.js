const mongoose=require('mongoose');

const planetScheme=new mongoose.Schema({
    keplerName:{
        type:String,
        required:true,
    }
});

module.exports= mongoose.model('Planet',planetScheme);