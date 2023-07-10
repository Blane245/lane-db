const { generatemsg, generateLocation } = require('../utils/messages');

const { addUser, removeUser, getUser, getUserInRoom } = require('../utils/users');

//TODO needs to integrate with lane-db users, 
exports.joinRoom = ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
        return cb(error);
    }
    socket.join(user.room);
    socket.emit("message", generatemsg("Admin ,Welcome"));
    socket.broadcast.to(user.room).emit("message", generatemsg(`Admin ${user.username} has joined!`));

    io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room)
    });
    cb();    
}
exports.sendMessage = (msg, cb)=>{
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generatemsg(user.username, msg));
    cb();    
}
exports.sendLocation = (io, location, cb)=>{
    const user = getUser(socket.id);
    console.log(user);
    io.to(user.room).emit("locationurl", generateLocation(user.username, `https://www.google.com/maps?q=${location.latitude},${location.longitude}`));
    cb();    
}
exports.disconnect = (io)=>{
    const user = removeUser(socket.id);
    console.log(user);
    if (user) {
        io.to(user.room).emit("message", generatemsg(`Admin ${user.username} A user  has left`));

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUserInRoom(user.room)
        })
    }    
}
