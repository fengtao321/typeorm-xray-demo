import AWSXRay from "aws-xray-sdk"
import { DataSource } from "typeorm";
import { User } from "./src/entity/user.entity";
import express from "express"
import https from "https"
import pkg from 'pg';

const { Client } = pkg;

var logger = {
    error: (message: string, meta: string) => { console.error(message, meta) },
    warn: (message: string, meta: string) => { console.warn(message, meta) },
    info: (message: string, meta: string) => { console.info(message, meta) },
    debug: (message: string, meta: string) => { console.debug(message, meta) }
}

AWSXRay.setLogger(logger);

const XRayExpress = AWSXRay.express;

// Capture all outgoing https requests
AWSXRay.captureHTTPsGlobal(https);

// Capture MySQL queries
AWSXRay.capturePostgres(pkg);

// Capture all AWS clients we create
//   const AWS = AWSXRay.captureAWS(require('aws-sdk'));
//   AWS.config.update({region: process.env.DEFAULT_AWS_REGION || 'ca-central-1'});


const app = express();
const port = 3000;

app.use(XRayExpress.openSegment('SampleSite'));
app.get('/', (_req: any, res: any) => {
    const seg = AWSXRay.getSegment();
    const sub = seg!.addNewSubsegment('customSubsegment');
    setTimeout(() => {
        sub.close();
        res.sendFile(`${process.cwd()}/index.html`);
    }, 500);
});

//   app.get('/aws-sdk/', (_req: any, res: any) => {
//     const ddb = new DynamoDB();
//     const ddbPromise = ddb.listTables().promise();

//     ddbPromise.then(function(data: any) {
//       res.send(`ListTables result:\n ${JSON.stringify(data)}`);
//     }).catch(function(err: string) {
//       res.send(`Encountered error while calling ListTables: ${err}`);
//     });
//   });

app.get('/http-request/', (_req: any, res: any) => {
    const endpoint = 'https://amazon.com/';
    https.get(endpoint, (response: any) => {
        response.on('data', () => { });

        response.on('error', (err: string) => {
            res.send(`Encountered error while making HTTPS request: ${err}`);
        });

        response.on('end', () => {
            res.send(`Successfully reached ${endpoint}.`);
        });
    });
});

app.get('/postgres/', async (req: any, res: any) => {
    const postgresConfig = {
        "config": {
            "user": "root",
            "database": "course",
            "password": "root",
            "host": "localhost"
        },
        "table": "cars"
    };
    const config = postgresConfig.config;
    const table = postgresConfig.table;

    if (!config.user || !config.database || !config.password || !config.host || !table) {
        res.send('Please correctly populate config.json');
        return;
    }

    var client = new Client(config);
    await client.connect()
    const results = await client.query(`SELECT * FROM ${table}`);
    res.send(`Retrieved the following results from ${table}:\n${JSON.stringify(results)}`);
    await client.end();

});

app.get('/typeorm/', async (req: any, res: any) => {
    const myDataSource = new DataSource({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "dev_user",
        password: "123",
        database: "ast-asea",
        entities: [User],
        logging: false,
        synchronize: true,
    })
    await myDataSource.initialize();
    const users = await myDataSource.getRepository(User).find();
    res.send(`Retrieved the following results:\n${JSON.stringify(users)}`);
    await myDataSource.destroy()
});

app.use(XRayExpress.closeSegment());

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
