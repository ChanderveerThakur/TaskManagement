
# username 'chanu' and 123 password


part C Database question : select * from user_table order by completed_task_count limit 5;

part D: Permission Classes =[isAuthenticated] is missing and task.object.get(id and user) both should be passed so that user can access only
his own data.

Part F:
1.
authentication: it identifies the user's credentials and assign access key. JWT is example of authentication
authorization: it reveals that what are the user's permission. This is also done using JWT.

2. 
if we stored password as plain text it has more risk to the user's security. In case of hashed password stored, then if someone get the data from the database there is still no way to get the actual password from its hashed form.

3.
HTTP 401 means the credentials are not valid and it returns unauthenticated credentials
HTTP 403 means the user does not have the access of that specific task or feature.

4.
Props are way to send data in Reactjs from parent to child component. It is read only data. Whereas State let the react store some value and it creates a re-render every time there is a change in the state

5.

=> I will change the database, because sqlite won't work in the deployment instead i need to integrate a cloud based database.
=> I will create a repository and push the working code in it.
=> All the sensitive information(secret keys) will be stored in .env file which will not be shared with GitHub.
=> For django a new file has to me create that is build.sh, it includes the project requirements (dependencies) and start command. This build.sh file will be shared while deployment in the start command field.
=> Debug will set to be False.
