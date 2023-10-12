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
  let mes= (f.getMonth())
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
/*router.get('/tornillos',async (req,res)=>{
  
  let sql1 = ['Gima 01,'];
  let resultado=[];
   await conexion.query(sql1, (err,result)=> {
    
    if (!err) {
      for(let i=0;result.length;i++){
        conexion.query(`CALL tornillosMaquina("${fechabd(result.ftornillo)}","${result.gima}")`,(error,result1)=>{
          console.log(result1)
          if(!error && result1[0][0].GIMA==result.gima){
            let r={
              Gima:result1[0][0].GIMA,
              Golpes:result1[0][0].golpes,
              ftornillo:fecha(result1[0][0].ftornillo),
              observaciones:result1[0][0].observaciones
            }
            console.log(r);
           resultado.push(r);
           
          }
          
          })
      }

       /*await result.map(e =>{
         
         conexion.query(`CALL tornillosMaquina("${fechabd(e.ftornillo)}","${e.gima}")`,(error,result1)=>{
        
          if(!error && result1[0][0].GIMA==e.gima){
            let r={
              Gima:result1[0][0].GIMA,
              Golpes:result1[0][0].golpes,
              ftornillo:fecha(result1[0][0].ftornillo),
              observaciones:result1[0][0].observaciones
            }
           resultado.push(r);
           
          }
          
          })
      }
       
       res.render('tornillos');
       console.log(resultado)
    })
  })*/

  router.get('/tornillos', async (req, res) => {
    try {
      const sql1 = 'SELECT * FROM tornillosInyectoras';
      const result = await new Promise((resolve, reject) => {
        conexion.query(sql1, (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
  
      const promises = result.map((e) => {
        return new Promise((resolve, reject) => {
          conexion.query(`CALL tornillosMaquina("${fechabd(e.ftornillo)}", "${e.gima}")`, (error, result1) => {
            if (!error && result1[0][0].GIMA == e.gima) {
              let r = {
                Gima: result1[0][0].GIMA,
                Golpes: result1[0][0].golpes,
                ftornillo: fecha(result1[0][0].ftornillo),
                observaciones: result1[0][0].observaciones,
              };
  
              resolve(r);
            } else {
              console.error(error);
              resolve(null); // Resuelve con null en caso de error para que no rompa Promise.all
            }
          });
        });
      });
  
      // Usar Promise.all para esperar a que todas las promesas se resuelvan
      const resultsArray = await Promise.all(promises);
  
      // Filtrar los resultados nulos y enviar solo los resultados válidos
      const validResults = resultsArray.filter((result) => result !== null);
  
      res.render('tornillos',{resultados:validResults}); // Enviar los datos al cliente o hacer algo más con ellos
    } catch (error) {
      console.error(error);
      res.status(500).send('Error en la consulta');
    }
  });
module.exports = router;
