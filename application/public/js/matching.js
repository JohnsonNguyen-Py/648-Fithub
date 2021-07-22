function openTab(evt, tabName) {
    let i, tabContent, tabButtons;

    tabContent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }

    // divContent = document.getElementsByClassName("content");
    // for (i = 0; i < divContent.length; i++) {
    //     divContent[i].style.display = "none";
    // }

    tabButtons = document.getElementsByClassName("tabButtons");
    for (i = 0; i < tabButtons.length; i++) {
      tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // document.getElementById("div_" + tabName).style.display = "block";
  }