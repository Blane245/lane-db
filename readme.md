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
# Appointment Use Cases (because they are a lot of them)
1. Add an appointment with <someone> for next <weekday> at <time> for <duration (hours and minutes)> to <title>.
* This will add an appointment with no description or repetition. The start one the day/time specified and run for the duration. The trasaction will be
- title: <title>
- withwhom: <someone>
- starttime: <yyyy/mm/dd of weekday time>
- endtime: <starttime + duration>
1. Add an appointment with <someone> for all day next <weekday> to <title>.
- this adds an all day appointment
1. Add an appointment with <someone> for next <weekday> at <time> for <duration> to <title> (and repeat every <interval> <unit> (forever | for <times> | until <enddate>))
This will set up a repeating appointment with the interval and unit specified than ends as specified
1. Modify the appointment <title> (to be with <someone>) (and) to start at <time> (and) to be for <duration>
- changing the start time without changing the duration will move the end time to maintain the duration 
1. Modify the appointment <title> to be all day.
start and end times are ignored
1. Modify the appointment <title> to repeat every <interval> <unit> (forever | for <times> | until <enddate>)



