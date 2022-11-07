// const api = "http://localhost:8080";
// const client = "http://localhost:8000";
let filesArr = new Array();
$(document).ready(function () {
  $("#inputImg").on("change", (input) => {
    ClearElementChild("listImageSelectTemporary");

    const files = input.target.files;
    for (var i = 0, l = files.length; i < l; i++) {
      filesArr.push(files[i]);
    }
    renderListImageTemporaryInScreen(filesArr);
  });
});
function handleRemoveFileInFileListTemporary(index) {
  filesArr.splice(index, 1);
  ClearElementChild("listImageSelectTemporary");

  renderListImageTemporaryInScreen(filesArr);
}
function ClearElementChild(id) {
  const elementListImgTemporary = document.getElementById(id);
  while (elementListImgTemporary.hasChildNodes()) {
    elementListImgTemporary.removeChild(elementListImgTemporary.firstChild);
  }
}

function renderListImageTemporaryInScreen(arrayList) {
  let viewImgTemporary = "";
  for (let index = 0; index < arrayList.length; index++) {
    viewImgTemporary += `
            <div class="position-relative">
                <img class=" avatar-lg img-thumbnail"
                style="border-radius: 30px;"
                    src="${handleSelectImage(arrayList[index])}"
                    alt="" srcset=""/>

                <i class="fas fa-times-circle img-thumbnail position-absolute" id="btn-delete-imgTemporaryItem" width="20px"
                    height="20px" style=" top:0px ; right: 0px; cursor: pointer; " onClick="handleRemoveFileInFileListTemporary(${index})"></i>
            </div>
    `;
  }
  $("#listImageSelectTemporary").append(viewImgTemporary);
}
// lấy file hình ảnh đã chọn và render tạm thời lên giao diện
function handleSelectImage(file) {
  const urlRenderTemporary = URL.createObjectURL(file);
  return urlRenderTemporary;
}

function appendEmoji(emoji) {
  $("#message-to-send").val($("#message-to-send").val() + `${emoji}`);
}
