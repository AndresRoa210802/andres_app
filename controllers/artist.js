var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt'); // Importar el servicio
var fs = require('fs');//manejo de archivos FileSystem
var path = require('path');//Rutas o Ubicaciones

const conn = require('mysql2');

const conexion = conn.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mydb'
});

module.exports = {
    // Operaciones CRUD para la entidad artist
    save(req, res) {
        console.log(req.body);
        var data = req.body;
        var name = data.name;
        var description = data.description;
        var image = data.image;

        conexion.query(
            'INSERT INTO artist (name, description) VALUES (?, ?)',
            [name, description, image],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error, inténtalo más tarde' });
                } else {
                    res.status(200).send({ message: 'Datos del artista guardados' });
                }
            }
        );
    },

    list(req, res) {
        conexion.query(
            'SELECT * FROM artist',
            function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results });
                } else {
                    res.status(500).send({ message: 'Error: inténtalo más tarde' });
                }
            }
        );
    },

    delete(req, res) {
        var id = req.params.id;
        conexion.query('DELETE FROM artist WHERE id=?', [id], function (err, results, fields) {
            if (!err) {
                if (results.affectedRows != 0) {
                    res.status(200).send({ message: "Datos del artista eliminados" });
                } else {
                    res.status(200).send({ message: "No se eliminó nada" });
                }
            } else {
                console.log(err);
                res.status(500).send({ message: "Inténtelo más tarde" });
            }
        });
    },

    update(req, res) {
        var id = req.params.id;
        var data = req.body;
        var sql = 'UPDATE artist SET ? WHERE id=?';

        conexion.query(sql, [data, id], function (err, results, fields) {
            if (!err) {
                console.log(results);
                res.status(200).send({ message: "Datos del artista actualizados" });
            } else {
                console.log(err);
                res.status(500).send({ message: "Inténtelo más tarde" });
            }
        });
    },
    uploadImage(req, res) {
        var id = req.params.id;
        var file = 'Sin imagen..';
        
        if (req.files) {
            var file_path = req.files.image.path;
            var file_split = file_path.split('\\'); //cambiar en linux por \/
            var file_name = file_split[2];
            var ext = file_name.split('.');
            var file_ext = ext[1].toLowerCase();  
            if (['jpg', 'gif', 'png', 'jpeg'].includes(file_ext)) {
                conexion.query('UPDATE artist SET image="'+file_name+'" WHERE id = '+id,
                function(err, results, fields){
                    if (!err) {
                        console.log(err);
                        if (results.affectedRows != 0) {
                            res.status(200).send({message: 'Imagen actualizada'});
                        } else {
                            res.status(200).send({message: 'Error al actualizar'});
                        }
                    } else {
                        console.log(err);
                        res.status(200).send({message: 'Inténtelo más tarde'});
                    }
                });
            } else {
                res.status(400).send({message: 'Formato de imagen no válido'});
            }
        } else {
            res.status(400).send({message: 'No se proporcionó ningún archivo'});
        }
    },
    getImage(req, res){
        var image = req.params.image;
        var path_file = './uploads/artist/'+image;
        console.log(path_file)
        if(fs.existsSync(path_file)){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(404).send({message: 'No existe el archivo'})
        }
    }

};
