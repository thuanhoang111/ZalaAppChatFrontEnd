const api = "http://localhost:8080";
const client = "http://localhost:8000";

let user;
let listGroupChat = [];
let contacts;
let conversations;
let conversationSelected;
let myMemberInConversationSelected;
let membersInGroup = [];

//socket
let stompClient;

if (!localStorage.getItem("userId")) {
    window.location.href = `${client}/login`;
}

$(document).ready(function () {
    (async () => {
        if (localStorage.getItem("userId")) {
            await $.ajax({
                url: `${api}/users/${localStorage.getItem("userId")}`,
                type: "GET",
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                },
                success: function (result) {
                    user = result;
                    console.log(user);
                    $("#userInfo-fullName").html(() => {
                        return "";
                    });
                    $("#userInfo-about-fullName").html(() => {
                        return "";
                    });
                    $("#userInfo-about-phoneNumber").html(() => {
                        return "";
                    });
                    $("#userInfo-fullName").append(user.fullName);
                    $("#userInfo-about-fullName").append(user.fullName);
                    $("#userInfo-about-phoneNumber").append(user.phoneNumber);
                },
                error: function (textStatus, errorThrown) {
                    console.log("Error: " + textStatus + errorThrown);
                },
            });
        }

        if (localStorage.getItem("userId")) {
            await $.ajax({
                url: `${api}/contacts/user/${localStorage.getItem("userId")}`,
                type: "GET",
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                },
                success: function (result) {
                    contacts = result;
                    let htmlContacts = "";
                    let htmlContactsChat = "";
                    let htmlContactsCreateGroup = "";

                    contacts.map((contact) => {
                        htmlContacts =
                            htmlContacts +
                            `
                            <li onClick="handleSelectConversation('${contact.conversationId}')">
                                <div class="d-flex align-items-center">
                                    <div class="flex-1">
                                        <h5 class="font-size-14 m-0">${contact.nameFriend}</h5>
                                    </div>
                                    <div class="dropdown">
                                        <a href="#" class="text-muted dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <i class="ri-more-2-fill"></i>
                                            </a>
                                        <div class="dropdown-menu dropdown-menu-end">
                                            <a class="dropdown-item" href="#">Share <i class="ri-share-line float-end text-muted"></i></a>
                                            <a class="dropdown-item" href="#">Block <i class="ri-forbid-line float-end text-muted"></i></a>
                                            <a class="dropdown-item" href="#">Remove <i class="ri-delete-bin-line float-end text-muted"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </li>`;

                        htmlContactsCreateGroup =
                            htmlContactsCreateGroup +
                            `
                        <li>
                            <div class="form-check">
                                <input type="checkbox" name="contacts" value="${contact.friendId}" class="form-check-input" id="contact_${contact.friendId}">
                                <label class="form-check-label" for="memberCheck1">${contact.nameFriend}</label>
                            </div>
                        </li>
                        `;

                        // htmlContactsChat =
                        //     htmlContactsChat +
                        //     `<div class="item">
                        //     <a href="#" class="user-status-box">
                        //         <div class="avatar-xs mx-auto d-block chat-user-img online">
                        //             <img src="assets/images/users/avatar-5.jpg" alt="user-img" class="img-fluid rounded-circle">
                        //             <span class="user-status"></span>
                        //         </div>

                        //         <h5 class="font-size-13 text-truncate mt-3 mb-1">Emily</h5>
                        //     </a>
                        // </div>`;
                    });

                    $("#listContact").append(htmlContacts);
                    $("#contactsCreateGroup").append(htmlContactsCreateGroup);
                    // $("#user-status-carousel").append(htmlContactsChat);
                },
                error: function (textStatus, errorThrown) {
                    console.log("Error: " + textStatus + errorThrown);
                },
            });

            await $.ajax({
                url: `${api}/conversations/user/${localStorage.getItem(
                    "userId"
                )}`,
                type: "GET",
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                },
                success: function (result) {
                    // conversations = result;
                    // const conversationsData = result;

                    // let membersData = [];
                    // let messageData = [];

                    let html = "";

                    const conversationData = result.map((conversation) => {
                        // let constversationData = {
                        //     ...conversation,
                        // };

                        if (
                            !contacts.find(
                                (contact) =>
                                    contact.conversationId === conversation.id
                            )
                        ) {
                            listGroupChat.push(conversation);
                            const htmlListGroupChat = `
                                <li id="groupChat_${conversation.id}">
                                    <a href="#">
                                        <div class="d-flex align-items-center">
                                            <div class="chat-user-img me-3 ms-0">
                                                <div class="avatar-xs">
                                                    <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                                            G
                                                        </span>
                                                </div>
                                            </div>
                                            <div class="flex-1 overflow-hidden">
                                                <h5 class="text-truncate font-size-14 mb-0">${conversation.groupName}</h5>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                                `;
                            $("#listChatGroup").append(htmlListGroupChat);
                        }

                        connectToChat(conversation);

                        let converSationNameSolo;

                        if (conversation.groupName.includes("-")) {
                            let temp = conversation.groupName.split("-");
                            temp.forEach((name) => {
                                if (name !== user.fullName) {
                                    converSationNameSolo = name;
                                }
                            });
                        }

                        html =
                            html +
                            `
                            <li onClick="handleSelectConversation('${
                                conversation.id
                            }')">
                                <a href="#">
                                    <div id="conversationID_${
                                        conversation.id
                                    }" class="d-flex">
                                        <div class="chat-user-img align-self-center me-3 ms-0">
                                            <div class="avatar-xs">
                                                <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                                        ${"U"}
                                                    </span>
                                            </div>
                                        </div>
                                        <div id="conversation_messageNotify_${
                                            conversation.id
                                        }" class="flex-1 overflow-hidden">
                                            <h5 class="text-truncate font-size-15 mb-1">${
                                                !converSationNameSolo
                                                    ? conversation.groupName
                                                    : converSationNameSolo
                                            }</h5>
                                        </div>
                                    </div>
                                </a>
                            </li>`;

                        // html =
                        //     html +
                        //     `
                        //     <li>
                        //                 <a href="#">
                        //                     <div class="d-flex">
                        //                         <div class="chat-user-img online align-self-center me-3 ms-0">
                        //                             <img src="assets/images/users/avatar-2.jpg" class="rounded-circle avatar-xs" alt="">
                        //                             <span class="user-status"></span>
                        //                         </div>

                        //                         <div class="flex-1 overflow-hidden">
                        //                             <h5 class="text-truncate font-size-15 mb-1">Patrick Hendricks</h5>
                        //                             <p class="chat-user-message text-truncate mb-0">Hey! there I'm available</p>
                        //                         </div>
                        //                         <div class="font-size-11">05 min</div>
                        //                     </div>
                        //                 </a>
                        //             </li>`;

                        // =========================
                        $.ajax({
                            url: `${api}/conversations/chat/${conversation.id}`,
                            type: "GET",
                            async: true,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader(
                                    "Access-Control-Allow-Origin",
                                    "*"
                                );
                                xhr.setRequestHeader(
                                    "Accept",
                                    "application/json"
                                );
                                xhr.setRequestHeader(
                                    "Content-Type",
                                    "application/json"
                                );
                            },
                            success: function (result) {
                                // const messages = result;

                                const messagesHistory = result.sort(function (
                                    a,
                                    b
                                ) {
                                    return (
                                        new Date(a.createAt) -
                                        new Date(b.createAt)
                                    );
                                });
                                messageData = [...messagesHistory];

                                if (messagesHistory.length > 0) {
                                    let htmlMessageNotify = `
                                    <p id="notifyMessage_${
                                        messagesHistory[
                                            messagesHistory.length - 1
                                        ].conversationId
                                    }" class="chat-user-message mb-0">${
                                        messagesHistory[
                                            messagesHistory.length - 1
                                        ].senderName
                                    }: ${
                                        messagesHistory[
                                            messagesHistory.length - 1
                                        ].content
                                    }</p>
                                `;
                                    $(
                                        `#conversation_messageNotify_${
                                            messagesHistory[
                                                messagesHistory.length - 1
                                            ].conversationId
                                        }`
                                    ).append(htmlMessageNotify);
                                }
                            },
                            error: function (textStatus, errorThrown) {
                                console.log(
                                    "Error: " + textStatus + errorThrown
                                );
                            },
                        });

                        // console.log(membersData);

                        // conversation = {
                        //     ...conversation,
                        //     membersData: membersData,
                        //     messageData: messageData,
                        // };

                        return conversation;
                    });

                    // console.log(conversationData);
                    conversations = [...conversationData];

                    $("#listConversation").append(html);
                    handleSelectConversation(conversations[0].id);
                    $("#userChat").removeClass("user-chat-show");
                },
                error: function (textStatus, errorThrown) {
                    console.log("Error: " + textStatus + errorThrown);
                },
            });
        }
    })();
});

const handleSelectConversation = async (conversationId) => {
    $("#chatConversation").html(() => {
        return "";
    });
    $("#conversationName").html(() => {
        return "";
    });
    $("#infoGroupName").html(() => {
        return "";
    });
    $("#membersInGroup").html(() => {
        return "";
    });
    $(`#notify_${conversationId}`).remove();
    $("#userChat").addClass("user-chat-show");
    // $(`#notifyMessage_${conversationId}`).remove();

    // conversationSelected = await conversations.find(
    //     (conversation) => (conversation.id = conversationId)
    // );

    // const conversation = conversationSelected;

    // let converSationNameSolo;

    // if (conversation.groupName.includes("-")) {
    //     let temp = conversation.groupName.split("-");
    //     temp.forEach((name) => {
    //         if (name !== user.fullName) {
    //             converSationNameSolo = name;
    //         }
    //     });
    // }

    // $("#conversationName").append(
    //     !converSationNameSolo ? conversation.groupName : converSationNameSolo
    // );

    // $("#infoGroupName").append(
    //     !converSationNameSolo ? conversation.groupName : converSationNameSolo
    // );

    // //== xử lý members

    // membersInGroup = conversation.membersData;

    // console.log(conversation);

    // // console.log(Object.getOwnPropertyNames(conversationSelected));
    // console.log(conversationSelected.memberInGroup);

    // myMemberInConversationSelected = membersInGroup.find(
    //     (member) => member.userId === user.id
    // );

    // let htmlMembersInGroup = "";

    // membersInGroup.map((member) => {
    //     htmlMembersInGroup =
    //         htmlMembersInGroup +
    //         `
    //                         <div>
    //                             <p class="text-muted mb-1"></p>
    //                             <h5 class="font-size-14">${member.nameUser}</h5>
    //                         </div>
    //                     `;
    // });

    // //xử lý mess

    // const messages = conversation.membersData;
    // let htmlMessageInGroup = "";

    // const messagesHistory = messages.sort(function (a, b) {
    //     return new Date(a.createAt) - new Date(b.createAt);
    // });

    // messagesHistory.map((message) => {
    //     if (message.sender === myMemberInConversationSelected.id) {
    //         htmlMessageInGroup =
    //             htmlMessageInGroup +
    //             `
    //                                     <div class="message me mb-4 flex text-right">
    //                                         <div class="flex-1 px-2">
    //                                             <div class="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
    //                                                 <span>${
    //                                                     message.content
    //                                                 }</span>
    //                                             </div>
    //                                             <div class="pr-4"><small class="text-gray-500">${formatDate(
    //                                                 message.createAt
    //                                             )}</small></div>
    //                                         </div>
    //                                     </div>
    //                                 `;
    //     } else {
    //         htmlMessageInGroup =
    //             htmlMessageInGroup +
    //             `
    //                                     <div class="message mb-4 flex">
    //                                         <div class="flex-2">
    //                                             <div class="w-12 h-12 relative">
    //                                                 <img class="w-12 h-12 rounded-full mx-auto" src="assets/images/users/avatar-4.jpg" alt="chat-user" />
    //                                                 <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
    //                                             </div>
    //                                         </div>
    //                                         <div class="flex-1 px-2">
    //                                             <div>
    //                                                 <p>${message.senderName}</p>
    //                                             </div>
    //                                             <div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
    //                                                 <span>${
    //                                                     message.content
    //                                                 }</span>
    //                                             </div>
    //                                             <div class="pl-4"><small class="text-gray-500">${formatDate(
    //                                                 message.createAt
    //                                             )}</small></div>
    //                                         </div>
    //                                     </div>
    //                                 `;
    //     }
    // });

    // $("#chatConversation").append(htmlMessageInGroup);
    // scrollToBottomMessages();

    //==================================

    await $.ajax({
        url: `${api}/conversations/${conversationId}`,
        type: "GET",
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
            conversationSelected = result;
            const conversation = result;

            let converSationNameSolo;

            if (conversation.groupName.includes("-")) {
                let temp = conversation.groupName.split("-");
                temp.forEach((name) => {
                    if (name !== user.fullName) {
                        converSationNameSolo = name;
                    }
                });
            }

            $("#conversationName").append(
                !converSationNameSolo
                    ? conversation.groupName
                    : converSationNameSolo
            );

            $("#infoGroupName").append(
                !converSationNameSolo
                    ? conversation.groupName
                    : converSationNameSolo
            );

            //get members in group chat
            $.ajax({
                url: `${api}/conversations/members/${conversationId}`,
                type: "GET",
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                },
                success: function (result) {
                    membersInGroup = result;

                    myMemberInConversationSelected = membersInGroup.find(
                        (member) => member.userId === user.id
                    );

                    let htmlMembersInGroup = "";

                    membersInGroup.map((member) => {
                        htmlMembersInGroup =
                            htmlMembersInGroup +
                            `
                            <div>
                                <p class="text-muted mb-1"></p>
                                <h5 class="font-size-14">${member.nameUser}</h5>
                            </div>
                        `;
                    });

                    $("#membersInGroup").append(htmlMembersInGroup);

                    // console.log(myMemberInConversationSelected);

                    //render chat
                    $.ajax({
                        url: `${api}/conversations/chat/${conversationId}`,
                        type: "GET",
                        async: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader(
                                "Access-Control-Allow-Origin",
                                "*"
                            );
                            xhr.setRequestHeader("Accept", "application/json");
                            xhr.setRequestHeader(
                                "Content-Type",
                                "application/json"
                            );
                        },
                        success: function (result) {
                            const messages = result;
                            let html = "";

                            const messagesHistory = messages.sort(function (
                                a,
                                b
                            ) {
                                return (
                                    new Date(a.createAt) - new Date(b.createAt)
                                );
                            });

                            messagesHistory.map((message) => {
                                if (
                                    message.sender ===
                                    myMemberInConversationSelected.id
                                ) {
                                    html =
                                        html +
                                        `
                                        <div class="message me mb-4 flex text-right">
                                            <div class="flex-1 px-2">
                                                <div class="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
                                                    <span>${
                                                        message.content
                                                    }</span>
                                                </div>
                                                <div class="pr-4"><small class="text-gray-500">${formatDate(
                                                    message.createAt
                                                )}</small></div>
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    html =
                                        html +
                                        `
                                        <div class="message mb-4 flex">
                                            <div class="flex-2">
                                                <div class="w-12 h-12 relative">
                                                    <img class="w-12 h-12 rounded-full mx-auto" src="assets/images/users/avatar-4.jpg" alt="chat-user" />
                                                    <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
                                                </div>
                                            </div>
                                            <div class="flex-1 px-2">
                                                <div>
                                                    <p>${message.senderName}</p>
                                                </div>
                                                <div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
                                                    <span>${
                                                        message.content
                                                    }</span>
                                                </div>
                                                <div class="pl-4"><small class="text-gray-500">${formatDate(
                                                    message.createAt
                                                )}</small></div>
                                            </div>
                                        </div>
                                    `;
                                }
                            });

                            $("#chatConversation").append(html);
                            scrollToBottomMessages();
                        },
                        error: function (textStatus, errorThrown) {
                            console.log("Error: " + textStatus + errorThrown);
                        },
                    });
                },
                error: function (textStatus, errorThrown) {
                    console.log("Error: " + textStatus + errorThrown);
                },
            });
        },
        error: function (textStatus, errorThrown) {
            console.log("Error: " + textStatus + errorThrown);
        },
    });

    // $.ajax({
    //     url: `${api}/conversations/chat/${conversationId}`,
    //     type: "GET",
    //     async: true,
    //     beforeSend: function (xhr) {
    //         xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    //         xhr.setRequestHeader("Accept", "application/json");
    //         xhr.setRequestHeader("Content-Type", "application/json");
    //     },
    //     success: function (result) {
    //         const messages = result;
    //         let html = "";

    //         console.log(messages);

    //         messages.map((message) => {
    //             if (message.sender === myMemberInConversationSelected.id) {
    //                 html =
    //                     html +
    //                     `
    //                     <div class="message me mb-4 flex text-right">
    //                         <div class="flex-1 px-2">
    //                             <div class="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
    //                                 <span>${message.content}</span>
    //                             </div>
    //                             <div class="pr-4"><small class="text-gray-500">${message.createAt}</small></div>
    //                         </div>
    //                     </div>
    //                 `;
    //             } else {
    //                 html =
    //                     html +
    //                     `
    //                     <div class="message mb-4 flex">
    //                         <div class="flex-2">
    //                             <div class="w-12 h-12 relative">
    //                                 <img class="w-12 h-12 rounded-full mx-auto" src="assets/images/users/avatar-4.jpg" alt="chat-user" />
    //                                 <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
    //                             </div>
    //                         </div>
    //                         <div class="flex-1 px-2">
    //                             <div>
    //                                 <p>${message.senderName}</p>
    //                             </div>
    //                             <div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
    //                                 <span>${message.content}</span>
    //                             </div>
    //                             <div class="pl-4"><small class="text-gray-500">${message.createAt}</small></div>
    //                         </div>
    //                     </div>
    //                 `;
    //             }
    //         });

    //         $("#chatConversation").append(html);
    //     },
    //     error: function (textStatus, errorThrown) {
    //         console.log("Error: " + textStatus + errorThrown);
    //     },
    // });
};

const formatDate = (date) => {
    const d = new Date(date);

    const dformat =
        [d.getHours(), d.getMinutes()].join(":") +
        " " +
        [d.getDate(), d.getMonth() + 1, d.getFullYear()].join("/");
    return dformat;
};

const connectToChat = async (conversation) => {
    console.log("connecting to chat...");
    let socket = new SockJS(api + "/chat");
    stompClient = Stomp.over(socket);
    await stompClient.connect({}, function (frame) {
        console.log("connected to: " + frame);
        setTimeout(() => {
            stompClient.subscribe(
                "/topic/messages/" + conversation.id,
                function (response) {
                    let message = JSON.parse(response.body);

                    console.log(message);

                    if (
                        message.conversationId === conversationSelected.id &&
                        message.sender !== myMemberInConversationSelected.id
                    ) {
                        let html = `
                            <div class="message mb-4 flex">
                                <div class="flex-2">
                                    <div class="w-12 h-12 relative">
                                        <img class="w-12 h-12 rounded-full mx-auto" src="assets/images/users/avatar-4.jpg" alt="chat-user" />
                                        <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
                                    </div>
                                </div>
                                <div class="flex-1 px-2">
                                    <div>
                                        <p>${message.senderName}</p>
                                    </div>
                                    <div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
                                        <span>${message.content}</span>
                                    </div>
                                    <div class="pl-4"><small class="text-gray-500">${formatDate(
                                        message.createAt
                                    )}</small></div>
                                </div>
                            </div>
                        `;
                        $("#chatConversation").append(html);
                        scrollToBottomMessages();
                    } else {
                        if (
                            message.sender !== myMemberInConversationSelected.id
                        ) {
                            $(`#notify_${message.conversationId}`).remove();
                            let htmlNotify = `
                            <div id="notify_${message.conversationId}" class="unread-message">
                                    <span class="badge badge-soft-danger rounded-pill">new</span>
                                </div>`;

                            $(
                                `#conversationID_${message.conversationId}`
                            ).append(htmlNotify);
                        }
                    }

                    $(`#notifyMessage_${message.conversationId}`).remove();
                    let htmlMessageNotify = `
                        <p id="notifyMessage_${message.conversationId}" class="chat-user-message mb-0">${message.senderName}: ${message.content}</p>
                    `;
                    $(
                        `#conversation_messageNotify_${message.conversationId}`
                    ).append(htmlMessageNotify);
                }
            );
        }, 200);
    });
};

// send Messaage

function sendMessage(member, content, conversation) {
    const body = {
        sender: member.id,
        content: content,
        conversationId: conversation.id,
        senderName: member.nameUser,
    };

    stompClient.send("/app/chat/" + conversation.id, {}, JSON.stringify(body));

    const html = `
        <div class="message me mb-4 flex text-right">
            <div class="flex-1 px-2">
                <div class="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
                    <span>${content}</span>
                </div>
                <div class="pr-4"><small class="text-gray-500">${formatDate(
                    new Date().toString()
                )}</small></div>
            </div>
        </div>
    `;

    let htmlMessageNotify = `
        <p id="notifyMessage_${conversation.id}" class="chat-user-message mb-0">${member.nameUser}: ${content}</p>
    `;

    $(`#notifyMessage_${conversation.id}`).remove();
    $(`#conversation_messageNotify_${conversation.id}`).append(
        htmlMessageNotify
    );

    $("#chatConversation").append(html);
    scrollToBottomMessages();
    $("#message-to-send").val("");
}

//gửi tin nhắn

const handleSendMessage = () => {
    const content = $("#message-to-send").val();
    sendMessage(myMemberInConversationSelected, content, conversationSelected);
};

$("#sendBtn").click(() => {
    handleSendMessage();
});

(() => {
    $("#message-to-send").on("keyup", addMessageEnter.bind(this));
})();

function addMessageEnter(event) {
    if (event.keyCode === 13) {
        handleSendMessage();
    }
}

function scrollToBottomMessages() {
    var container = document.querySelector(
        "#divConversation .simplebar-content-wrapper"
    );
    container.scrollTo({ top: 10000, behavior: "smooth" });
}
