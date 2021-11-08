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

chrome.runtime.onMessage.addListener( async (request, sender, sendResponse) => {
  if(sender.tab.id == tabId || request.criarDataTransfer == true) {
    frameId = [sender.frameId];
    let dtReturn = await chrome.scripting.executeScript({
      target: { tabId: tabId, frameIds: frameId },
      func: createDataTransfer
    });
    console.log(dtReturn);
    sendResponse("respondi algo");
  }
  return true; //dtReturn);
});

function createDataTransfer() {
  const dtTrans = new DataTransfer();
  return dtTrans;
}