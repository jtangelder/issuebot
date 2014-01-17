var fs = require('fs');
var github = require('github');

var now = new Date();
var message = fs.readFileSync("close_msg.txt", {encoding:'utf-8'});

function daysAgo(date) {
  return Math.floor((now - new Date(date)) / 1000 / (3600*24));
}

var autoclose_repos = [
  { days: 90, repo: 'hammer.js', user: 'eightmedia' }
];

var client = new github({
    version: "3.0.0",
    timeout: 5000
});

client.authenticate({
    type: "oauth",
    token: process.env.GITHUB_APP_TOKEN
});

autoclose_repos.forEach(function(repo) {
  client.issues.repoIssues({
    repo: repo.repo,
    user: repo.user,
    state: 'open',
    per_page: 200
  }, function(err, issues) {
    if(err) {
      return console.log(err);
    }

    return issues.forEach(function(item) {
      if(daysAgo(item.updated_at) > repo.days) {
        client.issues.edit({
          repo: repo.repo,
          user: repo.user,
          number: item.number,
          state: 'closed'
        });

        client.issues.createComment({
          repo: repo.repo,
          user: repo.user,
          number: item.number,
          body: message
        });

        console.log('closed #'+ item.number +' of '+ repo.user+'/'+repo.repo);
      }
    });
  });
});