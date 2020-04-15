const router = require('express').Router();
const controller = require('../controllers');

router.get('/messages',(req,res)=>{
    // controller.saveUser(req,res);
    // res.send("testes")
    controller.getMessages(req,res);
    // controller.getAllRecipes(req,res);
});

router.get('/messages/:user',(req,res)=>{
    // controller.saveUser(req,res);
    // res.send("testes")
    controller.getMessageFrom(req,res);
    // controller.getAllRecipes(req,res);
});
router.post("/message",(req,res)=>{
    controller.postMessage(req,res);
});

router.get("/messageFrom/:room&:dateFrom&:typeDate",(req,res)=>{
    controller.getMessageFrom(req,res);
});

router.get("/users/:room",(req,res)=>{
    controller.getPeopleConnectedByRoom(req,res);
});

// router.get("/users",(req,res)=>{
//     controller.getPeopleConnected(req,res);
// });

router.get("/user/communicateMost",(req,res)=> {
    controller.getCommunicateMost(req, res);
});

router.get("/user/communicateMost/:roomID",(req,res)=>{
    controller.getCommunicateMostPerRoom(req,res);
})

router.get("/message/countTotal",(req,res)=>{
    controller.getNumberMessageTotal(req,res);
})

router.get("/message/countTotalPerRoom/:roomID",(req,res)=>{
    controller.getNumberMessagePerRoom(req,res);
})

router.get("/message/detailContent",(req,res)=>{
    controller.getDetailsMessage(req,res);
})
module.exports=router;
