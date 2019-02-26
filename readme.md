Get arangodb up and running.

In a browser, go to host:port (likely localhost:8529) to access the UI console. Log in and select a database, remember the database name as that will be used later. Select Services on the left and click "Add Service". Select the "GitHub" tab at the top and fill in the form. (Repository: multinet/multinet-ingestion, Version: master), then install.

In the services tab, select the service you just loaded and click on the "API tab".
Select the endpoint you want to try and hit "Try it out". Fill in the endpoint parameters and select execute. For the csv endpoint, you'll have to copy and paste the file into the body. After doing this once, it will also display a curl command that you could modify to upload the file directly `--data-binary @/path/to/csv/file`. It's tricky to do this from the outset, though, as you'd also have to log in and get authentication tokens through curl.
