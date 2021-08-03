// var url = "http://localhost:3000/";
var url = "http://100.26.92.104:3000/";
// var testurl = "http://localhost:3000/";
var sessionInfo = {};
var workout_requests = [];
const nodes = {
  weights: "🏋️‍♀️ Weights",
  cycling: "🚴‍♂️ Cycling",
  mountain_biking: "🚵‍♀️ Mountain Biking",
  rock_climbing: "🧗‍♀️ Rock Climbing",
  rowing: "🚣 Rowing‍",
  waterpolo: "🤽 Waterpolo",
  swimming: "🏊‍♀️ Swimming",
  surfing: "🏄‍♀️ Surfing",
  horseriding: "🏇 Horseriding",
  golf: "🏌️‍♀️ Golf",
  handball: "🤾‍♀️ Handball",
  fencing: "🤺 Fencing",
  basketball: "⛹️‍♀️ Basketball",
  calisthenics: "🤸‍♀️ Calisthenics‍",
  wrestling: "🤼‍♀️ Wrestling",
  parasailing: "🪂 Parasailing",
  snowboarding: "🏂 Snowboarding",
  skiing: "⛷ Skiing",
  curling: "🥌 Curling",
  ice_skating: "⛸ Ice Skating",
  sleding: "🛷 Sleding",
  roller_skating: "🛼 Roller Skating",
  skating: "🛹 Skating‍",
  mma: "🥋 MMA",
  boxing: "🥊 Boxing",
  snorkeling: "🤿 Snorkeling",
  fishing: "🎣 Fishing",
  archery: "🏹 Archery",
  kite_flying: "🪁 Kite Flying",
  badminton: "🏸 Badminton",
  ultimate_boomerang: "🪃 Ultimate Boomerang",
  cricket: "🏏 Cricket",
  lacrosse: "🥍 Lacrosse",
  field_hockey: "🏑 Field Hockey",
  ice_hockey: "🏒 Ice Hockey",
  ping_pong: "🏓 Ping Pong",
  pool: "🎱 Pool",
  ultimate_frisbee: "🥏 Ultimate Frisbee",
  rugby: "🏉 Rugby",
  volleyball: "🏐 Volleyball",
  tennis: "🎾 Tennis",
  softball: "🥎 Softball",
  baseball: "⚾️ Baseball",
  american_football: "🏈 American Football",
  soccer: "⚽️ Soccer",
  running: "🏃‍♀️ Running",
  wheelchair_sports: "👩‍🦽 Wheelchair Sports",
  walking: "🚶‍♀️ Walking",
  bowling: "🎳 Bowling",
  darts: "🎯 Darts",
  juggling: "🤹‍♀️ Juggling",
  outdoors: "⛺️ Outdoors",
  dancing: "💃 Dancing",
  cardio: "🫁 Cardio",
  muscle: "💪 Muscle",
};

function checkUserLoggedIn() {
  $.ajax({
    url: url + "checkUserLoggedIn",
    type: "POST",
    crossDomain: true,
    success: function (response) {
      if (response.status == "failure") {
        alert("Log in first");
        window.location.href = "../index.html";
      } else {
        sessionInfo = response.data.data;
        fetchUserInfo(sessionInfo.reg_id, sessionInfo.user_id);
        $("#accessUserInfo").attr("data-userid", sessionInfo.reg_id);
      }
    },
    error: function () { },
  });
}

function fetchUserInfo(reg_id, user_id) {
  $.ajax({
    url: "../images/user_picture/" + user_id + ".jpeg",
    type: "GET",
    success: function (response) {
      $(".avatarimg").attr(
        "src",
        "../images/user_picture/" + user_id + ".jpeg"
      );
    },
    error: function () {
      $(".avatarimg").attr("src", "../images/user_picture/user.jpeg");
    },
  });

  $.ajax({
    url: url + "fetchUserInfo",
    type: "POST",
    crossDomain: true,
    data: {
      id: reg_id,
    },
    success: function (response) {
      if (response.status === "success") {
        const { name, phone, address, zip_code, birthdate, activity_type } =
          response.data[0];
        const birth = birthdate.split("T")[0];
        const age = new Date().getFullYear() - new Date(birth).getFullYear();
        let activityArr =
          activity_type.indexOf(",") > -1
            ? activity_type.split(",")
            : [activity_type];

        $("#name").text(name);
        $("#phone").val(phone);
        $("#address").val(address);
        $("#zip_code").val(zip_code);
        $("#birthdate").val(birth);
        $("#age").text(age);

        activityArr = activityArr.slice(0, 3).map((el) => {
          return `<button type="button" class="btn btn-outline-light btn-sm" data-bs-toggle="button" autocomplete="off"
            data-info="${el}">${nodes[el]}</button>`;
        });

        $("#passions").html(activityArr.join());
      } else {
        console.log("unable to fetch userinfo");
      }
    },
    error: function () { },
  });
}

checkUserLoggedIn();

$("#changePassword").on("click", function () {
  const password = $("#password").val();
  $.ajax({
    url: url + "changePassword",
    type: "POST",
    crossDomain: true,
    data: {
      password: password,
    },
    success: function (response) {
      if (response.status === "success") {
        $("#modal3").modal("hide");
      }
      alert(response.message);
    },
    error: function () {
      alert("failed");
    },
  });
});

$("#deactive").on("click", function () {
  $.ajax({
    url: url + "deactiveUser",
    type: "POST",
    crossDomain: true,
    success: function (response) {
      if (response.status === "success") {
        $("#modaldeactive").modal("hide");
      }
      alert("You will be logged out!");
      window.location.href = "../index.html";
    },
    error: function () {
      alert("failed");
    },
  });
});

$("#editProfile").on("click", function () {
  const profile = $("#profile_form")[0];
  const fd = new FormData(profile);
  $.ajax({
    url: url + "modifyUserInfo",
    type: "POST",
    crossDomain: true,
    data: fd,
    processData: false,
    contentType: false,
    success: function (response) {
      if (response.status === "success") {
        $("#modal4").modal("hide");
        alert("Profile Updated");
        window.location.reload();
      }
    },
    error: function () {
      alert("failed");
    },
  });
});

$("#delaccount").on("click", function () {
  $.ajax({
    url: url + "deleteUser",
    type: "POST",
    crossDomain: true,
    data: {
      reg_id: sessionInfo.reg_id
    },
    success: function (response) {
      if (response.status === "success") {
        $("#modaldel").modal("hide");
      }
      alert("Account deleted");
      window.location.href = "../index.html";
    },
    error: function () {
      alert("failed");
    },
  });
});

$("#modal11-button").on("click", function () {
  $.ajax({
    url: url + "getWorkoutRequest",
    type: "POST",
    crossDomain: true,
    data: {
      user_id: sessionInfo.user_id
    },
    success: function (response) {
      if (response.status === "success") {
        const list = response.data;
        workout_requests = list;
        updateWorkoutRequest();
      } else {
        alert(response.message);
      }
    },
    error: function () {
      alert("failed");
    },
  });
})

function updateWorkoutRequest() {
  const nodes = workout_requests.map((el, idx) => {
    $.ajax({
      url: "../images/user_picture/" + el.from_user_id + ".jpeg",
      type: "GET",
      success: function (response) {
        $("#workout_avatar_" + idx).attr(
          "src",
          "../images/user_picture/" + el.from_user_id + ".jpeg"
        );
      },
      error: function () {
        $("#workout_avatar_" + idx).attr("src", "../images/userImg.png");
      },
    });
    return `<div class="messages"><div class="avatar"><img id="workout_avatar_${idx}" src="../images/user_picture/${el.from_user_id}.jpeg" alt=""></div><div class="friend">
        <div class="user">${el.name}</div></div></div>`;
  });
  $("#request_body").html(nodes.join());
}

$("#request_body").on("click", ".accept_request", function (ev) {
  const target = ev.target;
  const tabid = target.getAttribute("data-tabid"), fromid = target.getAttribute("data-fromid"), toid = target.getAttribute("data-toid");
  $.ajax({
    url: url + "acceptWorkoutRequest",
    type: "POST",
    crossDomain: true,
    data: {
      to_user_id: toid,
      from_user_id: fromid,
      tabid: tabid,
      msg: 'I accepted your workout request'
    },
    success: function (response) {
      if (response.status === "success") {
        alert(response.message);
        workout_requests.splice(workout_requests.findIndex(el => el.workout_id == tabid), 1);
        updateWorkoutRequest()
      } else {
        alert("failed");
      }
    },
    error: function () {
      alert("failed");
    },
  });
})

$("#request_body").on("click", ".reject_request", function (ev) {
  const target = ev.target;
  const tabid = target.getAttribute("data-tabid"), fromid = target.getAttribute("data-fromid"), toid = target.getAttribute("data-toid");
  $.ajax({
    url: url + "rejectWorkoutRequest",
    type: "POST",
    crossDomain: true,
    data: {
      tabid: tabid,
    },
    success: function (response) {
      alert(response.message);
      if (response.status === "success") {
        workout_requests.splice(workout_requests.findIndex(el => el.workout_id == tabid), 1);
        updateWorkoutRequest()
      }
    },
    error: function () {
      alert("failed");
    },
  });
})