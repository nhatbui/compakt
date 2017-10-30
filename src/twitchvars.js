// These are variables for Twitch elements related to chat.
// We expose them here so changes can be easily made if Twitch changes them.
twitchChatUlClass = ".chat-list__lines .simplebar-scroll-content .simplebar-content .full-height";
twitchChatMessageClass1 = ".chat-line__message";
twitchChatMessageContent = "span:nth-child(4)";

module.exports.chatULClassName = twitchChatUlClassName;
module.exports.chatULSelector = twitchChatUlSelector;
module.exports.chatMsg1Selector = twitchChatMessage1Selector;
module.exports.chatMsg2Selector = twitchChatMessage2Selector;
module.exports.chatMsgContent = twitchChatMessageContent;
