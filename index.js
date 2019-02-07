const express = require('express');
const webserver = express();
const http = require('http').Server(webserver);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const { getInitialMessage, getResponse, getStaffNotification } = require('./messages.js');
const { sendEmail, getSubject } = require('./emailer/emailer.js');

const staffNumbers = [ '18018915076', '18015569549' ];
// const staffNumbers = [ '18019415824' ];

const postAuthKey = process.env.AUTH_KEY;

const massive = require('massive');
massive(process.env.MASSIVE).then((dbInstance) => {
	console.log('SET GLOBAL DB INSTANCE');

	//   webserver.set("db", dbInstance);
	//   globalDBInstance = dbInstance;

	webserver.use((req, res, next) => {
		try {
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE, PATCH');

			// res.setHeader('Access-Control-Allow-Methods', '*');
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

	webserver.post('/api/preview-sms', (req, res) => {
		try {
			let { to, name, date, time, authKey, isSpanish } = req.body;
			let lang = isSpanish ? 'es' : 'en';
			if (authKey === postAuthKey) {
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

					const msg = getInitialMessage(name, date, time, lang);
					res.status(200).send(msg);
				} else {
					res.status(400).send('missing param');
				}
			} else {
				res.status(403).send('Invalid Key');
			}
		} catch (err) {
			console.log(err);
			res.status(500).send(err);
		}
	});

	webserver.post('/api/send-sms', (req, res) => {
		try {
			let { to, name, date, time, authKey, isSpanish } = req.body;
			let lang = isSpanish ? 'es' : 'en';
			if (authKey === postAuthKey) {
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

					const msg = getInitialMessage(name, date, time, lang);

					// tempContacts[to] = { name, date, time };

					dbInstance.get_contact([ to.replace(/\+/g, '') ]).then((contacts) => {
						if (contacts.length) {
							// contact already exists
							dbInstance
								.update_contact([ name, to.replace(/\+/g, ''), date, time, new Date(), lang ])
								.then(() => {
									dbInstance.update_response([ to.replace(/\+/g, ''), null, new Date() ]).then(() => {
										console.log('updated contact');
									});
								});
						} else {
							// contact doesnt exist, add it
							dbInstance.add_contact([ name, to.replace(/\+/g, ''), date, time, lang ]).then(() => {
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
			} else {
				res.status(403).send('Invalid Key');
			}
		} catch (err) {
			console.log(err);
			res.status(500).send(err);
		}
	});

	webserver.post('/api/receive-sms', (req, res) => {
		const { Body, From } = req.body;
		let bodyText = Body.toLowerCase();
		let fromNumber = From.replace(/\+/g, '').trim();

		const twiml = new MessagingResponse();

		dbInstance
			.get_contact([ fromNumber.replace(/\+/g, '') ])
			.then((contacts) => {
				let contactName = '';
				let lang = 'en';

				if (contacts.length) {
					const contact = contacts[0];
					contactName = contact.name;
					console.log('getting response in lang: ', contact.lang);
					lang = contact.lang;

					dbInstance.update_response([ fromNumber, bodyText, new Date() ]);
				}

				if (bodyText === 'no' || bodyText === 'yes' || bodyText === 'si') {
					const subject = getSubject(bodyText, contactName);
					const msg = getStaffNotification(bodyText, fromNumber, contactName);
					const html = msg;

					sendEmail(subject, msg, html);

					staffNumbers.forEach((n) => {
						client.messages
							.create({
								body: msg,
								from: '+13852472023',
								to: n
							})
							.then((message) => console.log('notified ' + n))
							.done();
					});
				}

				console.log(lang);
				const response = getResponse(bodyText, lang);
				twiml.message(response);

				res.writeHead(200, { 'Content-Type': 'text/xml' });
				res.end(twiml.toString());
			})
			.catch((err) => res.end());
	});

	webserver.post('/api/contacts', (req, res) => {
		const { authKey } = req.body;
		if (authKey === postAuthKey) {
			dbInstance
				.get_all_contacts([])
				.then((contacts) => {
					res.status(200).send(contacts);
				})
				.catch((err) => res.status(500).send(err));
		} else {
			res.status(403).send('Not Authorized');
		}
	});

	webserver.delete('/api/contacts/:id', (req, res) => {
		const { authKey } = req.body;
		const { id } = req.params;
		if (authKey === postAuthKey) {
			dbInstance
				.delete_contact([ id ])
				.then(() => {
					dbInstance
						.get_all_contacts([])
						.then((contacts) => {
							res.status(200).send(contacts);
						})
						.catch((err) => res.status(500).send(err));
				})
				.catch((err) => res.status(500).send(err));
		} else {
			res.status(403).send('Not Authorized');
		}
	});

	webserver.patch('/api/contacts/:id', (req, res) => {
		const { name, phone, date, time, response, lang, authKey } = req.body;
		const { id } = req.params;
		if (authKey === postAuthKey) {
			dbInstance
				.get_contact_by_id([ id ])
				.then((contacts) => {
					const contact = contacts[0];
					if (contact) {
						contact.name = name ? name : contact.name;
						contact.phone = phone ? phone : contact.phone;
						contact.date = date ? date : contact.date;
						contact.time = time ? time : contact.time;
						contact.response = response ? response : contact.response;
						contact.lang = lang ? lang : contact.lang;

						dbInstance
							.update_contact_by_id([
								contact.name,
								contact.phone,
								contact.date,
								contact.time,
								new Date(),
								contact.lang,
								id
							])
							.then(() => {
								res.status(200).send(true);
							})
							.catch((err) => res.status(500).send(err));
					} else {
						res.status(404).send('No Resource Found For ID ' + id);
					}
				})
				.catch((err) => res.status(500).send(err));
		} else {
			res.status(403).send('Not Authorized');
		}
	});

	http.listen(port, function() {
		console.log('listening on ' + port);
	});
});
