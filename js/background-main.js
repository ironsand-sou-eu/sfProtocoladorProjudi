// // Listener para clique na action
// chrome.action.onClicked.addListener(tab => {
//     const details = { tabId: tab.id }
//     sendMessage(details)
// })

// function sendMessage(details) {
//   chrome.tabs.sendMessage(
//     details.tabId,
//     {
//       startInjection: true,
//       fromCache: details.fromCache ?? null,
//       tabId: details.tabId ?? null,
//       frameId: details.frameId ?? null,
//       httpStatus: details.statusCode ?? null
//     }
//   )
// }