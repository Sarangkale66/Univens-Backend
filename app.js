require('dotenv').config()
const express=require('express');
const cors = require('cors')
const app=express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const connectDB = require('./config/mongdb.connection')
connectDB();

const indexRoute = require('./routes/index.route');
const userRoute = require('./routes/user.route');
const fileRoute = require('./routes/file.route');

app.use("/",indexRoute);
app.use("/user",userRoute);
app.use("/file",fileRoute);

const port = process.env.PORT||3000;
app.listen(port,()=>{
  console.log(`server run on http://localhost:${port}`);
})