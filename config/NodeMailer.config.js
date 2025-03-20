const nodeMailer = require('nodemailer');

const html = `
  <h1>Your Response has been Recorded</h1>
  <p>Have a nice day 👋</p>
  <img src="${process.env.SRC}" width="400">
  `; 

const mail=async(sender, context)=>{
  try{
    const transporter = nodeMailer.createTransport({
      service:'gmail',
      secure:true,
      port:465,
      auth:{
        user:process.env.FROM,
        pass:process.env.PASS
      }
    });

    const info = await transporter.sendMail({
      from:process.env.FROM,
      to:sender,
      subject:(context) ? "Join Univens Now" : 'Thank You For Visiting Univens',
      html: context||html, 
    });
    return true;
  }catch(err){
    console.log("Message Error",err);
    return false;
  }
  
}

module.exports = mail;

