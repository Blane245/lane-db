//TODO this needs to integrate with the users in the db
// users must be login and have a session token
const users = []
const newuser = []
const addUser = ({ username, room }) => {
    //clean the data

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //check for existing users
    const existingUser = users.find((user) => {
        return user.room == room && user.username == username
    })

    //validate username
    if (existingUser) {
        return {
            error: "username is already used"
        }
    }

    //store user
    const user = {username, room}
    users.push(user)
    return { user }
}


const removeUser = (username) => {
    const index = users.findIndex((user) => {
        return user.username === username;
    })
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const removeUserFromRoom = (username, room) => {
    const index = users.findIndex((user) => {
        return user.username === username && user.room === room;
    })
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (username) => {
    return users.find((user) => {
        return user.username === username;
    })
}

const getUsersInRoom = (room) => {
    const u =
        users.filter((user) => {
            user.room === room
        });
    console.log(u)
    return u;

}

module.exports = {
    addUser, removeUser, removeUserFromRoom, getUser, getUsersInRoom
}