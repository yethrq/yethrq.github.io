function validateLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "" || password === "") {
    alert("goblok masukin pw dan username dolo tolol!");
    return false;
  }

  if (username === "Beta ye" && password === "seng ada") {
    return true;
  }

  alert("goblok salah woy!");
  return false;
}
