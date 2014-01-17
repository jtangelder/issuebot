var fs = require('fs');
var github = require('github');

var now = new Date();
var message = fs.readFileSync("close_msg.txt", {encoding:'utf-8'});

// add your repos
var autoclose_repos = [
  { days: 90, repo: 'hammer.js', user: 'eightmedia' }
];


var client = new github({
    version: "3.0.0",
    timeout: 5000
});

// sign in
// make sure GITHUB_APP_TOKEN is set
client.authenticate({
    type: "oauth",
    token: process.env.GITHUB_APP_TOKEN
});


// calculate days
function daysAgo(date) {
  return Math.floor((now - new Date(date)) / 1000 / (3600*24));
}

// auto close when overdue
function autoCloseIssue(issue, repo) {
  if(daysAgo(issue.updated_at) > repo.days) {
    client.issues.edit({
      repo: repo.repo,
      user: repo.user,
      number: issue.number,
      state: 'closed'
    });

    client.issues.createComment({
      repo: repo.repo,
      user: repo.user,
      number: issue.number,
      body: message
    });

    console.log('closed #'+ issue.number +' of '+ issue.user+'/'+issue.repo);
  }
}

// walk repos
autoclose_repos.forEach(function(repo) {
  var options = {
    repo: repo.repo,
    user: repo.user,
    state: 'open',
    per_page: 200
  };

  client.issues.repoIssues(options, function(err, items) {
    if(err) {
      return console.log(err);
    }

    return items.forEach(function(issue) {
      autoCloseIssue(issue, repo);
    });
  });
});