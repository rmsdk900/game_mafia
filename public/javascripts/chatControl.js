// 관련 변수 들고 오기
const inputMainText = document.querySelector(".main_chat_text");
const btnSendMain = document.querySelector(".main_chat_send");
const inputSubText = document.querySelector(".sub_chat_text");
const btnSendSub = document.querySelector(".sub_chat_send");

// 스크롤 밑으로
function gotoBottom(cls) {
  const element = document.querySelector(cls);
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

/* 메인채팅*/
// 엔터로 메시지 보내기
function keySendMessage(key) {
  if (key.keyCode == 13) {
    sendMessage();
    inputMainText.focus();
  }
}

//메시지 전송
function sendMessage(event) {
  // 메시지 가져오기
  const message = inputMainText.value;
  // 메시지를 적었을 때만 전송 가능
  if (message != "") {
    // 내가 전송한 메시지 채팅창에 표시
    const chatWindow = document.querySelector(".main_chat");
    const chatLine = document.createElement("div");
    const node = document.createTextNode(`나 : ${message}`);

    chatLine.classList.add("my");
    chatLine.appendChild(node);
    chatWindow.appendChild(chatLine);
    // // 스크롤 밑으로
    gotoBottom(".main_chat");

    // 서버로 메시지와 필요 데이터 전달
    socket.emit("sendMsg", { type: "mainMsg", message: message });

    // 입력창 비우기
    document.querySelector(".main_chat_text").value = "";
  }
}

// 메시지 받아서 표시
socket.on("mainMsg", data => {
  const chatWindow = document.querySelector(".main_chat");
  const chatLine = document.createElement("div");
  const node = document.createTextNode(`${data.name} : ${data.message}`);

  chatLine.classList.add("other");
  chatLine.appendChild(node);
  chatWindow.appendChild(chatLine);
});

/* 서브 채팅 */
function keySendSubMessage(key) {
  if (key.keyCode == 13) {
    sendSubMessage();
  }
}
function sendSubMessage(event) {
  // 메시지 가져오기
  const message = inputSubText.value;
  // 메시지를 적었을 때만 전송 가능
  if (message != "") {
    // 내가 전송한 메시지 채팅창에 표시
    const chatWindow = document.querySelector(".sub_chat");
    const chatLine = document.createElement("div");
    const node = document.createTextNode(`나 : ${message}`);

    chatLine.classList.add("my");
    chatLine.appendChild(node);
    chatWindow.appendChild(chatLine);

    // // 스크롤 밑으로
    gotoBottom(".sub_chat");

    // 서버로 메시지와 필요 데이터 전달
    socket.emit("sendMsg", { type: "subMsg", message: message });

    // 입력창 비우기
    document.querySelector(".sub_chat_text").value = "";
  }
}
// 메시지 받아서 표시
socket.on("subMsg", data => {
  const chatWindow = document.querySelector(".sub_chat");
  const chatLine = document.createElement("div");
  const node = document.createTextNode(`${data.name} : ${data.message}`);

  chatLine.classList.add("other");
  chatLine.appendChild(node);
  chatWindow.appendChild(chatLine);
});

socket.on("clearRoleChat", data => {
  const subChatBox = document.querySelector(".sub_chat");
  while (subChatBox.hasChildNodes()) {
    subChatBox.removeChild(subChatBox.firstChild);
  }
});

socket.on("clearMainChat", data => {
  const mainChatBox = document.querySelector(".main_chat");
  while (mainChatBox.hasChildNodes()) {
    mainChatBox.removeChild(mainChatBox.firstChild);
  }
});

/**
 * 낮
 */
// 채팅 권한 관리
socket.on("canSpeak", data => {
  // 역할이나 죽은 정도에 따라 나누자. 시민, 마피아, 유령
  // 일단 살아있는 사람들
  if (data.alive === true) {
    inputMainText.disabled = false;
    //시민
    if (data.role === 1) {
      inputSubText.disabled = true;
      //마피아
    }
    // else if (data.role === 2) {
    //   inputSubText.disabled = false;
    // }
    // 유령
  } else {
    inputMainText.disabled = true;
  }
});
/**
 * 밤
 */
// 마피아 서브 채팅 열기
socket.on("whisper", userList => {
  // 내가 마피아일 경우
  if (userList[socket.name].role == 2) {
    inputSubText.disabled = false;
    inputMainText.disabled = true;
    //시민이면 메인 창 닫자
  } else if (userList[socket.name].role == 1) {
    inputSubText.disabled = true;
    inputMainText.disabled = true;
  }
});

// 메소드들 실행
function init() {
  inputMainText.focus();
  inputMainText.addEventListener("keydown", keySendMessage);
  btnSendMain.addEventListener("click", sendMessage);
  inputSubText.addEventListener("keydown", keySendSubMessage);
  btnSendSub.addEventListener("click", sendSubMessage);
}

init();
