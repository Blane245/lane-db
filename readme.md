# The lane-db api documentation
I am following the Best Practices for REST API Design described in https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/ 
# Client response header requirements
Content-Type: application/json; charset=utf-8

# Server response header requirements
Content-Type: application/json; charset=utf-8

# Action conventions
* GET - retrieves resources
* POST - submits new data for a resource
* PUT -  updates existing resource
* DELETE - removes a resource
# error conventions
Common error HTTP status codes include:

* 400 Bad Request – This means that client-side input fails validation.
* 401 Unauthorized – This means the user isn’t not authorized to access a resource. It usually returns when the user isn’t authenticated.
* 403 Forbidden – This means the user is authenticated, but it’s not allowed to access a resource.
* 404 Not Found – This indicates that a resource is not found.
* 500 Internal server error – This is a generic server error. It probably shouldn’t be thrown explicitly.
# contributors
Bob Lane
Ryan Lane
# Documentation
The apiary file in the lane-db-test repository defines the REST structure for this app
# TODOs
* https protocol is not working
* Github pull request and issues is not working
