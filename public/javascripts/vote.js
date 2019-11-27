// icon 컨테이너랑 버튼
const iconBoard = document.querySelector("#vote");
const btnVote = document.querySelector(".voteButton");
// 투표할 이름
let candidate = "";
// 암살 대상
let target = "";
/**
 * 낮
 */
socket.on("makeIcon", data => {
  // 일단 얘도 깨끗이 청소
  while (iconBoard.hasChildNodes()) {
    iconBoard.removeChild(iconBoard.firstChild);
  }

  for (let i = 0; i < Object.keys(data).length; i++) {
    const iconDiv = document.createElement("div");
    const iconName = document.createElement("div");
    iconName.innerText = Object.keys(data)[i];
    iconName.classList.add("nameTag");
    // 죽지 않은 유저
    if (data[Object.keys(data)[i]].alive === true) {
      iconDiv.classList.add("user");
      iconDiv.appendChild(iconName);

      // 클릭 시 이벤트 발생!
      iconDiv.addEventListener("click", () => {
        // 클릭한 사람만 바꾸기
        iconDiv.id = "selectedUser";

        // 다른 놈들은 빼야 됨.
        const allIcons = document.getElementsByClassName("user");
        for (let i = 0; i < allIcons.length; i++) {
          if (
            allIcons[i].firstChild.innerText != iconDiv.firstChild.innerText &&
            allIcons[i].id == "selectedUser"
          ) {
            allIcons[i].id = "";
          }
        }
        // 당선자 선정
        candidate = document.getElementById("selectedUser").firstChild
          .innerText;
        console.log(`당신이 선택한 사람은 ${candidate}입니다!`);
      });
      // 사망하신 분
    } else {
      iconDiv.classList.add("undead");
      iconDiv.appendChild(iconName);

      iconDiv.addEventListener("click", () => {
        alert("시체는 고를 수 없습니다!");
      });
    }
    // 만들어진 애 넣기
    iconBoard.appendChild(iconDiv);
  }
});

// 투표하기
btnVote.addEventListener("click", suspect);

function suspect() {
  console.log(`투표 버튼 클릭`);
  // 시민 투표
  if (candidate != "") {
    if (
      confirm(
        `당신이 선택한 사람은 ${candidate}입니다.\n 정말 투표하시겠습니까?`
      )
    ) {
      // 전달하고 버튼 닫고 초기화
      socket.emit("killUser", candidate);
      btnVote.disabled = true;
      // 아이콘 아이디도 빼자
      const allIcons = document.getElementsByClassName("user");
      for (let i = 0; i < allIcons.length; i++) {
        if (allIcons[i].id == "selectedUser") {
          allIcons[i].id = "";
        }
      }
      candidate = "";
    }
    // 암살 대상
  } else if (target != "") {
    if (confirm(`당신의 목표는 ${target}입니다.\n 정말 암살하시겠습니까?`)) {
      // 전달하고 버튼 닫고 초기화
      socket.emit("killUser", target);
      btnVote.disabled = true;
      // 아이콘 아이디도 빼자
      const allIcons = document.getElementsByClassName("user");
      for (let i = 0; i < allIcons.length; i++) {
        if (allIcons[i].id == "selectedUser") {
          allIcons[i].id = "";
        }
      }
      target = "";
    }
  } else {
    alert("선택한 사람이 없습니다!");
  }
}
// 투표로 매장 당한 사람
socket.on("moveRoom", data => {
  console.log("내가 방 이동 요청 받음");
  socket.emit("funeral", socket.name);
});
// 투표권한 박탈
socket.on("unvoteable", data => {
  // 내가 시체가 아닐 경우만 열자
  if (data[socket.name].alive == true) {
    btnVote.disabled = false;
  }
});
/**
 * 밤
 */
socket.on("onlyCitizenIcon", data => {
  // 일단 얘도 깨끗이 청소
  while (iconBoard.hasChildNodes()) {
    iconBoard.removeChild(iconBoard.firstChild);
  }

  for (let i = 0; i < Object.keys(data).length; i++) {
    if (
      data[Object.keys(data)[i]].alive === true &&
      data[Object.keys(data)[i]].role == 1
    ) {
      const iconDiv = document.createElement("div");
      const iconName = document.createElement("div");
      iconName.innerText = Object.keys(data)[i];
      iconName.classList.add("nameTag");
      // 죽지 않은 시민 유저
      iconDiv.classList.add("user");
      iconDiv.appendChild(iconName);

      // 클릭 시 이벤트 발생!
      iconDiv.addEventListener("click", () => {
        // 클릭한 사람만 바꾸기
        iconDiv.id = "selectedUser";

        // 다른 놈들은 빼야 됨.
        const allIcons = document.getElementsByClassName("user");
        for (let i = 0; i < allIcons.length; i++) {
          if (
            allIcons[i].firstChild.innerText != iconDiv.firstChild.innerText &&
            allIcons[i].id == "selectedUser"
          ) {
            allIcons[i].id = "";
          }
        }
        // 암살대상 선정
        target = document.getElementById("selectedUser").firstChild.innerText;
        console.log(`암살대상은 ${target}입니다!`);
      });
      // 만들어진 애 넣기
      iconBoard.appendChild(iconDiv);
    }
  }
});
socket.on("rightofMafia", userList => {
  // 마피아 아니면 다 버튼 비활성화
  if (userList[socket.name].role != 2) {
    btnVote.disabled = true;
  } else {
    btnVote.disabled = false;
  }
});
// 암살 당한 사람
socket.on("murdered", data => {
  console.log("내가 방 이동 요청 받음");
  socket.emit("funeral", socket.name);
});
