FireDruid
=========

What is FireDruid?
------------------
FireDruid collects frontpage headlines from British news sites and visualises the most common words in them.
It is "work in progress" and it will remain so for some time.


Updating the Site on PythonAnywhere
-----------------------------------
**(Notes to self)**  
* Open a bash console
* `workon venv`
* `cd ~/minerva` (minerva was the original name of FireDruid)
* `git status` to check if only config files have been changed, then `git stash`
* `git pull origin master`
* Go the files pane
* `config.json`: change all path parameters to absolute, e.g. /home/dir1/dir2/frontend.json
* `app.py`, `main_scraper.py`, `db_operations.py`, `data_processor.py`: config path should be absolute
* Go the web pane
* Reload firedruid
* Go to `https://www.firedruid.com/` and check if everything works
* Check server and error logs for anything unusual
* Go back to the bash console
* `python db_admin.py rerun-frontend`, this ensures that FireDruid can read/write the database
* Wait until the next scheduled update, then go to the tasks pane and look at the logs
* Check server and error logs for again


Things to Add / Improve
-----------------------
* db_reader.py: rename and split functions, optimise reading from the database
* firecharts.js: code cleanup
* choose from multiple periods in monthly view
* change the name of styles (remove references to the original resume template)
* show more than five words in the line charts
* "good" and "bad" word trends