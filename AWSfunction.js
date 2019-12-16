/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
const http = require('https');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = 'amzn1.ask.skill.e8b890d3-e733-4115-9da6-ad393151f874';

const SKILL_NAME = 'z side kick';
const GET_HERO_MESSAGE = "Here's your hero: ";
const HELP_MESSAGE = 'Please say fetch payment staus or fetch bill run status ';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Enjoy the day...Goodbye!';
const MORE_MESSAGE = 'Do you want more?';
const PAUSE = '<break time="0.3s" />';
const WHISPER = '<amazon:effect name="whispered"/>';
const PLING = "<audio src='https://s3.amazonaws.com/ask-soundlibrary/cartoon/amzn_sfx_boing_long_1x_01.mp3'/>";
const Bike  = "<audio src= 'https://s3.amazonaws.com/ask-soundlibrary/machines/servos/servos_02.mp3'/>";
const WELCOME_MESSAGE = "Hello" + PAUSE +", Welcome to Zuora Voice assistant, please say the command";
// +-----------------------------------------------+
// |Constants: Service types available             |
// |                                               |
// |- Health                                      |
// |- Report                                      |
// |- Payment     
//  - BillRun|
// +-----------------------------------------------+
var serviceEndPoints = {
    HealthAPI:'/12343/run',
    ReportAPI:'/12649/run',
    PaymentAPI:'/12688/run',
    BillRunAPI:'/12673/run'
};
var speechNames = {
    Health:'Health',
    Report:'Report',
    Payment:'Payment',
    BillRun:'BillRun'
};
var curreEndpoint = serviceEndPoints.PaymentAPI;
var endpointSpeechName = speechNames.Payment;



//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
          this.emit('WelcomeTheUser');
    },
    'WelcomeTheUser': function () {
        const speechOutput = WELCOME_MESSAGE;
        const more = "Please make a choice";
        this.response.cardRenderer(SKILL_NAME, "Welcome User");
        this.response.speak(Bike + speechOutput ).listen(more);
        this.emit(':responseReady');
        console.log("first function");
    },
    'SetEndpoint': function () {
        // if (this.event.request.dialogState === 'STARTED') {
        //         let updatedIntent = this.event.request.intent;
        //         this.emit(':delegate', updatedIntent);
      
        // }
        var nameVal = this.event.request.intent.slots.endpoint.value;
        var lowerName = nameVal.toLowerCase();
        console.log("NAMEVAL" + lowerName);
        switch (lowerName) {
          case 'health':
              console.log("ENDPOINT SET" + "Health");
              curreEndpoint = serviceEndPoints.HealthAPI;
              endpointSpeechName = speechNames.Health;
               console.log("Health function");
            break;
          case 'report':
              curreEndpoint = serviceEndPoints.ReportAPI;
              endpointSpeechName = speechNames.Report;
              console.log("ENDPOINT SET" + "Report");
            break;
          case 'payment':
              curreEndpoint = serviceEndPoints.PaymentAPI;
              endpointSpeechName = speechNames.Payment;
              console.log("ENDPOINT SET" + "Payment");
              console.log("payment function");
            break;
            case 'billrun':
              curreEndpoint = serviceEndPoints.BillRunAPI;
              endpointSpeechName = speechNames.BillRun;
              console.log("ENDPOINT SET" + "BillRun");
              console.log("billrun function");
            break;
          default:
            break;

        }
        const speechOutput = "Thank you for choosing the option" + PAUSE + " the result will be notified";
        const more = "Please check the notifications for the result";
        this.response.cardRenderer(SKILL_NAME, "translate");
        this.response.speak(speechOutput).listen(more);
        this.emit('GetTranslation');
    },
    'GetTranslation': function () {
     //   var sentenceVal = this.event.request.intent.slots.sentence.value;
        const query = '/api/v1/workflows'+ curreEndpoint;
        console.log("Calling Workflow");
                httpPost(query, (theResult, status) => {
          //      => {
                console.log("sent     : " + query);
                console.log("received : " + theResult);
                const theWF = theResult;
                const more = "Please check your notifications for the results" +PAUSE+"Thank you ";                
                const speechOutput = endpointSpeechName + PAUSE + "results are processed in worklow"  + theWF;
                this.response.cardRenderer(SKILL_NAME, speechOutput);
               if(status){
                    this.response.speak(speechOutput + PAUSE + more).listen(more);
                    this.response.shouldEndSession(true);
               }else{
                    this.response.speak(speechOutput + PLING);
                }
                
                this.emit(':responseReady');
            });
        
    },
    
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'Unhandled': function() {
        this.emit('AMAZON.HelpIntent');
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function httpPost(query, callback) {
    var options = {
        host: 'workflow.apps.zuora.com',
        path: query,
        method: 'POST',
		headers: {
      'API-Token': 'bbd41d1cdea2d32dc4d1c13a11597980ba78169d304ef9d9296b4d52fa86973a'
    }
    };
    


    console.log("SET OPTIONS");
    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            console.log("RESPONSE STRING" + responseString);
            var obj = JSON.parse(responseString);
            if (obj.error){
                 callback("My sources are tired..ask after sometime", false);
            }else{
                 console.log("RESPONSE" + obj.name);
                callback(obj.name, true);
              
            }
           
        });

    });
    req.on('error', function(e) {
     
            console.log(' There is a problem with the request: ' + e.message);
    });
    req.end();
}