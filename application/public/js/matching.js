// var url = "http://localhost:3000/";
var url = "http://100.26.92.104:3000/";
var current_active_tab = "Matches";
var user_id = $("#accessUserInfo").data("userid");
var sessionInfo = {};

function checkUserLoggedIn() {
  $.ajax({
    url: url + "checkUserLoggedIn",
    type: "POST",
    crossDomain: true,
    success: function (response) {
      if (response.status == "failure") {
        alert('Log in first');
        window.location.href = '../index.html';
      } else {
        sessionInfo = response.data.data;
        user_id = sessionInfo.user_id;
        $("#accessUserInfo").attr('data-userid', sessionInfo.reg_id);
        $("#avatarimguser").attr("src", "../images/user_picture/" + user_id + ".jpeg");
        getUserMatches(0);
      }
    },
    error: function () {
    }
  });
}

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
  } else if (current_active_tab == "myMatchesTab") {
    loadMatches();
  }
  evt.currentTarget.className += " active";
  document.getElementById("div_" + tabName).style.display = "block";
}

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
        if (response.data && response.data['is_new_msg'] == 1) {
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
      console.log(response);
      if (response.status == "success") {
        var from = response.data.from;
        var to = response.data.to;
        var used = [];
        var uid = '', uname = '';
        var html = "";
        for (var m1 in from) {
          for (var m2 in to) {
            var d1 = new Date(from[m1]['date_updated']);
            var d2 = new Date(to[m2]['date_updated']);
            if (d1 < d2) {
              if (!used.includes(to[m2]['to_user_id'])) {
                if (uid == '') {
                  uid = to[m2]['to_user_id'];
                  uname = to[m2]['name'];
                }
                used.push(to[m2]['to_user_id']);
                html += '<div class="messages" user_id=' + to[m2]['to_user_id'] + '><div class="avatar"><img src="../images/user_picture/' + to[m2]['to_user_id'] + '.jpeg" alt=""> </div><div class="friend"><div class="user">' + to[m2]['name'] + '</div><div class="timedisplay">Last sent on: ' + to[m2]['date_updated'].replace('T', ' ').replace(".000Z", " ") + '</div> </div> </div>'
              }
            } else {
              if (!used.includes(from[m1]['from_user_id'])) {
                if (uid == '') {
                  uid = from[m1]['from_user_id'];
                  uname = from[m1]['name'];
                }
                used.push(from[m1]['from_user_id']);
                html += '<div class="messages" user_id=' + from[m1]['from_user_id'] + '><div class="avatar"><img src="../images/user_picture/' + from[m1]['from_user_id'] + '.jpeg" alt=""> </div><div class="friend"><div class="user">' + from[m1]['name'] + '</div><div class="timedisplay">Last received on: ' + from[m1]['date_updated'].replace('T', ' ').replace(".000Z", " ") + '</div> </div> </div>'
              }
            }
          }
        }
        $("#sidemsginfo").html(html);
        fetchNewMsgDiv(uid, uname);
      } else {
        $("label[for='messageError']").text("No messages");
        $("#messagingdiv").html('<div class="col-lg-12"><h3>&nbsp; No messages to show</h3></div> ');
        $("#imageDivMessages").css('display', 'none');
        $("#messagesTabRow").css('display', 'none');
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
        var html = '';
        for (var msg in msgdata) {
          if (msgdata[msg]['to_user_id'] == user_id) {
            html += '<div class="row"> <div class="col-lg-6"> <label class = "form-control" for="usermessage">' + msgdata[msg]['message'] + ' </br><span class = "timedisplay">' + msgdata[msg]['date_updated'].replace('T', ' ').replace(".000Z", " ") + '</span> </label> </div> </div>';
          } else {
            html += '<div class="row"> <div class="col-lg-6"> </div> <div class="col-lg-6"> <label class = "form-control" for="usermessage">' + msgdata[msg]['message'] + ' </br><span class = "timedisplay">' + msgdata[msg]['date_updated'].replace('T', ' ').replace(".000Z", " ") + '</span> </label> </div> </div>';
          }
        }
        html += ' <div class="row"> <div class="col-lg-6">&nbsp;</div>  </div> <div class="row"> <div class="col-lg-6">&nbsp;</div>  </div>';
        $("#messagingdiv").html(html);
        $("#usernamemsg").html(uname);
        $("#sendMessage").removeAttr('disabled');
        $("#sendMessage").attr('touser', from_user_id);
        $("#imageDivMessages").css('display', 'block');
        $("#messagesTabRow").css('display', 'block');
      } else {
        $("label[for='messageError']").text("Please refresh the page");
      }
    },
    error: function () {
      alert("Something went wrong. Please try again!!!");
    }
  });
}

function loadMatches() {
  $.ajax({
    url: url + "loadMatches",
    type: "POST",
    crossDomain: true,
    data: {
      userid: user_id,
    },
    success: function (response) {
      if (response.status == "success") {
        var data = response.data;
        $("label[for='messageErrorSent']").text("No requests Sent");
        $("#matchsent").html("");
        $("label[for='messageErrorReceived']").text("No requests Received");
        $("#matchreceived").html("");
        var html = "";
        if (data['received'].length > 0) {
          $("label[for='messageErrorReceived']").text("Requests Received");
          for (var index in data['received']) {
            html += '<div class="messages" status="' + data['received'][index]['request_status'] + '" tabid="' + data['received'][index]['workout_id'] + '" user_id=' + data['received'][index]['from_user_id'] + '> <div class="avatar"> <img src="../images/user_picture/' + data['received'][index]['from_user_id'] + '.jpeg" alt=""> </div><div class="friend"> <div class="user">' + data['received'][index]['name'] + '</div> <div class="timedisplay">' + data['received'][index]['date_sent'].replace('T', ' ').replace(".000Z", " ") + '</div>  </div> </div>';
          }
          $("#matchreceived").html(html);
        }
        if (data['sent'].length > 0) {
          $("label[for='messageErrorSent']").text("Requests Sent");
          html = "";
          for (var index in data['sent']) {
            html += '<div class="messages" status="' + data['sent'][index]['request_status'] + '" tabid="' + data['sent'][index]['workout_id'] + '" user_id=' + data['sent'][index]['to_user_id'] + '> <div class="avatar"> <img src="../images/user_picture/' + data['sent'][index]['to_user_id'] + '.jpeg" alt=""> </div><div class="friend"> <div class="user">' + data['sent'][index]['name'] + '</div> <div class="timedisplay">' + data['sent'][index]['date_sent'].replace('T', ' ').replace(".000Z", " ") + '</div>  </div> </div>';
          }
          $("#matchsent").html(html);
        }
      } else {
        $("label[for='messageErrorSent']").text("Please refresh the page");
        $("label[for='messageErrorReceived']").text("Please refresh the page");
      }
    },
    error: function () {
      alert("Something went wrong. Please try again!!!");
    }
  });
}


function updateRequest(id, status) {
  var result;
  $.ajax({
    url: url + "updateRequestStatus",
    type: "POST",
    crossDomain: true,
    data: {
      id: id,
      status: status
    },
    async: false,
    success: function (response) {
      result = response;
    },
    error: function () {
      alert("Something went wrong. Please try again!!!");
    }
  });
  return result;
}

function getUserMatches(no) {
  var result = {};
  var zip_code, gender, activity_type;
  if ($("#filterzipcode").val().length == 5) {
    zip_code = $("#filterzipcode").val();
  }
  if ($('input[name=filterGender]:checked').val() != "") {
    gender = $('input[name=filterGender]:checked').val();
  }

  $("#activities button").each(function (index) {
    if ($(this).hasClass("active") === true) {
      activity_type += ', "'+$(this).data('info')+'"';
    }
  });

  if (activity_type) {
    activity_type = activity_type.replace(/^,/, '');
  }
  console.log()
  $.ajax({
    url: url + "getWorkOutBuddies",
    type: "POST",
    crossDomain: true,
    data: {
      id: user_id,
      no: no,
      zip_code: zip_code,
      activity_type: activity_type,
      gender: gender
    },
    async: false,
    success: function (response) {
      result = response;
    },
    error: function () {
      alert("Something went wrong. Please try again!!!");
    }
  });
  if (result.status == "success") {
    if (result.data['data']) {
      var info = result.data['data'];
      var html = '<img class="user" src="../images/user_picture/' + info.reg_id + '.jpeg" /><div class="profile"><div class="name">' + info.name + '</div></div>';
      $("#filtermatchesdiv").html(html);

      var html1 = '<label>Name: ' + info.name + '</label></br><label>Zipcode: ' + info.zip_code + '</label></br><label>Gender: ' + info.gender + '</label></br><label>Birthdate: ' + new Date(info.birthdate).toISOString().substring(0, 10) + '</label></br><label>Passion: ' + info.activity_type.replaceAll('_', ' ').replaceAll(',', ', ').replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
        function ($1) {
          return $1.toUpperCase();
        }) + '</label>';
      $("#userinfodiv").html(html1);
      $("#filterbuttons").css('display', '');
      $("#filterbuttons").attr("resno", result.data['no']);
      $("#filterbuttons").attr("userid", info.user_id);
    } else {
      $("#filtermatchesdiv").html('<div class="col-lg-12"><h3>&nbsp;</h3> </div><div class="col-lg-12"><h3>&nbsp; No more </h3></div><div class="col-lg-12"><h3>&nbsp; recommendations </h3></div><div class="col-lg-12"><h3>&nbsp; to show</h3></div>');
      $("#filterbuttons").css('display', 'none');
    }
  }
}

checkUserLoggedIn();

$(document).ready(function () {

  $("#sidemsginfo").on("click", ".messages", function () {
    var userid = $(this).attr('user_id');
    var username = $(this).find(".user").text();
    fetchNewMsgDiv(userid, username);
  });

  $("#sendMessage").on("click", function () {
    var content = $("#sendMessageText").val();
    var to_user_id = $("#sendMessage").attr('touser');
    if (content.length > 0) {
      $.ajax({
        url: url + "sendUserMessage",
        type: "POST",
        crossDomain: true,
        data: {
          from_user_id: user_id,
          to_user_id: to_user_id,
          message: content
        },
        success: function (response) {
          if (response.status == "success") {
            fetchNewMsgDiv(to_user_id, $("#usernamemsg").text());
            $("#sendMessageText").val('');
          } else {
            $("label[for='messageError']").text("Please try again");
          }
        },
        error: function () {
          alert("Something went wrong. Please try again!!!");
        }
      });
    }
  });

  $("#matchreceived").on("click", ".messages", function () {
    var userid = $(this).attr('user_id');
    var username = $(this).find(".user").text();
    var tabid = $(this).attr('tabid');
    var html = '<img class="user" src="../images/user_picture/' + userid + '.jpeg" /> <div class="profile"><div class="name">' + username + '</div> <div class="local"> </div></div>';
    $("#matchesdiv").html(html);
    var button = "";
    if ($(this).attr('status') == 0) {
      button += '<div class="star" id="acceptRequest"><i class="fas fa-check"></i></div><div class="no" id="cancelRequest"><i class="fas fa-times"></i></div>';
    }
    button += '<div class="heart" id = "userProfile"><i class="fas fa-dumbbell"></i></div>';
    $("#buttonsdiv").html(button);
    $("#buttonsdiv").attr("tabid", tabid);
    $("#buttonsdiv").attr("userid", userid);
  });

  $("#matchsent").on("click", ".messages", function () {
    var userid = $(this).attr('user_id');
    var tabid = $(this).attr('tabid');
    var username = $(this).find(".user").text();
    var html = '<img class="user" src="../images/user_picture/' + userid + '.jpeg" /> <div class="profile"><div class="name">' + username + '</div> <div class="local">  </div></div>';
    $("#matchesdiv").html(html);
    var button = "";
    if ($(this).attr('status') == 0) {
      button += '<div class="no" id="cancelmyRequest"><i class="fas fa-times"></i></div>';
    }
    button += '<div class="heart" id = "userProfile"><i class="fas fa-dumbbell"></i></div>';
    $("#buttonsdiv").html(button);
    $("#buttonsdiv").attr("tabid", tabid);
    $("#buttonsdiv").attr("userid", userid);
  });

  $(document).on("click", "#acceptRequest", function (e) {

  });

  $(document).on("click", "#cancelRequest", function (e) {
    if (confirm("Sure REJECT request?") === true) {
      var tabid = $("#buttonsdiv").attr("tabid");
      var response = updateRequest(tabid, 2);
      if (response.status == 'success') {
        $('#cancelRequest').remove();
        $('div.messages[tabid = ' + tabid + ']').attr('status', 2);
      } else {
        alert(response.message);
      }
    }
  });

  $(document).on("click", "#cancelmyRequest", function (e) {
    if (confirm("Sure CANCEL request?") === true) {
      var tabid = $("#buttonsdiv").attr("tabid");
      var response = updateRequest(tabid, 3);
      if (response.status == 'success') {
        $('#cancelmyRequest').remove();
        $('div.messages[tabid = ' + tabid + ']').attr('status', 3);
      } else {
        alert(response.message);
      }
    }
  });

  $(document).on("click", "#userProfile", function () {
    $.ajax({
      url: url + "fetchUserInfo",
      type: "POST",
      crossDomain: true,
      data: {
        id: $("#buttonsdiv").attr("userid"),
      },
      success: function (response) {
        console.log(response);
        var info = response.data['0'];
        var html = '<label>Name: ' + info.name + '</label></br><label>Zipcode: ' + info.zip_code + '</label></br><label>Gender: ' + info.gender + '</label></br><label>Birthdate: ' + new Date(info.birthdate).toISOString().substring(0, 10) + '</label></br><label>Passion: ' + info.activity_type.replaceAll('_', ' ').replaceAll(',', ', ').replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
          function ($1) {
            return $1.toUpperCase();
          }) + '</label>';
        $("#userinfodiv").html(html);
        $('#userinfo').modal('show');
      },
      error: function () {
        alert("Something went wrong. Please try again!!!");
      }
    });
  });

  $(document).on("click", "#accept", function () {
    alert("Work out request sent");
  })

  $(document).on("click", "#viewProfile", function () {
    $('#userinfo').modal('show');
  })

  $(document).on("click", "#viewNext", function () {
    if (confirm("Sure View Next Profile ?") === true) {
      getUserMatches($("#filterbuttons").attr("resno"));
    }
  })

  $(document).on("click", "#sendRequest", function () {
    $('#requestMessageSent').modal('show');
  });

  $(document).on("click", "#sentUserRequest", function () {
    var msg = $("#requestMessageText").val();
    if (msg < 5) {
      $("#requestMessageText").css("border", "solid red 1px");
      return;
    }

    $("#requestMessageText").css("border", "");
    $.ajax({
      url: url + "sendWorkoutRequest",
      type: "POST",
      crossDomain: true,
      data: {
        to_user_id: $("#filterbuttons").attr("userid"),
        from_user_id: user_id,
        msg: msg
      },
      success: function (response) {
        console.log(response);
        if (response.status == 'success') {
          getUserMatches($("#filterbuttons").attr("resno"));
          alert("Request Sent");
        } else {
          alert("Something went wrong. Please try again");
        }
        $("#requestMessageText").val('');
        $('#requestMessageSent').modal('hide');
      },
      error: function () {
        alert("Something went wrong. Please try again!!!");
      }
    });
  })

  $(document).on("click", "#filterSearch", function () {
    getUserMatches(0);
  });

  // for messages section - Vidhi Vora
  setInterval(function () {
    if (current_active_tab == "messagesTab") {
      // checkIfNewMesage();
    }
  }, 30000);


});