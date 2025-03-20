require('dotenv').config()
const path = require('path');
const express=require('express');
const cors = require('cors')
const app=express();
const cookieParser = require('cookie-parser');

app.use(cors())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');

app.use((req, res, next) => {
  if (req.url === "/favicon.ico") {
    return res.status(204).end(); 
  }
  next();
});

const connectDB = require('./config/mongdb.connection')
connectDB();

const indexRoute = require('./routes/index.route');
const userRoute = require('./routes/user.route');
const fileRoute = require('./routes/file.route');
const dashboardRoute = require('./routes/dashboard.route');
const authRoute = require('./routes/auth.route');
const notificationRoute = require('./routes/notification.route')

const authMiddleware =  require('./middleware/auth.middleware')


app.use("/",indexRoute);
app.use("/auth",authRoute);
app.use(authMiddleware.isAuthenticated);
app.use("/dashboard",dashboardRoute);
app.use("/file",fileRoute);
app.use("/notification",notificationRoute)
app.use("/user",userRoute);


const port = process.env.PORT||3000;
app.listen(port,()=>{
  console.log(`server run on http://localhost:${port}`);
})