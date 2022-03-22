const {getAllPlanets}=require('../../models/planet.model');

async function httpGetAllPlanets(req,res){
    return res.status(200).json(await getAllPlanets());//使用return，保证状态设置只运行一次
}

module.exports={
    httpGetAllPlanets
}