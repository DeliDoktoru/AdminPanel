const nodemailer = require("nodemailer");

module.exports=async function(){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'yunusemrahdursun2@gmail.com',
          pass: ''
        }
      });

      var mailOptions = {
        from: 'yunusemrahdursun2@gmail.com',
        to: 'yunusemrahdursun@gmail.com',
        subject: 'Sending Email using Node.js',
        html: `<html>
        <head></head>
        <body>
            <div style="text-align: center;width: 200px;height: 100px;background-color: blueviolet">
            <h1>test</h1>
            <div style="text-align: center;margin:20px 0px;width: 100%;height: 50px;background-color: cadetblue">test</div>
            </div>
        </body>
    </html>`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}