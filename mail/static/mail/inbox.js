document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);
  document.querySelector("#show_email").style.display = 'none';

  // By default, load the inbox
  load_mailbox('inbox')
});

function compose_email() {
  document.querySelector("#show_email").style.display = 'none';
  document.querySelector("#emails-view").style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    document.querySelector("#show_email").style.display = 'none';
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
 

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

        fetch('/emails/' + mailbox)
            .then(response => response.json())
            .then(emails => {
                for (let i = 0; i < emails.length; i++) {
                    const email_display = document.createElement("div");
                    email_display.setAttribute("id", "email_viewer");
                    email_display.innerHTML = "<strong>" + emails[i].sender + "</strong>" +
                        " " + emails[i].subject + "  " +
                        "<span class='email-ts'>" + emails[i].timestamp.slice(0, 19) + "</span>";
                    if (emails[i].read) {
                        email_display.style.backgroundColor = "#D3D3D3";
                    }
                    document.querySelector("#emails-view").append(email_display);
                    email_display.addEventListener('click', () => open_email(emails[i].id));
                    //interportlate strings /$
                }
            });
}


    // Send mail function called by event listener at top
    function send_mail(event) {
        event.preventDefault();
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
            .then(response => response.json())
            .then(result => {
                // Print result
                console.log(result);
                load_mailbox('sent');
            });
        //fetch_emails();
    }

function open_email(get_id) {
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#show_email').style.display = 'block';
        console.log('opened ' + get_id);
    var archButton;
        fetch('/emails/' + get_id)
            .then(response => response.json())
            .then(email => {
                // Print email to show sender, subject line, timestamp
                fetch('/emails/' + email.id, {
                    method: 'PUT',
                    body: JSON.stringify({
                        read: true
                    })
                })
                if (!email.archived) {
                    archButton = "Archive";
                }
                else {
                    archButton = "Unarchive";
                }
                const i = document.querySelector("#show_email")
                i.setAttribute("id", "show_email");                
                i.innerHTML = "<label class='view_labels'>From:</label>" + "  " + email.sender +
                    "<br>" + "<label class='view_labels'>To:</label>" + "  " + email.recipients + "<br>" +
                    "<label class='view_labels'>Subject:</label>" + "  " + email.subject + "<br>" +
                    "<label class='view_labels'>Timestamp:</label>" + "  " + email.timestamp.slice(0, 19) + "<br>" +
                    "<button class='btn btn-sm btn-outline-primary' id='reply'>Reply</button>" + 
                    "<button class='btn btn-sm btn-outline-primary' id='arch'>" + archButton + "</button>" + 
                    "<hr>" + email.body;
                arch_view = document.querySelector("#arch")
                document.querySelector("#reply").addEventListener('click', () => reply_message(email));
                arch_view.addEventListener('click', () => perform_archieve(archButton, get_id));
                //emails_view.append(email_display);
                document.querySelector("hr").appendChild(i);
                // ... do something else with email ...
            });
        return false;
}

function perform_archieve(arch_operation, id) {
    console.log(arch_operation, " ", id);
    //  if (arch_operation.equals(stringArch)) {
    if (arch_operation == "Archive") {
        fetch('/emails/' + id, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
        })
        load_mailbox('inbox');
    }
    else if (arch_operation == "Unarchive") {
        fetch('/emails/' + id, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
        })
        load_mailbox('inbox');
        
    }

}

function reply_message(email) {
    event.preventDefault();
    console.log('Invoked ' + email.sender);
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#show_email').style.display = 'none';
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
    reply_body = document.querySelector("#compose-body")
    reply_body.innerHTML = "On " + email.timestamp.slice(0, 19) + " " 
        + email.sender + " wrote: " + email.body + "<br>";
}


