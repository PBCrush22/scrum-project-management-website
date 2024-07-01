// Resource: https://www.w3schools.com/w3css/tryit.asp?filename=tryw3css_sidebar_shift

function w3_open() {
  document.getElementById("main").style.marginLeft = "20%";
  document.getElementById("mySidebar").style.width = "20%";
  document.getElementById("mySidebar").style.display = "block";
  document.getElementById("openNav").style.display = "none";
}

function w3_close() {
  document.getElementById("main").style.marginLeft = "0%";
  document.getElementById("mySidebar").style.display = "none";
  document.getElementById("openNav").style.display = "inline-block";
}

// Open the sidebar by default after the page has loaded
window.addEventListener("load", w3_open);
