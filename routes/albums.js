var express = require('express')
var api = express.Router();
var albumController = require('../controllers/album');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: 'uploads/albums' });
var md_auth = require('../middlewares/authenticated');

api.get('/albums',[md_auth.Auth],albumController.list);
api.post('/albums',[md_auth.Auth],albumController.save);
api.delete('/albums/:id',[md_auth.Auth],albumController.delete);
api.put('/albums/:id',[md_auth.Auth],albumController.update);

api.post('/album/:id', [md_upload], albumController.uploadImage);
api.get('/albums/imagen/:image', albumController.getImage);
api.get('/albums/:id', [md_auth.Auth], albumController.getAlbumsById);


module.exports = api; 