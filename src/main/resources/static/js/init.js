import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";
let userAvatarTemporary = "";
// let urlMessageImg = ""
// let urlAvatarFile = "";
const firebaseConfig = {
  apiKey: "AIzaSyAdHX9EhKek9C_AFjT0gSAaChjpype9Oi0",
  authDomain: "appchatzala.firebaseapp.com",
  projectId: "appchatzala",
  storageBucket: "appchatzala.appspot.com",
  messagingSenderId: "1073900432056",
  appId: "1:1073900432056:web:a42ae72d589957cce1e24d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app, "gs://appchatzala.appspot.com");
$(document).ready(function () {
  $("#inputImg").on("change", (input) => {
    const file = input.target.files[0];
    const storageRef = ref(storage, file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...

        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          sendMessage(
            myMemberInConversationSelected,
            "image",
            downloadURL,
            conversationSelected
          );
        });
      }
    );
  });
  $("#messageImg").on("change", (input) => {
    handleSelectImage(input.target.files[0]);
    userAvatarTemporary = input.target.files[0];
  });
  $("#btn_updateUser").on("click", () => {
    const storageRef = ref(storage, userAvatarTemporary.name);
    const uploadTask = uploadBytesResumable(storageRef, userAvatarTemporary);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...

        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          updateInforUser(downloadURL);
        });
      }
    );
  });
});

function handleSelectImage(file) {
  const urlRenderTemporary = URL.createObjectURL(file);

  $("#userAvatar").prop("src", urlRenderTemporary);
}

function updateInforUser(url) {
  const phoneNumber = $("#userInfo-update-about-phoneNumber").val();
  const fullName = $("#userInfo-update-about-fullName").val();
  const updateInforUser = {
    phoneNumber: phoneNumber,
    fullName: fullName,
    avatar: url,
  };
  $.ajax({
    url: `${api}/auth/update/${user.phoneNumber}`,
    type: "PUT",
    data: JSON.stringify(updateInforUser),
    async: true,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
    },
    success: function (result) {
      window.location.reload();
    },
    error: function (textStatus, errorThrown) {
      console.log("Error: " + textStatus + errorThrown);
    },
  });
}
