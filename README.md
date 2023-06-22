# gmail-api
NodeJs application that uses googleapi to auto-reply email, using gmail api. In this i'm using a google cloud project in which i have enabled gmail api and added the gmail of the user for which i have to test in the test users.
<h1>Libraries</h1>
<ul>
  <li>express</li>
  <li>googleapis</li>
  <li>node-cron</li>
  <li>google-cloud/local-auth</li>
  <li>fs</li>
  <li>path</li>
<ul>
<h1>Improvement</h1>
<p>Currently i'm using email subject to check if the reply is already sent or not, we change to it to more robust checking in which we check the our email(user) in header of message to cover more edges cases like when email subject matched the our auto generated email</p>

  
  
