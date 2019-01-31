const website = 'https://metal-messiah.github.io/murray_surgical/';

// The First Message To Be Sent To The Client
const getInitialMessage = (name, date, time) => {
	return `Hi ${name}, you have an appointment with Murray Surgical scheduled for ${date} at ${time}. To confirm your appointment, reply YES. To cancel, reply NO. `;
};

// Message To Be Sent Back To The Client When The Client Responds (Via Text)
const getResponse = (response) => {
	response = response.toLowerCase();
	if (response === 'yes') {
		return `Thank you for confirming your appointment. Please look over our pre-surgery instructions at ${website}/surgery .  If you have any questions, please call 801.983.6819 during normal office hours.`;
	} else if (response === 'no') {
		return `We've received word that you've indicated to cancel your appointment. A representative will contact you shortly.  Please note that you may inquire a fee for cancellation.`;
	} else {
		return `'${response}' was an invalid response. To confirm your appointment, reply YES. To cancel, reply NO.`;
	}
};

// Message To Be Sent To Staff When The Client Responds (Via Text And Email)
const getStaffNotification = (response, phone) => {
	response = response.toLowerCase();
	if (response === 'yes') {
		return `${phone} has confirmed their appointment.`;
	}
	if (response === 'no') {
		return `${phone} has cancelled their appointment.  Please contact them.`;
	}
};

module.exports = { getInitialMessage, getResponse, getStaffNotification };