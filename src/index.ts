import express from "express";
import dsrRouter from "./dsr/routes.js";
import bodyParser from 'body-parser'
import { dbConn } from "./database/conn.js";
import DsrResolver from "./dsr/resolvers.js";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import RedisService from "./dsr/services/redisservice.js";


const app = express()
dbConn()
await RedisService.getConnection()

app.use(express.json())
app.use(bodyParser())

const schema =  await buildSchema({
  resolvers: [DsrResolver] as const
})

const graphqlServer = new ApolloServer({ schema })
await graphqlServer.start()

graphqlServer.applyMiddleware({
    app,path: "/dsr-g"
 })

app.use("/dsr", dsrRouter)

app.get("/", function(req, res){
res.json({ api: "y" })
})



export const server = app