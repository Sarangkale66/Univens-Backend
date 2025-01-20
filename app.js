require('dotenv').config()
const express=require('express');
const app=express();

const connectDB = require('./config/mongdb.connection')
connectDB();

const indexRoute = require('./routes/index.route');
const userRoute = require('./routes/user.route');
const fileRoute = require('./routes/file.route');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/",indexRoute);
app.use("/user",userRoute);
app.use("/file",fileRoute);

app.listen(process.env.PORT||3000,()=>{
  console.log("server run on http://localhost:3000");
})