const mongoose=require('mongoose');

const URL=process.env.MONGO_URL;

mongoose.connection.on('open',()=>{
    console.log('MongoDB connection ready!')
})

mongoose.connection.on('error',(err)=>{
    console.error(err);
})

async function mongoConnect(){
    await mongoose.connect(URL)
}

async function mongoDisconnect(){
    await mongoose.disconnect();
}

module.exports={
    mongoConnect,
    mongoDisconnect,
}