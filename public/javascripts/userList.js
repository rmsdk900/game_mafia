// 리스트 받을 때마다 갱신되게 하기
socket.on("makeList", data => {
  console.log(`그려야 할 리스트 : ${data}`);
  const listContainer = document.querySelector(".user_list");
  //일단 중복되지 않게 비우기
  while (listContainer.hasChildNodes()) {
    listContainer.removeChild(listContainer.firstChild);
  }
  //그려줍시다!
  for (let i = 0; i < Object.keys(data).length; i++) {
    const listDiv = document.createElement("div");
    const node = document.createTextNode(Object.keys(data)[i]);
    listDiv.appendChild(node);
    listContainer.appendChild(listDiv);
  }
});
