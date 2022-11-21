import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";
let userAvatarTemporary = "";

const firebaseConfig = {
  apiKey: "AIzaSyCtvKlXSWkHh5CN3ST4DxiLu6rxVGZDiJ4",
  authDomain: "zala-chatapp.firebaseapp.com",
  projectId: "zala-chatapp",
  storageBucket: "zala-chatapp.appspot.com",
  messagingSenderId: "721545788182",
  appId: "1:721545788182:web:70a313a4c5934f164f2e37"
};
import emoji from "../assets/images/emoji2.json" assert { type: "json" };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app, "gs://zala-chatapp.appspot.com");
$(document).ready(function () {
  renderListEmoji(emoji);
  $("#sendBtn").on("click", (input) => {
    switch (filesArr.length) {
      case 0:
        handleSendMessage();
        break;
      case 1:
        handleSendMessageImage(filesArr);
        filesArr = [];
        console.log(filesArr);
        ClearElementChild("listImageSelectTemporary");
        break;

      default:
        handleSendMessageListImage(filesArr);
        const timeSendMessage = filesArr.length * 2000;
        filesArr = [];
        ClearElementChild("listImageSelectTemporary");
        console.log(urlListImage);
        setTimeout(() => {
          sendMessage(
            myMemberInConversationSelected,
            "listImage",
            urlListImage,
            conversationSelected
          );
        }, timeSendMessage);

        urlListImage = "";

        break;
    }
  });

  $("#messageImg").on("change", (input) => {
    const ImgTemporary = handleSelectImage(input.target.files[0]);
    $("#userAvatar").prop("src", ImgTemporary);
    userAvatarTemporary = input.target.files[0];
  });
  $("#btn_updateUser").on("click", () => {
    const storageRef = ref(storage, userAvatarTemporary.name);
    const uploadTask = uploadBytesResumable(storageRef, userAvatarTemporary);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
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
      (error) => {},
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          updateInforUser(downloadURL);
        });
      }
    );
  });
});

// lấy file hình ảnh đã chọn và render tạm thời lên giao diện
function handleSelectImage(file) {
  const urlRenderTemporary = URL.createObjectURL(file);
  return urlRenderTemporary;
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
function handleSendMessageImage(filesArr) {
  const file = filesArr[0];
  const storageRef = ref(storage, file.name);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
}
function handleSendMessageListImage(listImage) {
  (async () => {
    for (let index = 0; index < listImage.length; index++) {
      const storageRef = ref(storage, listImage[index].name);
      const uploadTask = uploadBytesResumable(storageRef, listImage[index]);
      await uploadTask.on(
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
        }

        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      );
      await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        urlListImage += downloadURL;
        if (index < listImage.length - 1) {
          urlListImage += "+";
        } else {
          urlListImage += "";
        }

        console.log(urlListImage);
      });
      // getDownloadURL(storageRef).then((downloadURL) => {
      //   urlListImage += downloadURL;
      //   console.log(urlListImage);
      // });
    }
  })();
}
function renderListEmoji(listEmoji) {
  let emojiRender = "";
  listEmoji.map((emoji) => {
    emojiRender += `
      <a class="dropdown-item"  style="cursor:pointer; padding:5px !important ; height:max-content; width:max-content;" onClick="appendEmoji('${emoji}')">
        <span>${emoji}</span>  
      </a>
    `;
  });
  $("#emoji-list").append(emojiRender);
}
