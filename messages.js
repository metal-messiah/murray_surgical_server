// const website = 'https://metal-messiah.github.io/murray_surgical';
const website = process.env.WEBSITE;
const mapLink = process.env.GOOGLE_MAPS_LINK;
const surveyLink = process.env.SURVEY_LINK;

// The First Message To Be Sent To The Client
const getInitialMessage = (name, date, time, reason, lang) => {
	if (lang === 'en') {
		return `Hi ${name}, you have a ${reason} appointment with Murray Surgical scheduled for ${date} at ${time}. Arrive 20 minutes early. Please review required pre-surgery instructions at ${website}/surgery. To confirm your appointment and that you've read the instructions, reply YES. For further questions, reply NO.`;
	}
	if (lang === 'es') {
		return `Hola ${name}, tiene una ${reason} cita con Murray Surgical para ${date} a ${time}. Por favor revise las instrucciones requeridas antes de la cirugía en ${website}/surgery. Para confirmar su cita y que ha leído las instrucciones, responda YES. Para más preguntas, responda NO.`;
	}
};

// Message To Be Sent Back To The Client When The Client Responds (Via Text)
const getResponse = (response, lang) => {
	response = response.toLowerCase();
	if (lang === 'en') {
		if (response === 'yes') {
			return `Thank you for confirming your appointment with Murray Surgical. If you have any questions, please call 801-983-6819 during normal office hours. 5801 S. Fashion Blvd. #190. ${mapLink}`;
		} else if (response === 'no') {
			return `Thank you, a representative will contact you shortly.`;
		} else {
			return `'${response}' was an invalid response. To confirm your appointment, reply YES. To cancel, reply NO.`;
		}
	}
	if (lang === 'es') {
		if (response === 'yes' || response === 'si') {
			return `Gracias por confirmar su cita con Murray Surgical. Si tiene alguna pregunta, llame al 801-983-6819 durante el horario normal de oficina. 5801 S. Fashion Blvd. # 190. ${mapLink}`;
		} else if (response === 'no') {
			return `Gracias, Un representante lo contactará en breve.`;
		} else {
			return `'${response}' fue una respuesta no válida. Para confirmar su cita, responda YES. Para cancelar, responda NO.`;
		}
	}
};

// Message To Be Sent To Staff When The Client Responds (Via Text And Email)
const getStaffNotification = (response, phone, name) => {
	console.log('name: ', name);

	response = response.toLowerCase();
	if (response === 'yes') {
		return `${name ? name + ' (' : ''}${phone}${name ? ')' : ''} has confirmed their appointment.`;
	}
	if (response === 'no') {
		return `${name ? name + ' (' : ''}${phone}${name
			? ')'
			: ''} has requested more information. Please contact them.`;
	}
};

// An Update Message To Be Sent To The Client When DB Changes
const getUpdateMessage = (name, date, time, reason, lang) => {
	if (lang === 'en') {
		return `Hi ${name}, Murray Surgical has updated your appointment${reason
			? ` (${reason})`
			: ``}. It is now scheduled for ${date} at ${time}. To confirm your appointment, reply YES. To cancel, reply NO. `;
	}
	if (lang === 'es') {
		return `Hola ${name}, tiene una cita${reason
			? ` (${reason})`
			: ``} con Murray Surgical para ${date} a ${time}. Para confirmar su cita, responda YES. Para cancelar, responda NO.`;
	}
};

// A message containing a link to a google survey
const getSurveyMessage = (name, lang) => {
	if (lang === 'en') {
		return `Hi ${name}, Murray Surgical has shared a short survey with you. ${surveyLink}`;
	}
	if (lang === 'es') {
		return `Hola, ${name}, Murray Surgical ha compartido una breve encuesta contigo. ${surveyLink}`;
	}
};

module.exports = { getInitialMessage, getResponse, getStaffNotification, getUpdateMessage, getSurveyMessage };
