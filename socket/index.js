const socketIo = require('socket.io');
const { sequelize } = require('../models');
const users = new Map();
const userSockets = new Map();
const Message = require('../models').Message;

const SocketServer = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', async (user) => {
      let sockets = [];
      if (users.has(user.id)) {
        const existingUser = users.get(user.id);
        existingUser.sockets = [...existingUser.sockets, ...[socket.id]];
        users.set(user.id, existingUser);
        sockets = [...existingUser.sockets, ...[socket.id]];
        userSockets.set(socket.id, user.id);
      } else {
        users.set(user.id, { id: user.id, sockets: [socket.id] });
        sockets.push(socket.id);
        userSockets.set(socket.id, user.id);
      }

      const onlineFriends = []; //ids
      const chatters = await getChatters(user.id); // query

      // notify friends that user is now online
      chatters.forEach((chatter) => {
        const _chatter = users.get(chatter);

        if (users.has(chatter)) {
          _chatter.sockets.forEach((socket) => {
            try {
              io.to(socket).emit('online', user);
            } catch (error) {
              throw error;
            }
            onlineFriends.push(_chatter.id);
          });
        }
      });
      // send to user sockets which of his friends are online
      sockets.forEach((socket) => {
        try {
          io.to(socket).emit('friends', onlineFriends);
        } catch (error) {
          throw error;
        }
      });
    });
    socket.on('disconnect', async () => {
      if (userSockets.has(socket.id)) {
        const user = users.get(userSockets.get(socket.id));
        if (user.sockets.length > 1) {
          user.sockets = user.sockets.filter((_socket) => {
            if (_socket !== socket.id) return true;
            userSockets.delete(_socket);
            return false;
          });
          users.set(user.id, user);
        } else {
          const chatters = await getChatters(user.id);
          // notify friends that user is now offline
          chatters.forEach((chatter) => {
            if (users.has(chatter)) {
              users.get(chatter).sockets.forEach((socket) => {
                try {
                  io.to(socket).emit('offline', user);
                } catch (error) {
                  throw error;
                }
              });
            }
          });
          userSockets.delete(socket.id);
          users.delete(user.id);
        }
      }
    });
    socket.on('message', async (message) => {
      let sockets = [];
      if (users.has(message.fromUserId.id)) {
        sockets = users.get(message.fromUserId.id).sockets;
      }
      message.toUserId.forEach(async (id) => {
        if (users.has(id)) {
          sockets = [...sockets, ...users.get(id).sockets];
        }
        try {
          const msg = {
            type: message.type,
            fromUserId: message.fromUserId.id,
            chatId: message.chatId,
            message: message.message,
          };
          const savedMessage = await Message.create(msg);
          message.id = savedMessage.id;
          message.message = savedMessage.message;
          message.User = message.fromUserId;
          message.fromUserId = message.fromUserId.id;
          sockets.forEach((socket) => {
            io.to(socket).emit('recived', message);
          });
        } catch (error) {}
      });
    });
    socket.on('typing', (message) => {
      message.toUserId.forEach((id) => {
        if (users.has(id)) {
          users.get(id).sockets.forEach((socket) => {
            try {
              io.to(socket).emit('typing', message);
            } catch (error) {
              console.log(error);
            }
          });
        }
      });
    });
    socket.on('add-friend', (chats) => {
      try {
        console.log('heres');

        if (users.has(chats[1].Users[0].id)) {
          console.log('heres');
          chats[0].Users[0].status = 'online';
          users.get(chats[1].Users[0].id).sockets.forEach((socket) => {
            io.to(socket).emit('new-chat', chats[0]);
          });
        }
        users.get(chats[0].Users[0].id).sockets.forEach((socket) => {
          io.to(socket).emit('new-chat', chats[1]);
        });
      } catch (error) {}
    });
  });
};

const getChatters = async (userId) => {
  // get all chatters that the user is chatting with
  try {
    const [result, metaData] = await sequelize.query(`
    select "cu"."userId" from "ChatUsers" as cu
    inner join (
        select "c"."id" from "Chats" as c
        where exists (
            select "u"."id" from "Users" as u
            inner join "ChatUsers" on u.id = "ChatUsers"."userId"
            where u.id = ${parseInt(userId)} and c.id = "ChatUsers"."chatId"
        )
    ) as cjoin on cjoin.id = "cu"."chatId"
    where "cu"."userId" != ${parseInt(userId)}
`);
    return result.length > 0 ? result.map((el) => el.userId) : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};
module.exports = SocketServer;
