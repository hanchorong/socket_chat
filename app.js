const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use("/static", express.static("static"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

// var client_list = [];
var client_list = {};

io.on("connection", function (socket) {
  console.log("Server Socket Connected");

  socket.on("sendMSG", (data) => {
    console.log("내메세지 데이터", data);

    // 전체메세지
    if (data.dm == "all") {
      // io.emit("chatSend", data.msg);
      io.emit("chatSend", { msg: data.msg, nick: data.nick, HMS: data.HMS });
    } else {
      const dmStateData = {
        msg: data.msg,
        nick: data.nick,
        dm: "dmStyle",
        HMS: data.HMS,
      };
      io.to(data.dm).emit("chatSend", dmStateData);
      socket.emit("chatSend", dmStateData);
    }
    // client_list.push(socket.id);
    // io.emit("userList", client_list);
  });

  socket.on("setNick", (nick) => {
    console.log("aaaa", Object.values(client_list));
    //배열에서 내가 원하는값 존재여부 확인할수있는 함수 : arr_name.indexOf()
    //client_list 라는 배열의 value들을 받아와서 그 중 nick이라는 값을 가진 인덱스가 있는지 알아보는 if문이다. 닉네임이 없다면 -1을 반환함 있다면 그 인덱스의 위치값을 반환함.
    if (Object.values(client_list).indexOf(nick) > -1) {
      socket.emit("err", "중복되는 닉네임입니다.");
    } else {
      client_list[socket.id] = nick; //socket.id 라는 키값이 있다면 nick으로 바꿔줘
      console.log(client_list);
      io.emit("notice", nick);
      socket.emit("entrySuccess", "입장완");
      io.emit("clientUpdate", client_list);
    }
  });

  socket.on("disconnect", () => {
    delete client_list[socket.id];
    io.emit("clientUpdate", client_list);
  });
});

http.listen(8000, () => {
  console.log("server open", 8000);
});
