
function visiblePass(){
      document.getElementById("pass-visib").style.display = "";
      document.getElementById("pass-invis").style.display = "none";

      var a = document.getElementById("password_client");
      if (a.type === 'password') {
        a.type = "text";
      }else{
        a.type = "password";
      }

}

function invisPass(){
      document.getElementById("pass-visib").style.display = "none";
      document.getElementById("pass-invis").style.display = "";

      var a = document.getElementById("password_client");
      if (a.type === 'password') {
        a.type = "text";
      }else{
        a.type = "password";
      }

}

var format = function(num){
  var str = num.toString().replace("Rp ", ""), parts = false, output = [], i = 1, formatted = null;
  if(str.indexOf(",") > 0) {
    parts = str.split(",");
    str = parts[0];
  }
  str = str.split("").reverse();
  for(var j = 0, len = str.length; j < len; j++) {
    if(str[j] != ".") {
      output.push(str[j]);
      if(i%3 == 0 && j < (len - 1)) {
        output.push(".");
      }
      i++;
    }
  }
  formatted = output.reverse().join("");
  return("Rp " + formatted + ((parts) ? "," + parts[1].substr(0, 2) : ""));
};
$(function(){
    $(".inputcurrency").keyup(function(e){
        $(this).val($(this).val().replace(/[^0-9\.]/g,''));
      if ((e.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
          event.preventDefault();
          $(this).val(format($(this).val()));
      }
    });
});

$('.btn-submit').on('click', function(e){
  event.preventDefault();
  var username   = $("#username").val()
  var email      = $("#email_client").val()
  var password   = $("#password_client").val()
     // prevent form submit
  swal({
    title: "Daftar Sekarang?",
    text: "Klik daftar untuk melanjutkan proses e-wallet",
    type: "info",
    showCancelButton: true,
    closeOnConfirm: false,
    showLoaderOnConfirm: true
  }, function (){
    setTimeout(function () {
        $.ajax({
             'url': '/process/register',
             'type': 'POST',
             'data': {
                'username' :  username,
                'email' :     email,
                'password':   password
             },
             'success': function (data) {
                if (data.code == 200) {
                  $(".btn-submit").remove()
                    swal(data.title, data.pesan, "success");
                    setTimeout(function () {
                      window.location.href = '/home';
                    }, 2000);
                }else{
                   swal(data.title, data.pesan, "error");
                }
             }
        });
    }, 2000);
  });
})

$('.btn-login').on('click', function(e){
  event.preventDefault();
  var email      = $("#email_client").val()
  var password   = $("#password_client").val()
     // prevent form submit
  $.ajax({
       'url': '/process/login',
       'type': 'POST',
       'data': {
          'email' :     email,
          'password':   password
       },
       'success': function (data) {
          console.log(data)
          if (data.code == 200) {
            $(".btn-submit").remove()
              swal(data.title, data.pesan, "success");
              setTimeout(function () {
                window.location.href = '/profile';
              }, 2000);
          }else{
            swal(data.title, data.pesan, "error");
          }
       }
  });
})

$('.submit-saldo').on('click', function(e){
  event.preventDefault();
  var amount   = $("#nominal").val()

  if (amount.length>0 && amount != 'Rp' && amount != 'Rp ') {
    swal({
      title: "Topup Sekarang?",
      text: "Klik OK untuk melanjutkan proses",
      type: "info",
      showCancelButton: true,
      closeOnConfirm: false,
      showLoaderOnConfirm: true
    }, function (){
      setTimeout(function () {
          $.ajax({
               'url': '/process/topup',
               'type': 'POST',
               'data': {
                  'amount' :     amount
               },
               'success': function (data) {
                  console.log(data)
                  if (data.code == 200) {
                    $(".btn-submit").remove()
                      swal(data.title, data.message, "success");
                      $("#txtsaldo").html(data.saldo)
                  }else{
                    swal(data.title, data.pesan, "error");
                  }
               }
          });
      }, 2000);
    });
  }else{
    swal('Isi Nominal!', 'Silakan isi nominal untuk melanjutkan topup', "info");
  }
})

// SUBMIT TRANSFER
$('.submit-tf').on('click', function(e){
  event.preventDefault();
  var amount      = $("#nominal_tf").val()
  var rek_tujuan  = $("#rekening_tujuan").val()

  if (amount.length>0 && amount != 'Rp' && amount != 'Rp ' && rek_tujuan != '') {
    swal({
      title: "Data Sudah Benar?",
      text: "Klik OK untuk melanjutkan transfer dana",
      type: "info",
      showCancelButton: true,
      closeOnConfirm: false,
      showLoaderOnConfirm: true
    }, function (){
      setTimeout(function () {
          $.ajax({
               'url': '/process/transfer',
               'type': 'POST',
               'data': {
                  'amount' :     amount,
                  'rek_tujuan' : rek_tujuan
               },
               'success': function (data) {
                  console.log(data)
                  if (data.code == 200) {
                    $(".btn-submit").remove()
                      swal(data.title, data.message, "success");
                      $("#txtsaldo").html(data.saldo)
                  }else{
                    swal(data.title, data.message, "error");
                  }
               }
          });
      }, 2000);
    });
  }else{
    swal('Isi Nominal!', 'Silakan isi nominal untuk melanjutkan topup', "info");
  }
})



// GET USER INFO
function userInfo(){
    $.ajax({
         'url': '/user/info',
         'type': 'GET',
         'success': function (data) {
            if (data.code == 200) {
              var txt = data.title+" ("+data.account_number+")";
              $("#txthai").html(txt)
              $("#txtsaldo").html(data.saldo)
            }
         }
    });
}

function userHistory(){
    $.ajax({
         'url': '/user/history',
         'type': 'GET',
         'success': function (result) {
            console.log(result)
            if (result.code == 200) {
              var txt= ""
              var counter = 1
              for (var i = 0; i < result.data.length; i++) {
                txt += "<tr>"
                txt += "<td>"+counter+"</td>"
                txt += "<td>"+result.data[i].datecreate+"</td>"
                txt += "<td>"+result.data[i].type+"</td>"
                txt += "<td>"+result.data[i].activity+"</td>"
                txt += "<td>Rp "+result.data[i].balance_before.toLocaleString().split(',').join('.')+"</td>"
                txt += "<td>Rp "+result.data[i].balance_after.toLocaleString().split(',').join('.')+"</td>"
                counter++
              }
              $("#row-histori").html(txt)
            }
         }
    });
}
