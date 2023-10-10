var express = require('express');
var router = express.Router();
var conexion = require('../database/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/moldesEntreFecha',(req,res)=>{
  let fini=req.query.fini;
  let ffin=req.query.ffin;
  let molde=req.query.molde;

  let sql = `CALL moldeEntreFecha('${fini}','${ffin}','${molde}')`
  conexion.query(sql,(err,result)=>{
    if (!err) {
      res.send(result[0]);
    }else{
      console.log(err);
    }
  })

})
router.get('/tornillos',(req,res)=>{
  
  let sql1 = 'SELECT distinct GIMA FROM contadoresInyeccion';
  let sql2 = 'CALL tornillosMaquina(?,?)';
  res.render('tornillos');
})
module.exports = router;
