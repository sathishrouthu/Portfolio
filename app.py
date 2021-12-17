# importing libraries
from flask import *
from flask_mail import Mail, Message

app = Flask(__name__)
mail = Mail(app) # instantiate the mail class

# configuration of mail
app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'sathishviraj296@gmail.com'
app.config['MAIL_PASSWORD'] = 'Sathish@A1296'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

# message object mapped to a particular URL �/�

@app.route("/")
def home():
	return render_template('index.html')
@app.route("/sendmail",methods=['POST','GET'])
def sendmail():
	if request.method=='POST':
		name=request.form['name']
		mailid=request.form['email']
		subject=request.form['subject']
		message=request.form['message']
		msg = Message(subject,sender ='sathishviraj296@gmail.com',recipients = ['sathishrouthu222@gmail.com'])
		msg.body = message
		mail.send(msg)
	return render_template('index.html')

if __name__ == '__main__':
	app.run(debug = True)
