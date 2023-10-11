var express = require('express');
var router = express.Router();
var conexion = require('../database/db');
function fecha(x){
  let f = new Date(x);
  let fecha = f.getDate()+"/"+f.getMonth()+"/"+f.getUTCFullYear();
  return fecha;
}
function fechabd(x){
  let f = new Date(x);
  let mes= (f.getMonth()+1)
  let fecha = `${f.getUTCFullYear()}-${mes}-${f.getDate()};`
  return fecha;
}
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
  
  let sql1 = 'SELECT * FROM tornillosInyectoras';
  let sql2 = `CALL tornillosMaquina("2023-08-01","Gima 02")`;
  let resultado=[];
  conexion.query(sql1,async(err,result)=> {
    
    if (!err) {
      result.map(e =>{
         
         conexion.query(`CALL tornillosMaquina("${fechabd(e.ftornillo)}","${e.gima}")`,(error,result1)=>{
          
          if(!error && result1[0][0].GIMA==e.gima){
            let r={
              Gima:result1[0][0].GIMA,
              Golpes:result1[0][0].golpes,
              ftornillo:fecha(result1[0][0].ftornillo),
              observaciones:result1[0][0].observaciones
            }
           console.log(r)
         
           
          }
          
  })
      })
       await console.log(resultado)
       await res.render('tornillos');
       
    }
  })
 
 
})
module.exports = router;
