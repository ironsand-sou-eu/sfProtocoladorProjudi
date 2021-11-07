var tabId = "";
var frameId = "";

// Regra para exibir botão
var regra1 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'projudi.tjba.jus.br' },
    })
  ],
  actions: [ new chrome.declarativeContent.ShowPageAction() ]
};

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([regra1]);
  });
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, {clicou: true, tabId: tabId}, () => {});
  });
});

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
  if(sender.tab.id == tabId || request.criarDataTransfer == true) {
    frameId = [sender.frameId];
    let dtReturn = "";
    chrome.scripting.executeScript({
      target: { tabId: tabId, frameIds: frameId },
      func: createDataTransfer
    }, function(injResults) {
      dtReturn = injResults[0].result;
      console.log(dtReturn);
    });
    do {
      let i;
      const waitReturn = setInterval (() => {
        i++
        console.log(i);
        console.log(dtReturn);
        if(dtReturn) {
          clearInterval(waitReturn);
        }
      }, 300);
    } while (!dtReturn);
    console.log("oi, cheguei aqui");
    console.log(dtReturn);
    sendResponse("respondi algo") //dtReturn);
  }
});

function createDataTransfer() {
  const dtTrans = new DataTransfer();
  return dtTrans;
}