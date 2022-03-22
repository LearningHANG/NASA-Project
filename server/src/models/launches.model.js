const launchesDatabase=require('./launches.mongo');
const planets=require('./planet.mongo');
const axios=require('axios');//用于创建http请求

// const launches=new Map();
const DEFAULT_FLIGHT_NUMBER=100;

// const launch={
//     flightNumber:100,//flight_number
//     mission:'Kepler Exploration X',//name
//     rocket:'Explorer IS1',//rocket.name
//     launchDate:new Date("December 27 ,2030"),//data_local
//     target:'Kepler-442 b',//not applicable
//     customers:['ZTM','NASA'],//payload.customers for each payload
//     upcoming:true,
//     success:true,
// }
// saveLaunch(launch);
//launches.set(launch.flightNumber,launch);

const SpaceX_API_URL='https://api.spacexdata.com/v4/launches/query';

//用来填充数据
async function populateLaunches(){
    console.log('Downloading launch data...');
    //获取API中的信息
    const response= await axios.post(SpaceX_API_URL,{
        query:{},
        options:{
            pagination:false,//这个分页选项
            populate:[{
                path:'rocket',
                select:{
                    name:1,
                }
            },{
                path:'payloads',
                select:{
                    'customers':1//这是个数组
                }
            }]
        }
    });
    if(response.status!==200){
        console.log('Problem downloading launch date');
        throw new Error('Launch data failed')
    }//如果没有响应，则返回错误

    const launchDocs=response.data.docs;
    for(const launchDoc of launchDocs){
        const payloads=launchDoc['payloads'];
        const customers=payloads.flatMap((payload)=>{
            return payload['customers'];
        })//扁平化处理
        //分类加入launch对象
        const launch={
            flightNumber:launchDoc['flight_number'],
            mission:launchDoc['name'],
            rocket:launchDoc['rocket']['name'],
            launchDate:launchDoc['date_local'],
            upcoming:launchDoc['upcoming'],
            success:launchDoc['success'],
            customers,
        }
        console.log(`${launch.flightNumber} ${launch.mission}`);
        saveLaunch(launch);

    }
}

//加载数据，如果第一次的数据已加入，则不重新加载
async function loadLaunchData(){
    const firstLaunch =await findLaunch({
        flightNumber:1,
        rocket:'Falcon 1',
        mission:'FalconSat',
    });
    if(firstLaunch){
        console.log('Launch data already loaded');
    }else{
        await populateLaunches();
    }
    
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber:launchId,
    });
}

async function getLatestFlightNumber(){
    const latestLaunch=await launchesDatabase
        .findOne({})
        .sort('-flightNumber');//按照flightNumber逆序排号来得到末尾的号
    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

//保存launch到数据库
async function saveLaunch(launch){
    await launchesDatabase.findOneAndUpdate({
        flightNumber:launch.flightNumber,
    },launch,{
        upsert:true,
    })//如果已经存在flightNumber则更新，没有则插入
}

async function getAllLaunches(skip,limit){
    return await launchesDatabase
    .find({},{
        '_id':0,'__v':0,//不显示_id,__v
    })
    .sort({flightNumber:1})
    .skip(skip)
    .limit(limit)
}

//安排新的发射
async function scheduleNewLaunch(launch){
    //检测目的地是否合法
    const planet=await planets.findOne({
        keplerName:launch.target,
    })
    if(!planet){
        throw new Error('No matching planet found')
    }
    
    const newFlightNumber=await getLatestFlightNumber() +1;
    const newLaunch=Object.assign(launch,{
        flightNumber:newFlightNumber,
        customer:['Zero to Mastery','NASA'],
        upcoming:true,
        success:true,
    })
    await saveLaunch(newLaunch);
}

// function addNewLaunch(launch){
//     latestFlightNumber++;
//     launches.set(latestFlightNumber,Object.assign(launch,{
//         flightNumber:latestFlightNumber,
//         customer:['Zero to Mastery','NASA'],
//         upcoming:true,
//         success:true
//     }));
// }

async function abortLaunchById(launchId){
    // const aborted=launches.get(launchId);
    // aborted.upcoming=false;
    // aborted.success=false;
    // return aborted;
   const aborted= await launchesDatabase.updateOne({
        flightNumber:launchId,
    },{
        upcoming:false,
        success:false,
    });
    
    return aborted.ok===1&& aborted.nModified===1;
}

module.exports={
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
}