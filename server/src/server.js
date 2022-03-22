const http=require('http');
const app=require('./app');
require('dotenv').config();//填充process.env
const{mongoConnect}=require('./services/mongo');

const {loadPlanetsData}=require('./models/planet.model');
const {loadLaunchData}=require('./models/launches.model');

const PORT=process.env.PORT || 8000;

const server=http.createServer(app);

async function startServer(){
    await mongoConnect();
    await loadLaunchData();
    await loadPlanetsData();
    
    server.listen(PORT,()=>{
        console.log(`Listening on port ${PORT}...`);
    });
}

startServer();