require('dotenv').config();

var Promise = require('bluebird');
var Polly = require('./polly');
var request = require("request");

var newTickets = [];
var actionableTickets = [];

function getTicketsFromAPI() {
	newTickets.splice(0, newTickets.length);
	actionableTickets.splice(0, actionableTickets.length);
	var options = { method: 'GET',
		url: `https://${process.env.API_ADDRESS}:443/api/tickets`,
 		qs: 
			{ 'agent_id[]': '3',
			  'status[]': 'awaiting_agent'},
		headers: 
			{ 'Postman-Token': '1d166e12-f388-42c2-b99d-6f77521d1316',
		  	'Cache-Control': 'no-cache',
		  	'X-DeskPRO-api_key': process.env.API_KEY } 
	};
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		var obj = JSON.parse(body);
		var tickets = obj["tickets"];
		for (const ticket in tickets) {
			newTickets.push(ticket);
		}
		for (var i = 0; i < newTickets.length; i++) {
			var subject = obj["tickets"][newTickets[i]]["subject"];
			//if (subject.search("New Hire") > -1) {
			if (subject.search("TEST TEST TEST") > -1) {
				actionableTickets.push(obj["tickets"][newTickets[i]]["id"]);
			}
		}
		console.log(actionableTickets);
		console.log(actionableTickets[0]);
		for (var n = 0; n < actionableTickets.length; n++) {
			console.log(`Requesting tasks for ticket number ${actionableTickets[n]}.`);
			getTasks(actionableTickets[n]);
		}
	});
}

function getTasks(ticket_id) {
	var options = { method: 'GET',
		url: `https://${process.env.API_ADDRESS}:443/api/tickets/${ticket_id}/tasks`,
		//url: `https://${process.env.API_ADDRESS}:443/api/tickets/920/tasks`,
		headers: 
			{ 'Postman-Token': '02fcc78e-95b7-453d-a030-4be4ef26d9ce',
		  	'Cache-Control': 'no-cache',
		  	'X-DeskPRO-api_key': process.env.API_KEY } 
	};
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		var obj = JSON.parse(body)
		console.log(obj);
		var tasks = obj["tasks"];
		console.log(tasks);
		console.log(tasks.length);
		if (tasks.length === 0) {
			console.log(ticket_id);
			assignTasks(ticket_id);
		} 
	});
}

function assignTasks(ticket_id) {
	var options = { method: 'POST',
		url: `https://${process.env.API_ADDRESS}:443/api/tasks`,
		qs: 
			{ assigned_agent_id: '3',
			  '': [ '', '', '' ],
			  ticket_id: `${ticket_id}`,
			  title: 'Pork Fried Rice',
			  visibility: 'false',
			  null: [ '', '', '' ] },
		headers: 
			{ 'Postman-Token': 'd8438ff3-beb5-4b78-9ca6-3c15c8d53bfc',
			  'Cache-Control': 'no-cache',
			  'X-DeskPRO-api_key': process.env.API_KEY } 
	};
	request(options, function (error, response, body) {
		  if (error) throw new Error(error);
		  console.log(body);
	});
}

// Alert that TaskBar is online and run initial scan.
Polly.Speak('Taskbar is on line.');
getTicketsFromAPI();

var timeLoop = 60000;
setInterval(function() {
	getTicketsFromAPI();
}, timeLoop);
