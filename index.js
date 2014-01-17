var fs = require('fs');
var path = require('path');
var github = require('github');

var now = new Date();
var message = fs.readFileSync(path.join(__dirname, "close_msg.txt"), {encoding:'utf-8'});

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
  // when a comment was placed after it was closed, reopen it
  if(issue.state == 'closed' && new Date(issue.updated_at) > new Date(issue.closed_at)) {
    client.issues.edit({
      repo: repo.repo,
      user: repo.user,
      number: issue.number,
      state: 'open'
    });
  }

  // overdue
  else if(daysAgo(issue.updated_at) > repo.days) {
    client.issues.createComment({
      repo: repo.repo,
      user: repo.user,
      number: issue.number,
      body: message
    }, function() {
      client.issues.edit({
        repo: repo.repo,
        user: repo.user,
        number: issue.number,
        state: 'closed'
      });

      console.log('closed #'+ issue.number +' of '+ issue.user+'/'+issue.repo);
    });
  }
}

// walk repos
console.log('Starting '+ now.toUTCString() +'...');
autoclose_repos.forEach(function(repo) {
  (['open','closed']).forEach(function(state) {
    var options = {
      repo: repo.repo,
      user: repo.user,
      state: state,
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

});