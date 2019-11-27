// 공지 처리
socket.on("notice", data => {
  //element 불러오기
  const mainChat = document.querySelector(".main_chat");
  const subChat = document.querySelector(".sub_chat");
  const chatLine = document.createElement("div");
  // 나머지 사용 변수
  let className = "";
  let node = "";
  // 서버에서 온 data 분류
  // 시민 방에 들어감.
  if (data.type == "enterCitizen") {
    className = "login";
    node = document.createTextNode(`${data.msg}님이 입장하셨습니다.`);
    // 형성
    chatLine.classList.add(className);
    chatLine.appendChild(node);
    mainChat.appendChild(chatLine);
  } else if (data.type == "exitGame") {
    className = "logout";
    node = document.createTextNode(`${data.msg}님이 퇴장하셨습니다.`);
    // 형성
    chatLine.classList.add(className);
    chatLine.appendChild(node);
    mainChat.appendChild(chatLine);
  } else if (data.type == "enterMafia") {
    className = "mafia";
    node = document.createTextNode(`${data.msg}님은 마피아입니다!`);
    // 형성
    chatLine.classList.add(className);
    chatLine.appendChild(node);
    subChat.appendChild(chatLine);
  } else if (data.type == "heDied") {
    className = "died";
    node = document.createTextNode(`${data.msg}님이 사망하셨습니다...`);
    // 형성
    chatLine.classList.add(className);
    chatLine.appendChild(node);
    mainChat.appendChild(chatLine);
  } else if (data.type == "enterTomb") {
    className = "died";
    node = document.createTextNode(`${data.msg}님은 유령이 되셨습니다.`);
    // 형성
    chatLine.classList.add(className);
    chatLine.appendChild(node);
    subChat.appendChild(chatLine);
  }
  //나중에 형성하는 것들도 함수로 처리하자
  function mainPrintln() {}
  function subPrintln() {}
});
// 현황 발표
socket.on("nowAlive", data => {
  // 죽지 않은 애들의 메시지
  if (data[socket.name].alive === true) {
    //userList 안의 애들 살아있는 애들 중 역할을 보고 알려주자
    let citizenNum = 0;
    let mafiaNum = 0;
    for (let i = 0; i < Object.keys(data).length; i++) {
      // 살아있는 애만
      if (data[Object.keys(data)[i]].alive === true) {
        // 시민일 경우
        if (data[Object.keys(data)[i]].role === 1) {
          citizenNum++;
        } else if (data[Object.keys(data)[i]].role === 2) {
          mafiaNum++;
        }
      }
    }
    alert(`현재 시민은 ${citizenNum}명, 마피아는 ${mafiaNum}명 남았습니다.`);
  } else {
    alert(`당신은 사망하셨습니다!`);
  }
});
// 투표가 불발되어 턴을 넘길 때
socket.on("skipDay", userList => {
  alert(`최다득표자가 없어 밤이 됩니다..`);

  // 여기도 밤을 보내자.
  socket.emit("nextTurn", "night");
});
// 투표가 불발되어 턴을 넘길 때
socket.on("skipNight", userList => {
  alert(`암살목표가 통일되지 않아서 아무 일도 없이 날이 밝았습니다!`);

  // 낮을 보내자
  socket.emit("nextTurn", "day");
});
// 다음 턴
socket.on("nextNight", userList => {
  alert(`밤이 됩니다.`);

  // 여기도 밤을 보내자.
  socket.emit("nextTurn", "night");
});
// 다음 턴
socket.on("nextDay", userList => {
  alert(`낮이 됩니다.`);

  // 여기도 낮을 보내자.
  socket.emit("nextTurn", "day");
});
//승리 메시지 출력
socket.on("victory", (winner, userList) => {
  if (winner === "citizen") {
    console.log("시민팀 승리!");
    //본인이 승리했는지 알려주기
    if (userList[socket.name].role == 1) {
      alert("승리하셨습니다!\n 당신은 모든 마피아를 잡아냈습니다!");
    } else {
      alert("패배하셨습니다.\n 마피아들이 모든 시민들을 몰살했습니다!");
    }
  } else if (winner === "mafia") {
    console.log("마피아팀 승리!");
    //본인이 승리했는지 알려주기
    if (userList[socket.name].role == 2) {
      alert("승리하셨습니다!\n 당신은 모든 시민들을 몰살했습니다!");
    } else {
      alert("패배하셨습니다.\n 당신들은 시민들에게 모두 붙잡혔습니다!");
    }
  }
  // 투표버튼 죽이고 레디 버튼 살리기
  document.querySelector(".voteButton").style.display = "none";
  document.querySelector(".readyButton").style.display = "block";
  // 아이콘도 청소
  const iconBoard = document.querySelector("#vote");
  while (iconBoard.hasChildNodes()) {
    iconBoard.removeChild(iconBoard.firstChild);
  }
  // 다시 시작?
  socket.emit("enterRoom", socket.name);
});
//스크립트 시작 함수
function init() {}
init();
