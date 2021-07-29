var url = "http://localhost:3000/";
var current_active_tab = "Matches";

function openTab(evt, tabName) {
  let i, tabContent, tabButtons;

  tabContent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  divContent = document.getElementsByClassName("div_content");
  for (i = 0; i < divContent.length; i++) {
    divContent[i].style.display = "none";
  }

  tabButtons = document.getElementsByClassName("tabButtons");
  for (i = 0; i < tabButtons.length; i++) {
    tabButtons[i].className = tabButtons[i].className.replace(" active", "");

  }

  document.getElementById(tabName).style.display = "block";
  current_active_tab = tabName;
  if (current_active_tab == "messagesTab") {
    checkIfNewMesage();
    fetchNewMsgSide();
  }
  evt.currentTarget.className += " active";

  document.getElementById("div_" + tabName).style.display = "block";
}

$("#accept").on("click", function () {
  alert("Work out request sent");
})

// for messages section - Vidhi Vora
setInterval(function () {
  console.log("Tab: " + current_active_tab);
  if (current_active_tab == "messagesTab") {
    // fetchNewMesage();
  }
}, 30000);

var user_id = $("#accessUserInfo").data("userid");
function checkIfNewMesage() {
  $.ajax({
    url: url + "checkNewMessage",
    type: "POST",
    crossDomain: true,
    data: {
      userid: user_id
    },
    success: function (response) {
      if (response.status == "success") {
        if (response.data['is_new_msg'] == 1) {
          fetchNewMsgDiv($("#fromuser").data("userid"));
        }
      } else {
        $("label[for='messageError']").text("Please refresh the page");
      }
    },
    error: function () {
      alert("Something went wrong. Please try again!!!");
    }
  });
}
function fetchNewMsgSide() {
  $.ajax({
    url: url + "getNewMessagesSide",
    type: "POST",
    crossDomain: true,
    data: {
      userid: user_id
    },
    success: function (response) {
      if (response.status == "success") {
        var from = response.data.from;
        var to = response.data.to;
        var used = [];
        var uid = '', uname = '';
        var html = "";
        console.log(from);
        console.log(to);
        for (var m1 in from) {
          for (var m2 in to) {
            if (from[m1]['date_updated'] < to[m2]['date_updated'] && !used.includes(to[m2]['to_user_id'])) {
              if(uid == '') {
                uid = to[m2]['to_user_id'];
                uname = to[m2]['name'];
              }
              used.push(to[m2]['to_user_id']);
              html += '<div class="messages"><div class="avatar"><img src="https://randomuser.me/api/portraits/women/28.jpg" alt=""> </div><div class="friend"><div class="user">' + to[m2]['name'] + '</div><div class="timedisplay">Last sent on: ' + to[m2]['date_updated'].replace('T', ' ').replace(".000Z", " ") + '</div> </div> </div>'
            } else if (!used.includes(from[m1]['from_user_id'])) {
              if(uid == '') {
                uid = from[m1]['from_user_id'];
                uname = from[m1]['name'];
              }
              used.push(from[m1]['from_user_id']);
              html += '<div class="messages"><div class="avatar"><img src="https://randomuser.me/api/portraits/women/28.jpg" alt=""> </div><div class="friend"><div class="user">' + from[m1]['name'] + '</div><div class="timedisplay">Last received on: ' + from[m1]['date_updated'].replace('T', ' ').replace(".000Z", " ") + '</div> </div> </div>'
            }
          }
        }
        $("#sidemsginfo").html(html);
        fetchNewMsgDiv(uid, uname);
      } else {
        $("label[for='messageError']").text("Please refresh the page");
      }
    },
    error: function () {
      alert("Something went wrong. Please try again!!!");
    }
  });
}

function fetchNewMsgDiv(from_user_id, uname) {
  $.ajax({
    url: url + "getNewMessagesDiv",
    type: "POST",
    crossDomain: true,
    data: {
      userid: user_id,
      fromid: from_user_id
    },
    success: function (response) {
      if (response.status == "success") {
        var msgdata = response.data;
        var  html = '';
        for (var msg in msgdata) {
          console.log(msg);
          if (msgdata[msg]['to_user_id'] == user_id) {
            html += '<div class="row"> <div class="col-lg-6"> <label class = "form-control" for="usermessage">' + msgdata[msg]['message'] + ' </br><span class = "timedisplay">' + msgdata[msg]['date_updated'].replace('T', ' ').replace(".000Z", " ") + '</span> </label> </div> </div>';
          } else {
            html += '<div class="row"> <div class="col-lg-6"> </div> <div class="col-lg-6"> <label class = "form-control" for="usermessage">' + msgdata[msg]['message'] + ' </br><span class = "timedisplay">' + msgdata[msg]['date_updated'].replace('T', ' ').replace(".000Z", " ") + '</span> </label> </div> </div>';
          }
        }
        html += ' <div class="row"> <div class="col-lg-6">&nbsp;</div>  </div> <div class="row"> <div class="col-lg-6">&nbsp;</div>  </div>';
        $("#messagingdiv").html(html);
        $("#usernamemsg").html(uname);
        $("#sendMessage").setAttribute('touser', from_user_id);
      } else {
        $("label[for='messageError']").text("Please refresh the page");
      }
    },
    error: function () {
      alert("Something went wrong. Please try again!!!");
    }
  });
}
