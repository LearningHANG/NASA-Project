const request = require('supertest');//用来测试http
const app = require('../../app');
const {mongoConnect,mongoDisconnect}=require('../../services/mongo');

describe('Launches API',()=>{
    beforeAll(async ()=>{
        await mongoConnect();
    })
    afterAll(async ()=>{
        await mongoDisconnect();
    })

    describe('TEST GET /launches',()=>{
        test('It should respond with 200 success',async ()=>{
            const response = await request(app)
            .get('/v1/launches')
            .expect('Content-Type',/json/)//正则表达式
            .expect(200)
        //  expect(response.statusCode).toBe(200);
        });
    });

    describe('TEST POST /launch',() => {
        const completeLaunchDate={
            mission:'USS',
            rocket:'NCC',
            target:'Kepler-442 b',
            launchDate:'January 4,2028',
        };
        const completeLaunchWithoutDate={
            mission:'USS',
            rocket:'NCC',
            target:'Kepler-442 b',
        };

        const launchDateWithInvalidDate={
            mission:'USS',
            rocket:'NCC',
            target:'Kepler-442 b',
            launchDate:'zoot',
        };

        test('It should respond with 201 success',async ()=>{
            const response=await request(app)
                .post('/v1/launches')
                .send(completeLaunchDate)
                .expect('Content-Type',/json/)//正则表达式
                .expect(201)

            const requestDate=new Date(completeLaunchDate.launchDate).valueOf();
            const responseDate=new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(completeLaunchWithoutDate)

        });
        test('It should catch missing required properties',async ()=>{
            const response=await request(app)
                .post('/v1/launches')
                .send(completeLaunchWithoutDate)
                .expect('Content-Type',/json/)//正则表达式
                .expect(400)

            expect(response.body).toStrictEqual({
                error:'Mission required launch property'
            })   
        });
        test('It should catch invalid dates',async()=>{
            const response=await request(app)
            .post('/v1/launches')
            .send(launchDateWithInvalidDate)
            .expect('Content-Type',/json/)//正则表达式
            .expect(400);

            expect(response.body).toStrictEqual({
                error:'Invalid Launch Date'
            });
        });
    })
})

