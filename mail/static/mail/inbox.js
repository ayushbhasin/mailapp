//show_email = document.querySelector("#show_email");
//emails_view = document.querySelector("#emails-view");
//let show_email;
//let emails_view;
document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  //on document content load add an event listener to this form to check submit
  // show_email = document.querySelector("#show_email");
   //emails_view = document.querySelector("#emails-view");
  
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
                document.querySelector("#show_email").style.display = 'none';
                    const email_display = document.createElement("div");
                    email_display.setAttribute("id", "email_viewer");
                    //get_id = emails[i].id;
                  
                    email_display.innerHTML = "<strong>" + emails[i].sender + "</strong>" + 
                        " " + emails[i].subject + "  " +
                        "<span class='email-ts'>" + emails[i].timestamp.slice(0, 19) + "</span>";
                    //emails_view.append(email_display);
                    document.querySelector("#emails-view").append(email_display);
                email_display.addEventListener('click', () => open_email(emails[i].id));
              if (mailbox === 'index') {
                    const archive_btn = document.createElement("button");
                  archive_btn.setAttribute("class", "btn btn-primary");
                    document.querySelector("#emails-view").append(archive_btn);
               email_viewer.addEventListener('click', () => archive(emails[i].id));
                }
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
    console.log('onclick invoked' + get_id);
    fetch('/emails/' + get_id)
        .then(response => response.json())
        .then(email => {
            // Print email to show sender, subject line, timestamp
            console.log(email);
            const show_email = document.createElement("div");
            show_email.setAttribute("id", "show_email");
            show_email.innerHTML = "<label class='view_labels'>From:</label>" + "  " + email.sender +
                "<br>" + "<label class='view_labels'>To:</label>" + "  " + email.recipients + "<br>" +
                "<label class='view_labels'>Subject:</label>" + "  " + email.subject + "<br>" +
                "<label class='view_labels'>Timestamp:</label>" + "  " + email.timestamp.slice(0, 19) + "<br>" +
                "<hr>" + email.body;
            //emails_view.append(email_display);
            document.querySelector("hr").appendChild(show_email);
            // ... do something else with email ...
        });
    return false;
}


