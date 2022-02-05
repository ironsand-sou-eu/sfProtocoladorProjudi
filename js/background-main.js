// Listener para clique na action
chrome.action.onClicked.addListener(tab => {
    const details = { tabId: tab.id }
    sendMessage(details)
})

// Listener para navegação
// chrome.webRequest.onCompleted.addListener(
//   sendMessage,
//   {urls: [
//     "*://projudi.tjba.jus.br/projudi/movimentacao/Peticionar*",
//     "*://projudi.tjba.jus.br/projudi/listagens/DadosProcesso?numeroProcesso=*",
//     "*://projudi.tjba.jus.br/projudi/movimentacao/Peticionar?numeroProcesso=*"
//   ]}
// )

function sendMessage(details) {
  console.log(details)
  chrome.tabs.sendMessage(
    details.tabId,
    {
      startInjection: true,
      fromCache: details.fromCache ?? null,
      tabId: details.tabId ?? null,
      frameId: details.frameId ?? null,
      httpStatus: details.statusCode ?? null
    }
  )
}