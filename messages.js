// const website = 'https://metal-messiah.github.io/murray_surgical';
const website = process.env.WEBSITE;
const mapLink = 'https://goo.gl/Y6W8wE';

// The First Message To Be Sent To The Client
const getInitialMessage = (name, date, time, lang) => {
	if (lang === 'en') {
		return `Hi ${name}, you have an appointment with Murray Surgical scheduled for ${date} at ${time}. To confirm your appointment, reply YES. To cancel, reply NO. `;
	}
	if (lang === 'es') {
		return `Hola ${name}, tiene una cita con Murray Surgical para ${date} a ${time}. Para confirmar su cita, responda YES. Para cancelar, responda NO.`;
	}
};

// Message To Be Sent Back To The Client When The Client Responds (Via Text)
const getResponse = (response, lang) => {
	response = response.toLowerCase();
	if (lang === 'en') {
		if (response === 'yes') {
			return `Thank you for confirming your appointment with Murray Surgical. Please review required pre-surgery instructions at ${website}/surgery. 
			If you have any questions, please call 801-983-6819 during normal office hours. 5801 S. Fashion Blvd. #190. ${mapLink}`;
		} else if (response === 'no') {
			return `You have indicated you want to cancel your appointment with Murray Surgical. A representative will contact you shortly. Please note you may be charged a cancellation fee.`;
		} else {
			return `'${response}' was an invalid response. To confirm your appointment, reply YES. To cancel, reply NO.`;
		}
	}
	if (lang === 'es') {
		if (response === 'yes' || response === 'si') {
			return `Gracias por confirmar su cita con Murray Surgical. Por favor revise las instrucciones requeridas antes de la cirugía en ${website}/surgery. 
			Si tiene alguna pregunta, llame al 801-983-6819 durante el horario normal de oficina. 5801 S. Fashion Blvd. # 190. ${mapLink}`;
		} else if (response === 'no') {
			return `Usted ha indicado que desea cancelar su cita con Murray Surgical. Un representante lo contactará en breve. Tenga en cuenta que se le puede cobrar una tarifa de cancelación.`;
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
			: ''} has cancelled their appointment.  Please contact them.`;
	}
};

module.exports = { getInitialMessage, getResponse, getStaffNotification };
