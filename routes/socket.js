module.exports = io => {
  console.log("Server Socket 열림!");
  // 닉네임 : 아이디 객체 생성
  const idList = {};
  // 모든 유저 목록
  let userList = {};
  // 레디 카운트
  let readyCount = 0;
  // 투표 카운트
  let voteCount = 0;
  let mafiaVoteCount = 0;

  // 게임 중 flag
  let playing = false;
  // 낮 flag false면 밤으로
  let day = false;

  io.on("connection", socket => {
    console.log(`${socket.id}님이 접속하셨습니다.`);
    // 누군가 연결했으면 게임이 끊기게?
    socket.on("enterRoom", userName => {
      // 마피아였으면 방 나가기 초기화 해야지
      socket.leave("mafia");
      // 내가 게임 중에 들어왔다면?

      // 기본 유저 정보 - 이름 역할 생명 득표
      let userInfo = { userName: "noname", role: 1, alive: true, vote: 0 };
      // username socket에 저장
      socket.name = userName;
      console.log(`${socket.id}의 이름은 ${socket.name}`);
      // socket 객체에 넣어놓기
      idList[socket.name] = socket;
      // userList에 넣어놓기
      userList[socket.name] = userInfo;
      userList[socket.name].userName = socket.name;
      if (playing) {
        // 못들어오게 막자
        socket.emit("interrupt", "already");
        return;
      }
      console.log("-------현재 접속자들---------");
      console.log(userList);
      console.log("-------현재 접속자들---------");

      // 일단 시민 방에 들어가기 채팅은 해야하니까
      socket.join("citizen");
      socket.room = "citizen";
      //공지 뿌리기
      console.log(`${socket.name}님이 시민방에 참여하셨습니다.`);
      io.emit("notice", { type: "enterCitizen", msg: socket.name });
      // 유저 목록 뿌리기
      io.emit("makeList", userList);

      // 메인 채팅만 열기
      socket.emit("canSpeak", userList[socket.name]);
    });
    // 게임 시작 처리
    socket.on("gameStart", data => {
      console.log(`${data}님 준비완료!`);
      readyCount++;
      console.log(`준비 상태 : ${readyCount}/${Object.keys(userList).length}`);
      // 모두 준비 완료되면 게임 시작 나중에는 최소 인원도 추가하자.
      // if(Object.keys(userList).length>7){

      // 게임 시작!
      if (readyCount == Object.keys(userList).length) {
        // 레디 카운트 리셋
        readyCount = 0;
        // 다시 시작할 때를 대비해서 메인 챗도 클리어 하자
        io.emit("clearMainChat", "clear");
        // 그사람 채팅창도 바꾸기
        io.emit("clearRoleChat", "clear");

        // 마피아 1명
        if (Object.keys(userList).length == 4) {
          // 마피아 만들기
          selectMafia(1);
          // 여기에 게임 시작한다는 창 띄워주자!
          io.emit("startSignal", userList);
          // 마피아 2명
        } else if (Object.keys(userList).length > 4) {
          // 마피아 만들기
          selectMafia(2);
          // 여기에 게임 시작한다는 창 띄워주자!
          io.emit("startSignal", userList);

          // 마피아 3명
        } else if (Object.keys(userList).length >= 9) {
          // 마피아 만들기
          selectMafia(3);
          // 여기에 게임 시작한다는 창 띄워주자!
          io.emit("startSignal", userList);
          // 마피아 4명
        } else if (
          Object.keys(userList).length >= 16 &&
          Object.keys(userList).length <= 20
        ) {
          // 마피아 만들기
          selectMafia(4);
          // 여기에 게임 시작한다는 창 띄워주자!
          io.emit("startSignal", userList);
          // 수가 알맞지 않을때 시작 못하게!
        } else {
          console.log("인원이 맞지않음.");
          // 여기에 게임 시작한다는 창 띄워주자!
          io.emit("startSignal", "wait");
        }
      }
    });

    // 두 값 사이의 정수 난수 형성. min<=x<max. 구할 숫자 갯수
    function getRandomInt(min, max, goal) {
      let RandomInts = [];
      let RandomInt = 0;
      min = Math.ceil(min);
      max = Math.floor(max);
      while (RandomInts.length < goal) {
        RandomInt = Math.floor(Math.random() * (max - min)) + min;
        if (RandomInts.indexOf(RandomInt) == -1) {
          RandomInts.push(RandomInt);
        }
      }
      return RandomInts;
    }
    // 마피아 정하는 함수
    function selectMafia(num) {
      // 게임 시작 flag 활성화
      console.log("게임 시작!");
      playing = true;

      // 0<=x<접속인원-1 사이의 정수 num 갯수 만큼 생성
      const selectOrder = getRandomInt(0, Object.keys(userList).length, num);
      // 갯수 확인
      const names = Object.keys(userList);

      for (let i = 0; i < selectOrder.length; i++) {
        // 마피아 누군지 알려주기
        console.log(`마피아는 ${names[selectOrder[i]]}!`);
        // 마피아로 역할 변경
        userList[names[selectOrder[i]]].role = 2;
        // 마피아 선정된 인간 mafia 방에 집어넣기
        idList[names[selectOrder[i]]].join("mafia");
        // 그녀석의 socket.room도 바꾸기
        idList[names[selectOrder[i]]].room = "mafia";
      }
      for (let i = 0; i < selectOrder.length; i++) {
        // 마피아 방의 모든 사람들에게 알리기
        io.to("mafia").emit("notice", {
          type: "enterMafia",
          msg: idList[names[selectOrder[i]]].name
        });
      }
      // 아이콘 만들기
    }
    // Turn 넘기는 함수
    socket.on("nextTurn", state => {
      if (state == "day") {
        //flag 바꾸기
        day = true;
        // 모든 아이콘 뿌리기
        io.emit("makeIcon", userList);
        // 메인채팅방 모두에게 열기, 투표권한 다 열기
        io.emit("canSpeak", userList[socket.name]);
        io.emit("unvoteable", userList);
      } else if (state == "night") {
        //flag 바꾸기
        day = false;
        // 시민 아이콘만 뿌리자 (마피아에게만)
        io.to("mafia").emit("onlyCitizenIcon", userList);
        // 다른 애들은 투표 못하게 하고, 메인 채팅 닫고, 마피아 채팅 열기
        // 나중에 낮의 것이랑 통합시키자.
        io.emit("rightofMafia", userList);
        io.emit("whisper", userList);
      }
    });

    // 투표 요청 받았을 때. data = name
    socket.on("killUser", name => {
      // 낮일 때
      if (day) {
        console.log(`${socket.name}의 시민투표 진행`);
        // 일단 표 받은 사람 득표
        userList[name].vote += 1;
        console.log(userList[name]);
        // 투표 카운트도 올리기
        voteCount += 1;
        // 당선자, 최다 득표 수
        let elected = [];
        let maxVote = 0;
        // 생존자만 구하면 되잖아
        let aliveCount = 0;
        for (let i = 0; i < Object.keys(userList).length; i++) {
          if (userList[Object.keys(userList)[i]].alive === true) {
            aliveCount++;
          }
        }

        console.log(`투표인원/생존자 : ${voteCount}/${aliveCount}`);
        // 모두 투표 시
        if (voteCount === aliveCount) {
          console.log("개표 실행!");
          // 객체를 배열로 바꾸기
          const userArray = Object.values(userList);
          // 최다 득표수 찾기
          maxVote = Math.max.apply(
            Math,
            userArray.map(o => {
              return o.vote;
            })
          );
          console.log(`최다 득표 수 : ${maxVote}`);
          // 객체들을 돌면서 최다 득표자 찾기
          for (let i = 0; i < Object.keys(userList).length; i++) {
            if (maxVote === userList[Object.keys(userList)[i]].vote) {
              elected.push(userList[Object.keys(userList)[i]].userName);
            }
          }

          console.log(elected);
          // 이제 최다득표자가 한 명일 때와 여러 명일 때를 정하자
          if (elected.length === 1) {
            idList[elected[0]].emit("moveRoom", userList[elected[0]]);
            // 투표함도 초기화 하자
            for (let i = 0; i < Object.keys(userList).length; i++) {
              if (userList[Object.keys(userList)[i]].vote != 0) {
                userList[Object.keys(userList)[i]].vote = 0;
              }
            }

            // 최다득표자가 한 명 아니면 그냥 턴을 넘겨버리자.
          } else {
            // 투표함도 초기화 하자
            for (let i = 0; i < Object.keys(userList).length; i++) {
              if (userList[Object.keys(userList)[i]].vote != 0) {
                userList[Object.keys(userList)[i]].vote = 0;
              }
            }
            io.emit("skipDay", userList);
          }
          voteCount = 0;
        }
        //밤일 때
      } else {
        console.log(`${socket.name}의 암살투표 진행`);
        // 일단 표 받은 사람 득표
        userList[name].vote += 1;
        console.log(userList[name]);
        // 투표 카운트도 올리기
        mafiaVoteCount += 1;
        // 당선자, 최다 득표 수
        let elected = [];
        let maxVote = 0;
        // 살아있는 마피아 수 구하기 살아있는 사람 중 마피아 수
        let aliveMafia = 0;
        for (let i = 0; i < Object.keys(userList).length; i++) {
          if (
            userList[Object.keys(userList)[i]].alive === true &&
            userList[Object.keys(userList)[i]].role === 2
          ) {
            aliveMafia++;
          }
        }

        console.log(`투표인원/마피아 : ${mafiaVoteCount}/${aliveMafia}`);
        // 모두 투표 시
        if (mafiaVoteCount === aliveMafia) {
          console.log("개표 실행!");
          // 객체를 배열로 바꾸기
          const userArray = Object.values(userList);
          // 최다 득표수 찾기
          maxVote = Math.max.apply(
            Math,
            userArray.map(o => {
              return o.vote;
            })
          );
          console.log(`최다 득표 수 : ${maxVote}`);
          // 객체들을 돌면서 최다 득표자 찾기
          for (let i = 0; i < Object.keys(userList).length; i++) {
            if (maxVote === userList[Object.keys(userList)[i]].vote) {
              elected.push(userList[Object.keys(userList)[i]].userName);
            }
          }

          console.log(elected);
          // 이제 최다득표자가 한 명일 때와 여러 명일 때를 정하자
          if (elected.length === 1) {
            idList[elected[0]].emit("murdered", userList[elected[0]]);
            // 투표함도 초기화 하자
            for (let i = 0; i < Object.keys(userList).length; i++) {
              if (userList[Object.keys(userList)[i]].vote != 0) {
                userList[Object.keys(userList)[i]].vote = 0;
              }
            }

            // 최다득표자가 한 명 아니면 그냥 턴을 넘겨버리자.
          } else {
            io.emit("skipNight", userList);
            // 투표함도 초기화 하자
            for (let i = 0; i < Object.keys(userList).length; i++) {
              if (userList[Object.keys(userList)[i]].vote != 0) {
                userList[Object.keys(userList)[i]].vote = 0;
              }
            }
            night = false;
          }
          mafiaVoteCount = 0;
        }
      }
    });
    // 방 이동 처리 자기가 하는 거니까.
    socket.on("funeral", name => {
      //낮
      if (day) {
        console.log(socket.name);
        // 마피아였으면 방에서 나와야지
        if (userList[socket.name].role == 2) {
          socket.leave("mafia");
          // 그사람 채팅창도 바꾸기
          socket.emit("clearRoleChat", "clear");
        }

        // 시체로 만들기
        userList[socket.name].alive = false;
        socket.join("tomb");
        socket.room = "tomb";
        // 각 방 공지
        io.emit("notice", { type: "heDied", msg: socket.name });
        io.to("tomb").emit("notice", {
          type: "enterTomb",
          msg: socket.name
        });
        // 메인채팅창 못쓰게 하고, 서브 채팅창 쓸 수 있게 하자.
        socket.emit("canSpeak", userList[socket.name]);
        // 투표 권한은 모두 전달하되 유령은 활성화 되지 않게
        socket.emit("unvoteable", userList);
        // 현황 체크 및 승리 조건 확인
        nowCheck();
        //밤
      } else {
        console.log(socket.name);
        // 마피아였으면 방에서 나와야지
        if (userList[socket.name].role == 2) {
          socket.leave("mafia");
          // 그사람 채팅창도 바꾸기
          socket.emit("clearRoleChat", "clear");
        }

        // 시체로 만들기
        userList[socket.name].alive = false;
        socket.join("tomb");
        socket.room = "tomb";
        // 각 방 공지
        io.emit("notice", { type: "heDied", msg: socket.name });
        io.to("tomb").emit("notice", {
          type: "enterTomb",
          msg: socket.name
        });
        // 메인채팅창 못쓰게 하고, 서브 채팅창 쓸 수 있게 하자.
        socket.emit("canSpeak", userList[socket.name]);
        // 투표 되지 않게
        socket.emit("unvoteable", userList);
        // 현황 체크 및 승리 조건 확인
        nowCheck();
      }
    });
    //현황 공지 및 승리 요건 체크 함수 호출
    function nowCheck() {
      // 현황표시
      io.emit("nowAlive", userList);
      // 승리 조건 check;
      winnerCheck();
    }
    // 승리 요건 체크
    function winnerCheck() {
      //userList 안의 애들 살아있는 애들 중 역할을 보고 알려주자
      let citizenNum = 0;
      let mafiaNum = 0;
      for (let i = 0; i < Object.keys(userList).length; i++) {
        // 살아있는 애만
        if (userList[Object.keys(userList)[i]].alive === true) {
          // 시민일 경우
          if (userList[Object.keys(userList)[i]].role === 1) {
            citizenNum++;
          } else if (userList[Object.keys(userList)[i]].role === 2) {
            mafiaNum++;
          }
        }
      }
      // 시민팀 승리 조건
      if (mafiaNum === 0) {
        console.log("시민팀 승리!");
        // 게임 시작 flag 지우기
        playing = false;
        //전 소켓에 알려주기 그리고 게임 다시 활성화 준비해야 할 듯?
        io.emit("victory", "citizen", userList);
      } else if (citizenNum == mafiaNum) {
        console.log("마피아팀 승리!");
        // 게임 시작 flag 지우기
        playing = false;
        //전 소켓에 알려주고 다시 레디 버튼 살리기
        io.emit("victory", "mafia", userList);
        // 아직 누구도 승리하지 못할 때
      } else {
        if (day) {
          //밤으로 넘어가기
          io.emit("nextNight", userList);
        } else {
          io.emit("nextDay", userList);
        }
      }
    }

    // 메시지 처리
    socket.on("sendMsg", data => {
      //메인 메시지
      if (data.type == "mainMsg") {
        socket.broadcast.emit("mainMsg", {
          name: socket.name,
          message: data.message
        });
      } else if (data.type == "subMsg") {
        socket.broadcast.to(socket.room).emit("subMsg", {
          name: socket.name,
          message: data.message
        });
      }
    });
    // 접속이 끊기면
    socket.on("disconnect", () => {
      console.log(`${socket.name}님이 접속 종료하셨습니다.`);
      // 공지부터
      socket.broadcast.emit("notice", {
        type: "exitGame",
        msg: socket.name
      });
      // 마피아였으면 마피아 방에서도 나가야지
      if (userList[socket.name] && userList[socket.name].role == 2) {
        socket.leave("mafia");
      }
      // 죽어있었다면 시체 방에서도 나가야지
      if (userList[socket.name] && userList[socket.name].alive == false) {
        socket.leave("tomb");
      }
      // 메인 채팅방 나가기
      socket.leave("citizen");
      // userList에서 빼기
      delete userList[socket.name];
      console.log(userList);
      // socketList에서도 삭제
      delete idList[socket.name];

      // 유저 목록이랑 아이콘 뿌리기.
      io.emit("makeList", userList);
      // 게임 중에만 나갔을 때 아이콘 변경 가능! 내가 게임 중에 나간다면?
      if (playing) {
        io.emit("makeIcon", userList);
      }
    });
  });
};
