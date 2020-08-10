var express 			= require('express');
var router 				= express.Router();
var session       = require('express-session');
var bodyParser 		= require('body-parser');
var con 				  = require('../db');
const Cryptr 			= require('cryptr');
const cryptr 			= new Cryptr('myTotalySecretKey');


var date = new Date();
var dateStr = date.getFullYear() + "-" +("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2) + " " +("00" + date.getHours()).slice(-2) + ":" +("00" + date.getMinutes()).slice(-2) + ":" +("00" + date.getSeconds()).slice(-2);
var datenow = dateStr;

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Pretest Privy ID'})
});

/* GET home page. */
router.get('/home', function(req, res, next) {
	res.render('index', { title: 'Pretest Privy ID'})
});


// Open Form Login
router.get('/login', function(req, res, next) {
	req.session.destroy(); 
    req.session = null;
	res.render('login', { title: 'Daftar User Baru'})
});

//
router.get('/logout', function(req, res, next) {
	req.session.destroy(); 
    req.session = null;
	res.redirect('/')
});
// Request Login
router.post('/process/login', function(req, res, next) {
	var email 		= req.body.email
	var password 	= cryptr.encrypt(req.body.password)
	con.query("SELECT * FROM user WHERE email = '"+email+"' ", function(err, rows){
		if (err) {
			res.json({code:400, title_pesan:'Login Gagal', pesan:'Kesalahan dalam query '+err})
		}else{
			if (rows.length > 0) {
				if (cryptr.decrypt(rows[0].password) == req.body.password) {
					req.session.userID = rows[0].id
					res.json({code:200, title:'Login Berhasil', pesan:'Selamat. Anda akan dialihkan ke halaman utama'})
				}else{
					res.json({code:200, title:'Login Gagal', pesan:'Periksa kembali password anda'})
				}
			}else{
				res.json({code:204, title:'Login Gagal', pesan:'Email tidak terdaftar, silakan daftarkan email anda'})
			}
		}
	})
});


// Open Form Register
router.get('/register', function(req, res, next) {
	res.render('register', { title: 'Daftar User Baru'})
});

// Action Register 
router.post('/process/register', function(req, res, next) {
	var cdate   = new Date();
	var year    = cdate.getFullYear().toString();
	var month   = (cdate.getMonth() + 101).toString().substring(1);
	var day     = (cdate.getDate() + 100).toString().substring(1);

	var account = '10'+year+month+day+Math.floor(Math.random() * 1000)
	
	var data = {
		username: 	req.body.username,
		email: 		req.body.email,
		password: 	cryptr.encrypt(req.body.password),
		account: 	account
	}

	con.query("SELECT * FROM user WHERE email = '"+req.body.email+"' ", function(errcek, rowscek){
		if (rowscek.length > 0) {
			res.json({code:201, title:'Pendaftaran Gagal', pesan:'Email sudah terdaftar. Silakan login untuk masuk ke profil anda'})
		}else{
			con.query("INSERT INTO user SET ? ", data, function(err, rows){
				if (err) {
					res.json({code:400, title:'Pendaftaran Gagal', pesan:'Maaf, silakan ulangi pendaftaran'})
				}else{
					con.query("SELECT * FROM user ORDER BY id DESC LIMIT 1", function(error, result){
						var myid 	= result[0].id
						var balance = {
							user_id : 			myid,
							balance: 			0,
							balance_achieve: 	0
						}
						con.query("INSERT INTO user_balance SET ? ", balance)
					})
					res.json({code:200, title:'Pendaftaran Berhasil', pesan:'Selamat, pendaftaran berhasil. Anda akan dialihkan ke halaman utama'})
				}
			})
		}
	})
});

/* GET USER INFO */
router.get('/profile', function(req, res, next) {
	if (req.session.userID) {
		con.query("SELECT * FROM user_balance WHERE user_id = '"+req.session.userID+"' ", function(err, rows){
			con.query("SELECT * FROM user WHERE user_id = '"+req.session.userID+"' ", function(err2, rows2){
				res.render('profile', { title: 'My Profile | Balance', saldo:rows, info:rows2})
			})
		})
	}else{
		res.redirect('/login')
	}
});

router.get('/user/info', function(req, res, next) {
	if (req.session.userID) {
		con.query("SELECT * FROM user WHERE id = '"+req.session.userID+"' ", function(err, rows){
			if (rows.length > 0) {
				con.query("SELECT * FROM user_balance WHERE user_id = '"+req.session.userID+"' ", function(err2, rows2){
					res.json({code:200, title:'Hai, '+rows[0].username, account_number:rows[0].account, saldo:rows2[0].balance})
				})
			}else{
				res.json({code:200, title:'Pengguna Tidak Ditemukan', account_number:'-'})
			}
		})
	}else{
		res.redirect('/login')
	}
});


// Action TopUp 
router.post('/process/topup', function(req, res, next) {
	if (req.session.userID) {
		var amount = req.body.amount.split('Rp').join('').split(' ').join('').split('.').join('')

		con.query("SELECT * FROM user_balance WHERE user_id = '"+req.session.userID+"' ", function(err, rows){
			var balance_before 	= rows[0].balance
			var balance_after 	= parseInt(balance_before) + parseInt(amount)

			var data = {
				user_balance_id : 	rows[0].id,
				balance_before : 	balance_before,
				balance_after : 	balance_after,
				activity : 			"Top Up Mandiri",
				type : 				"topup",
				author : 			req.session.userID,
				datecreate : 		datenow
			}

			// Update User Balance
			con.query("INSERT INTO user_balance_history SET ? ", data, function(err2, rows2){
				if (err2) {

				}else{
					con.query("UPDATE user_balance SET balance = '"+balance_after+"', balance_achieve = '"+balance_after+"' ");
					res.json({code:200, title:'Top Up Berhasil', message:'Saldo anda saat ini Rp '+balance_after.toLocaleString().split(',').join('.'), saldo:balance_after.toLocaleString().split(',').join('.')})
				}
			})
		})
	}else{
		res.redirect('/login')
	}
});

// Action Transfer 
router.post('/process/transfer', function(req, res, next) {
	if (req.session.userID) {
		var amount 			= req.body.amount.split('Rp').join('').split(' ').join('').split('.').join('')
		var account_tujuan 	= req.body.rek_tujuan

		con.query("SELECT b.*, u.account FROM user_balance b INNER JOIN user u ON b.user_id = u.id WHERE user_id = '"+req.session.userID+"' ", function(err, rows){
			var mybalance_before 	= rows[0].balance
			var mybalance_after 	= parseInt(mybalance_before) - parseInt(amount)
			var myaccount 			= rows[0].account

			if (mybalance_before > amount) {
				var data = {
					user_balance_id : 	rows[0].id,
					balance_before : 	mybalance_before,
					balance_after : 	mybalance_after,
					activity : 			"Transfer Ke "+account_tujuan,
					type : 				"transfer",
					author : 			req.session.userID,
					datecreate : 		datenow
				}

				// Update My Balance
				con.query("INSERT INTO user_balance_history SET ? ", data, function(err2, rows2){
					if (err2) {
						res.json({code:400, title:'Top Up Gagal', message:'Kesalahan Pada Sistem', saldo:balance_after.toLocaleString().split(',').join('.')})
					}else{
						con.query("UPDATE user_balance SET balance = '"+mybalance_after+"', balance_achieve = '"+mybalance_after+"' WHERE user_id = '"+req.session.id+"' ");

						// Update Rekening Tujuan
						con.query("SELECT b.*, u.account FROM user_balance b INNER JOIN user u ON b.user_id = u.id WHERE account = '"+account_tujuan+"' ", function(err3, rows3){
							if (rows3.length > 0) {
								var hisbalance_before 	= rows3[0].balance
								var hisbalance_after 	= parseInt(hisbalance_before) + parseInt(amount)

								var data2 = {
									user_balance_id : 	rows3[0].id,
									balance_before : 	hisbalance_before,
									balance_after : 	hisbalance_after,
									activity : 			"Transfer Dari "+myaccount,
									type : 				"kredit",
									author : 			req.session.userID,
									datecreate : 		datenow
								}
								con.query("INSERT INTO user_balance_history SET ? ", data2, function(err4, rows4){
									con.query("UPDATE user_balance SET balance = '"+hisbalance_after+"', balance_achieve = '"+hisbalance_after+"' WHERE user_id = '"+rows3[0].user_id+"' ");
									res.json({code:200, title:'Transfer Berhasil', message:'Dana sudah diteruskan ke account '+account_tujuan, saldo:mybalance_after.toLocaleString().split(',').join('.')})
								})
							}else{
								res.json({code:204, title:'Transfer Gagal', message:'Account '+account_tujuan+' tidak ditemukan. Periksa kembali rekening tujuan anda', saldo:mybalance_after.toLocaleString().split(',').join('.')})
							}
						})
					}
				})
			}else{
				res.json({code:202, title:'Transfer Gagal', message:'Saldo anda tidak cukup untuk melakukan transaksi', saldo:mybalance_after.toLocaleString().split(',').join('.')})
			}
		})
	}else{
		res.redirect('/login')
	}
});


/* GET USER HISTORY */
router.get('/user/history', function(req, res, next) {
	if (req.session.userID) {
		con.query("SELECT * FROM user_balance_history WHERE user_balance_id = '"+req.session.userID+"' ORDER BY datecreate DESC ", function(err, rows){
			res.json({code:200, data:rows})
		})
	}else{
		res.redirect('/login')
	}
});

module.exports = router;
