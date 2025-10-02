const asyncHandler = (requestHandler)=>{             // promises vala another method 
    (req, res ,next)=>{
        Promise.resolve(requestHandler(req, res , next)).
        catch((err)=> next(err))
    }
}                             

export {asyncHandler}





//const asyncHAndler = ()=>{}
//const asyncHAndler = (func)=> { ()=>{} }
//const asyncHandler = (func)=>  async ()=>{}

// const asyncHandler = (func)=> aync (req, res ,next)=>{
//     try{

//         await func( req, res ,next)
//     }catch(error){
//         res.status(err.code || 500).json({
//             success : false ,
//             message : err.message

//         }))
//     }
// } 