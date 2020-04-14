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
    controller.getMessagesFrom1(req,res);
    // controller.getAllRecipes(req,res);
});
router.post("/message",(req,res)=>{
    controller.postMessage(req,res);
});

router.get("/messageFrom/:room&:dateFrom&:typeDate",(req,res)=>{
    controller.getMessageFrom(req,res);
})
module.exports=router;
