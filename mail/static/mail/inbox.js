document.addEventListener('DOMContentLoaded', function () {

	// Use buttons to toggle between views
	document.querySelector('#inbox')
		.addEventListener('click', () => load_mailbox('inbox')); //click on inbox
	document.querySelector('#sent')
		.addEventListener('click', () => load_mailbox('sent')); //click on sent
	document.querySelector('#archived')
		.addEventListener('click', () => load_mailbox('archive')); //click on archived
	document.querySelector('#compose')
		.addEventListener('click', compose_email); //click on compose
	document.querySelector('#compose-form')
		.addEventListener('submit', send_mail); //click on send mail on compose
	document.querySelector("#show_email")
		.style.display = 'none'; //hide indivdual email

	// By default, load the inbox
	load_mailbox('inbox')
});

/*on intial load compose email view and hide everything else
 * clear compose email fields to send new email*/
function compose_email() {
	document.querySelector("#show_email")
		.style.display = 'none';
	document.querySelector("#emails-view")
		.style.display = 'none';
	document.querySelector('#compose-view')
		.style.display = 'block';


	// Clear out composition fields
	document.querySelector('#compose-recipients')
		.value = '';
	document.querySelector('#compose-subject')
		.value = '';
	document.querySelector('#compose-body')
		.value = '';
}

// Show the mailbox and hide other views
function load_mailbox(mailbox) {
	document.querySelector("#show_email")
		.style.display = 'none';
	document.querySelector('#emails-view')
		.style.display = 'block';
	document.querySelector('#compose-view')
		.style.display = 'none';


	// Show the mailbox name
	document.querySelector('#emails-view')
		.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
	//GET emails API call
	fetch('/emails/' + mailbox)
		.then(response => response.json())
		.then(emails => { // API response in emails
			//for email in emails length get all the emails in the list
			for (let email = 0; email < emails.length; email++) {
				// create a new div element to store
				const email_display = document.createElement("div");
				email_display.setAttribute("id", "email_viewer");
				//set the email display (sender, subject, timestamp) through template literals
				email_display.innerHTML = `<strong> ${emails[email].sender} </strong> ${emails[email].subject}
                    <span class='email-ts'> ${emails[email].timestamp.slice(0, 19)}</span>`;
				//if the email was read set the list div item background to gray
				if (emails[email].read) {
					email_display.style.backgroundColor = "#D3D3D3";
				}
				//append the email display of the list to the emails view element
				document.querySelector("#emails-view")
					.append(email_display);
				// event listener to open email on click via open_email function
				email_display.addEventListener('click', () => open_email(emails[email].id));
			}
		});
}


//trigger on SEND
function send_mail(event) {
	//bypass the default form handling to GET
	event.preventDefault();
	// send email API call
	fetch('/emails', {
			method: 'POST',
			body: JSON.stringify({
				recipients: document.querySelector('#compose-recipients')
					.value,
				subject: document.querySelector('#compose-subject')
					.value,
				body: document.querySelector('#compose-body')
					.value
			})
		})
		.then(response => response.json())
		.then(result => {
			load_mailbox('sent');
		});
}

//trigger on OPEN
function open_email(get_id) {
	//hide emails-view(list of emails) and email compose
	document.querySelector('#emails-view')
		.style.display = 'none';
	document.querySelector('#compose-view')
		.style.display = 'none';
	document.querySelector('#show_email')
		.style.display = 'block';
	var archButton; //declare variable to archive
	//API Call to get email contents
	fetch('/emails/' + get_id)
		.then(response => response.json())
		.then(email => {
			fetch('/emails/' + email.id, {
				method: 'PUT',
				body: JSON.stringify({
					read: true
				})
			})
			// set value based on current archive status
			if (!email.archived) {
				archButton = "Archive";
			} else {
				archButton = "Unarchive";
			}
			const single_email = document.querySelector("#show_email")
			single_email.setAttribute("id", "show_email"); // show Sender, Recipients, subject, timestamp, body
			single_email.innerHTML = `<label class='view_labels'>From:</label>&nbsp${email.sender}<br>
                 <label class='view_labels'>To:</label>&nbsp${email.recipients}<br>
                 <label class='view_labels'>Subject:</label>&nbsp${email.subject}<br>
                 <label class='view_labels'>Timestamp:</label>&nbsp${email.timestamp.slice(0, 19)}<br>
                 <button class='btn btn-sm btn-outline-primary' id='reply'>Reply</button>
                 <button class='btn btn-sm btn-outline-primary' id='arch'>${archButton}</button>
                <hr> ${email.body}`; // add Reply and Archive Button (Archive should change to Unarchive)
			arch_view = document.querySelector("#arch")
			document.querySelector("#reply")
				.addEventListener('click', () => reply_message(email));
			arch_view.addEventListener('click', () => perform_archieve(archButton, get_id));
			document.querySelector("hr")
				.appendChild(single_email);
		});
	return false;
}

//trigger on Archive or Unarchive
function perform_archieve(arch_operation, id) {
	//if arch_operation is archive or unarchive
	if (arch_operation == "Archive") {
		//API Call to PUT for archive
		fetch('/emails/' + id, {
			method: 'PUT',
			body: JSON.stringify({
				archived: true
			})
		})
		load_mailbox('inbox');
	} else if (arch_operation == "Unarchive") {
		//API Call to PUT for Unarchive
		fetch('/emails/' + id, {
			method: 'PUT',
			body: JSON.stringify({
				archived: false
			})
		})
		load_mailbox('inbox');

	}

}

//trigger on REPLY
function reply_message(email) {
	//bypass the default form handling to GET
	event.preventDefault();
	//Show only the compose view and use the same functionality to send the email
	document.querySelector('#emails-view')
		.style.display = 'none';
	document.querySelector('#compose-view')
		.style.display = 'block';
	document.querySelector('#show_email')
		.style.display = 'none';
	document.querySelector('#compose-recipients')
		.value = email.sender;
	document.querySelector('#compose-subject')
		.value = 'Re: ' + email.subject;
	reply_body = document.querySelector("#compose-body")
	reply_body.innerHTML = `On ${email.timestamp.slice(0, 19)} ${email.sender} wrote: ${email.body}`;
}
