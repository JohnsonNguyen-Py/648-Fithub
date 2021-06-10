# Credentials Folder

## The purpose of this folder is to store all credentials needed to log into your server and databases. This is important for many reasons. But the two most important reasons is
    1. Grading , servers and databases will be logged into to check code and functionality of application. Not changes will be unless directed and coordinated with the team.
    2. Help. If a class TA or class CTO needs to help a team with an issue, this folder will help facilitate this giving the TA or CTO all needed info AND instructions for logging into your team's server. 


# Below is a list of items required. Missing items will causes points to be deducted from multiple milestone submissions.

1. **Server URL or IP**: 100.26.92.104
2. **SSH username**: ubuntu
3. **SSH password** or key: N/A
    > *The ssh key file is attached in the credentials folder: CSC648.pem*

    <br> (If a ssh key is used please upload the key to the credentials folder.)
4. **Database URL or IP**: 100.26.92.104

     and **port**: 3306

    <br><strong> NOTE THIS DOES NOT MEAN YOUR DATABASE NEEDS A PUBLIC FACING PORT.</strong> But knowing the IP and port number will help with SSH tunneling into the database. The default port is more than sufficient for this class.
5. **Database username**: teamproject
6. **Database password**: teamprojectgc07!
7. **Database name** (basically the name that contains all your tables): teamproject
8. **Instructions on how to use the above information**:
    - SSH command to log in to server: ssh -i CSC648.pem ubuntu@100.26.92.104
    *(Make sure you have the key file downloaded and set permission to 400 using command: chmod 400 CSC648.pem)*
    - Login to database using command line: mysql -h 100.26.92.104 -u teamproject -p, press enter and it will ask for entering password, enter password and you will be successfully logged in
    - Login to the database using mysql workbench: Create a new connection with the above database information and connect

# Most important things to Remember
## These values need to kept update to date throughout the semester. <br>
## <strong>Failure to do so will result it points be deducted from milestone submissions.</strong><br>
## You may store the most of the above in this README.md file. DO NOT Store the SSH key or any keys in this README.md file.
