const express = require('express');
const webserver = express();
const http = require('http').Server(webserver);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const accountSid = 'AC564fb9d03a6a8f27b93504d3c4a402f2';
const authToken = 'e642e5d29c7fef672b969bb27ecd215f';
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const { getInitialMessage, getResponse, getStaffNotification } = require('./messages.js');
const { sendEmail, getSubject } = require('./emailer/emailer.js');

const massive = require('massive');
massive(
	'postgres://zlrbkyykudygdx:15bab7552e3a5bb51f456c455c8609050ff45d85670f04fb115a6f0512c7cb96@ec2-54-83-50-174.compute-1.amazonaws.com:5432/d3qeagqbti2bte?ssl=true'
).then((dbInstance) => {
	console.log('SET GLOBAL DB INSTANCE');

	//   webserver.set("db", dbInstance);
	//   globalDBInstance = dbInstance;

	webserver.use((req, res, next) => {
		try {
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
			// Note that the origin of an extension iframe will be null
			// so the Access-Control-Allow-Origin has to be wildcard.
			res.setHeader('Access-Control-Allow-Origin', '*');
			next();
		} catch (e) {
			next();
		}
	});

	webserver.use(
		bodyParser.json({
			limit: '50mb'
		})
	);

	webserver.use(
		bodyParser.urlencoded({
			limit: '50mb',
			extended: true,
			parameterLimit: 50000
		})
	);

	webserver.post('/api/send-sms', (req, res) => {
		try {
			let { to, name, date, time } = req.body;

			if (to) {
				if (typeof to === 'number') {
					to = to.toString().trim();
				}

				to = to.replace(/[^0-9]/g, '');
				if (to.length < 11) {
					to = '1' + to;
				} else {
					to = `+${to}`;
				}

				const msg = getInitialMessage(name, date, time);

				// tempContacts[to] = { name, date, time };

				dbInstance.get_contact([ to.replace(/\+/g, '') ]).then((contacts) => {
					if (contacts.length) {
						// contact already exists
						dbInstance.update_contact([ name, to.replace(/\+/g, ''), date, time ]).then(() => {
							console.log(`updated contact --> ${to} ${name}`);
						});
					} else {
						// contact doesnt exist, add it
						dbInstance.add_contact([ name, to.replace(/\+/g, ''), date, time ]).then(() => {
							console.log(`added new contact --> ${to} ${name}`);
						});
					}
				});

				client.messages
					.create({
						body: msg,
						from: '+13852472023',
						to: to
					})
					.then((message) => res.status(200).send(message))
					.done();
			} else {
				res.status(400).send('missing param');
			}
		} catch (err) {
			console.log(err);
			res.status(500).send(err);
		}
	});

	webserver.post('/api/receive-sms', (req, res) => {
		const {
			ToCountry,
			ToState,
			SmSMessageSid,
			NumMedia,
			ToCity,
			FromZip,
			SmsSid,
			FromState,
			SmsStatus,
			FromCity,
			Body,
			FromCountry,
			To,
			ToZip,
			NumSegments,
			MessageSid,
			AccountSid,
			From,
			ApiVersion
		} = req.body;
		let bodyText = Body.toLowerCase();
		let fromNumber = From.replace(/\+/g, '').trim();
		const response = getResponse(bodyText);

		if (bodyText === 'no' || bodyText === 'yes') {
			dbInstance.get_contact([ fromNumber.replace(/\+/g, '') ]).then((contacts) => {
				let contactName = '';

				if (contacts.length) {
					const contact = contacts[0];
					contactName = contact.name;
				}

				const subject = getSubject(bodyText, contactName);
				const msg = getStaffNotification(bodyText, fromNumber, contactName);
				const html = msg;

				sendEmail(subject, msg, html);
			});
		}

		const twiml = new MessagingResponse();

		twiml.message(response);

		res.writeHead(200, { 'Content-Type': 'text/xml' });
		res.end(twiml.toString());
	});

	http.listen(port, function() {
		console.log('listening on ' + port);
	});
});
