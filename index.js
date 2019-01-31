const express = require('express');
const webserver = express();
const http = require('http').Server(webserver);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const accountSid = 'AC564fb9d03a6a8f27b93504d3c4a402f2';
const authToken = 'e642e5d29c7fef672b969bb27ecd215f';
const client = require('twilio')(accountSid, authToken);

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
		let { to, msg } = req.body;

		if (to) {
			if (msg) {
				if (typeof to === 'number') {
					to = to.toString();
				}

				to = `+${to}`;

				to = to.replace(/[^0-9]/g, '');

				console.log(to, msg);
				client.messages
					.create({
						body: msg,
						from: '+13852472023',
						to: to
					})
					.then((message) => res.status(200).send(message))
					.done();
			} else {
				res.status(400).send("'msg' param is required");
			}
		} else {
			res.status(400).send("'to' param is required");
		}
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
});

http.listen(port, function() {
	console.log('listening on ' + port);
});
