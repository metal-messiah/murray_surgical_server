const nodemailer = require('nodemailer');
const staffEmails = [ 'murraysurgicalinfo@gmail.com', 'megan@murraysurgical.com' ];
// const staffEmails = [ 'jopethemetalmessiah@gmail.com' ];

const getSubject = (response, name) => {
	console.log('subject name: ', name);
	if (response === 'no') {
		return `${name ? name + ' - ' : ''}Appointment Cancelled`;
	}
	if (response === 'yes') {
		return `${name ? name + ' - ' : ''}Appointment Confirmed`;
	}
};

const sendEmail = (subject, message, html) => {
	try {
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS
			}
		});

		var mailOptions = {
			from: 'Murray Surgical Notifications',
			to: staffEmails.join(', '),
			bcc: [ process.env.EMAIL_USER ],
			subject: subject,
			text: message,
			html: html
		};

		transporter.sendMail(mailOptions, function(error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('NOTIFIED!: ', notified);
			}
		});
	} catch (e) {
		console.log(e);
	}
};

module.exports = { sendEmail, getSubject, staffEmails };
