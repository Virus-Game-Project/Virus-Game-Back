module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('unirseSala', (sala) => {
            socket.join(sala);
            io.to(sala).emit('mensaje', `El usuario ${socket.id} se unió a la sala.`);
        });

        socket.on('mensajeSala', ({ sala, mensaje }) => {
            io.to(sala).emit('mensaje', mensaje);
        });

        socket.on('salirseSala', (sala) => {
            socket.leave(sala);
            io.to(sala).emit('mensaje', `El usuario ${socket.id} se salió de la sala.`);
        });
    });
}