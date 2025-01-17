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
    save(req, res) {
        console.log(req.body);
        var data = req.body;
        var name = data.name;
        var duration = data.duration;
        var file = data.file;
        var album_id = data.album_id;

        conexion.query(
            'INSERT INTO song (name, duration, file, album_id) VALUES (?, ?, ?, ?)',
            [name, duration, file, album_id],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error, inténtalo más tarde' });
                } else {
                    res.status(200).send({ message: 'Datos guardados' });
                }
            }
        );
    },

    
    list(req, res) {
        var id = parseInt(req.params.id); // Corregir aquí
        var sql = 'SELECT * FROM song WHERE album_id = ' + id;
        console.log(sql)
        conexion.query(
            sql,
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
        conexion.query('DELETE FROM song WHERE number=?', [id], function (err, results, fields) {
            if (!err) {
                if (results.affectedRows != 0) {
                    res.status(200).send({ message: "Datos eliminados" });
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
        var sql = 'UPDATE song SET ? WHERE number=?';

        conexion.query(sql, [data, id], function (err, results, fields) {
            if (!err) {
                console.log(results);
                res.status(200).send({ message: "Datos actualizados" });
            } else {
                console.log(err);
                res.status(500).send({ message: "Inténtelo más tarde" });
            }
        });
    },
    uploadSong(req, res) {
        var id = req.params.id;
        var file = 'Sin video..';
        
        if (req.files) {
            var file_path = req.files.file.path;
            var file_split = file_path.split('\\'); //cambiar en linux por \/
            var file_name = file_split[2];
            var ext = file_name.split('.');
            var file_ext = ext[1].toLowerCase();  
            if (['mov', 'avi', 'mp3'].includes(file_ext)) {
                conexion.query('UPDATE song SET file="'+file_name+'" WHERE id = '+id,
                function(err, results, fields){
                    if (!err) {
                        console.log(err);
                        if (results.affectedRows != 0) {
                            res.status(200).send({message: 'Canción actualizada'});
                        } else {
                            console.log()
                            res.status(200).send({message: 'Error al actualizar'});
                        }
                    } else {
                        console.log(err);
                        res.status(200).send({message: 'Inténtelo más tarde'});
                    }
                });
            } else {
                res.status(400).send({message: 'Formato de canción no válido'});
            }
        } else {
            res.status(400).send({message: 'No se proporcionó ningún archivo'});
        }
    },
    getSong(req, res) {
        var file = req.params.file;
        var path_file = './uploads/song/' + file;
        console.log(path_file)
        if (fs.existsSync(path_file)) {
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(404).send({ message: 'No existe el archivo' })
        }
    },
    delSong(req, res) {
        id = req.params.id;
        var sql = "SELECT file FROM song WHERE id = " + id;
        
        conexion.query(sql, function (err, results, fields) {
            if (!err) {
                if (results.length != 0) {
                    if (results[0].image != null) {
                        console.log(results);
                        // Eliminar la imagen física
                        var path_file = './uploads/song/' + results[0].image;
                        try {
                            // Una vez que la borraste, actualizar y poner un null
                            fs.unlinkSync(path_file);  
                            const updateSql = "UPDATE song SET file = NULL WHERE id = " + id;
                            conexion.query(updateSql, function (updateErr, updateResults) {
                                if (!updateErr) {
                                    console.log("Base de datos actualizada con éxito");
                                    res.status(200).send({ message: "Imagen eliminada" });
                                } else {
                                    console.log(updateErr);
                                    res.status(500).send({ message: "Error al actualizar la base de datos" });
                                }
                            });
                            
                        } catch (error) {
                            console.log(error);
                            res.status(200).send({ message: "No se pudo eliminar, intenta más tarde" });
                        }
                    } else {
                        res.status(404).send({ message: "Canción no encontrada" });
                    }
                } else {
                    res.status(404).send({ message: "Canción no encontrada" });
                }
            } else {
                console.log(err);
                res.status(500).send({ message: "Intenta más tarde" });
            }
        });
    },
}
