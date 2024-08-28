var express = require('express');
var router = express.Router();
var conexion = require('../database/db');
function fecha(x){
  let f = new Date(x);
  let mes= f.getMonth()+Number(1);
  let fecha = f.getDate()+"/"+mes+"/"+f.getUTCFullYear();
  return fecha;
}
function fechabd(x){
  let f = new Date(x);
  let mes= f.getMonth()+Number(1);
  let fecha = `${f.getUTCFullYear()}-${mes}-${f.getDate()};`
  return fecha;
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/modelos', function(req, res, next) {
  res.render('modelos', { title: 'Express' });
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

router.get('/modeloEntreFecha',(req,res)=>{
  let fini=req.query.fini;
  let ffin=req.query.ffin;
  let molde=req.query.molde;

  let sql = `CALL modeloEntreFecha('${fini}','${ffin}','${molde}')`
  conexion.query(sql,(err,result)=>{
    
    if (!err) {
      res.send(result[0]);
    }else{
      console.log(err);
    }
  })

})
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
router.post('/editarTornillo',(req,res)=>{
  let fecha=req.body.fecha;
  let observaciones = req.body.observaciones;
  let gima=req.body.gima;
  const sql = `UPDATE tornillosInyectoras SET ftornillo='${fecha}', observaciones='${observaciones}' WHERE gima='${gima}'` ;
  conexion.query(sql,(err,rows)=>{
    if (!err) {
      res.redirect('/tornillos');
    }else{
      res.send("Error al tratar de realizar la actualizacion de los datos:"+err)
    }
  })
  
})
module.exports = router;
