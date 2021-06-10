## Credentials

|   Item            |  Credentials   |
|:----:             |  :----------:  |
|Website URL        | http://100.26.92.104/  |
|SSH URL            | 100.26.92.104    |
|SSH Username       | ubuntu          |
 SSH Password/ Key  | (No password!) (Key attached in the credentials folder)              |
 Database URL       | host: 100.26.92.104 port: 3306 |
 Database Username  | teamproject   |
 Database Password  | teamprojectgc07! |
 Database           | teamproject   |

## Instructions to connect

- SSH command to log in to server: ssh -i CSC648.pem ubuntu@100.26.92.104
(Make sure you have the key file downloaded and set permission to 400 using command: chmod 400 CSC648.pem)
- Login to database using command line: mysql -h 100.26.92.104 -u teamproject -p, press enter and it will ask for entering password, enter password and you will be successfully logged in
- Login to the database using mysql workbench: Create a new connection with the above database information and connect
