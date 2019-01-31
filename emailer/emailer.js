const nodemailer = require('nodemailer');
const staffEmails = [ 'murraysurgicalinfo@gmail.com', 'megan@murraysurgical.com' ];

const getSubject = (response, name) => {
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
				user: 'murray.surgical.notifications@gmail.com',
				pass: 'Murray$urgical2019'
			}
		});

		var mailOptions = {
			from: 'Murray Surgical Notifications',
			// to: staffEmails.join(", "),
			to: 'jopethemetalmessiah@gmail.com',
			// bcc: [ 'murray.surgical.notifications@gmail.com', 'megan@murraysurgical.com' ],
			bcc: [ 'murray.surgical.notifications@gmail.com' ],
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
