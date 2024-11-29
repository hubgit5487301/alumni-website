
import { upload as eventdataupload, inputCheck ,changefieldcolor,isValidEmail} from "./util.js";

const allowedpic =['image/jpeg','image/png'];
const allowedfile =['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

let eventfile = null;
eventdataupload('.js-event-file',allowedfile, true, '.js-event-file', (file64) => {
  eventfile = file64;
})


let eventimage = null;
eventdataupload('.js-event-pic', allowedpic, true, '.js-event-pic', (file64) =>{
  eventimage = file64;
})

function eventForm () {
document.querySelector('.js-event-submit').addEventListener(('click'), (event) => {
  event.preventDefault();
  const eventname = document.querySelector('.js-event-name').value;
  const eventdate = document.querySelector('.js-event-date-time').value;
  const eventlocation = document.querySelector('.js-event-location').value;
  const eventemail = document.querySelector('.js-event-contact-info-email').value;
  const eventphone = document.querySelector('.js-event-contact-info-phoneno').value;
  const eventdescription = document.querySelector('.js-event-description').value;

  const fields = [
    { value: eventname, selector: '.js-event-name' },
    { value: eventdate, selector: '.js-event-date-time' },
    { value: eventlocation, selector: '.js-event-location' },
    { value: eventemail, selector: '.js-event-contact-info-email' },
    { value: eventphone, selector: '.js-event-contact-info-phoneno' },
    { value: eventdescription, selector: '.js-event-description' },
  ];

  let isInvalid = inputCheck(fields);
  if (isInvalid) {
    alert("Please fill all required fields.");
    return;
  }
  
  if(!isValidEmail(eventemail)) {
    changefieldcolor(document.querySelector('.js-event-contact-info-email'));
    alert('Enter a valid email');
    return;
  }

  const storedEvents = ({
    name : eventname,
    date: eventdate,
    location: eventlocation,
    contact_info:{
      email: eventemail,
      phone_no: eventphone
    },
    event_des: eventdescription,
    event_file: eventfile,
    event_logo: eventimage,}
  );
  fetch(`http://localhost:8000/protected/submit-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(storedEvents),
  })
  .then((response) => {
    if(!response.ok) {
      return response.json().then((errorData) => {
        throw new Error(errorData.message || 'error submitting data')
      });
    }
    return response.json()
  })
   .then((data) => {
    console.log(data);
    alert('Form submitted successfully!');
    window.location.href = '/protected/event-directory';
   })
   .catch((err) => {
    console.error(err.message);
    alert(err.message);
   })

})}


eventForm();
