issuebot
========

Close inactive issues after x days

Set the env variable `GITHUB_APP_TOKEN` with your Github App token, and update
the `autoclose_repos` array with the repos you would like to be auto closed.


Cron to execute it every day around 12 noon, and write the output to log.txt:
`00 	12	*	*	*	/usr/local/bin/node index.js >> log.txt`
