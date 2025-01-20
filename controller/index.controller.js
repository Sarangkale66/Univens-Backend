module.exports.indexControl = (req,res,next)=>{
  res.status(200).json({
    message:"hello world",
  });
}