const {existsLaunchWithId,getAllLaunches, scheduleNewLaunch,abortLaunchById}=require('../../models/launches.model');
const{
    getPagination
}=require('../../services/query.js')

async function httpGetAllLaunches(req,res){
    const{skip ,limit}=getPagination(req.query);//支持pagination
    const launches=await getAllLaunches(skip,limit);
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req,res){
    const launch =req.body;
//前后端命名要一致
    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
        return res.status(400).json({
            error:'Mission required launch property'
        });
    }
    launch.launchDate=new Date(launch.launchDate);
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error:'Invalid Launch Date'
        });
    }
    
    try{
        await scheduleNewLaunch(launch);
    }catch(err){
        return res.status(400).json({
            error:`${err}`
        })
    }
    
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req,res){
    const launchId=Number(req.params.id);//获得路径中的id
    const existsLaunch=await existsLaunchWithId(launchId);
    if(!existsLaunch){
        return res.status(404).json({
            error:'launch not found'
        })
    }
    const aborted=await abortLaunchById(launchId);
    if(!aborted){
        return res.status(400).json({
            error:'Launch not aborted',
        })
    }
    return res.status(200).json({
        ok:true,
    });


}

module.exports={
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}