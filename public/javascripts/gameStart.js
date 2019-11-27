// Ready 버튼 불러오기
const btnReady = document.querySelector(".readyButton");
console.log(btnReady.value);

btnReady.addEventListener("click", () => {
  socket.emit("gameStart", socket.name);
  // 또 레디 못누르게 막자
  btnReady.disabled = true;
});

// 시작 신호 처리
socket.on("startSignal", data => {
  // 시작하면 안 돼!
  if (data === "wait") {
    alert("최소 게임 인원에 미치지 못합니다. 기다려주세요!");
  } else if (data[socket.name].role === 1) {
    alert(`당신은 시민입니다.\n 번뜩이는 추리력으로 마피아를 모두 찾아내세요!`);
    socket.room = "citizen";
    // 버튼 숨기고 보이기
    btnReady.style.display = "none";
    document.querySelector(".voteButton").style.display = "block";
    // 서버로 낮 신호를 보내자.
    socket.emit("nextTurn", "day");
  } else if (data[socket.name].role === 2) {
    alert(`당신은 마피아입니다.\n 은밀하게 시민들을 살해하세요!`);
    socket.room = "mafia";
    // 버튼 숨기고 보이기
    btnReady.style.display = "none";
    document.querySelector(".voteButton").style.display = "block";
    // 서버로 낮 신호를 보내자.
    socket.emit("nextTurn", "day");
  }
  // 버튼 활성화
  btnReady.disabled = false;
});
socket.on("colorInversion", state => {
  if (state == "night") {
    // 하나만 실험해보자.
    // wrap.id = "wrap-dark";
  } else if (state == "day") {
  }
});
