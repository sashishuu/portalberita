module.exports = (io, socket) => {
  socket.on('new_comment', (data) => {
    // Broadcast ke semua user kecuali pengirim
    socket.broadcast.emit('notify_comment', {
      articleId: data.articleId,
      message: `💬 Komentar baru pada artikel "${data.articleTitle}"`,
    });
  });
};
