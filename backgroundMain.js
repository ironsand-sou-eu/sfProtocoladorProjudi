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

// Listener para clique na action
chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const details = { tabId: tabs[0].id };
    sendMessage(details);
  });
});

// Listener para navegação
chrome.webRequest.onCompleted.addListener(
  sendMessage,
  {urls: ["*://projudi.tjba.jus.br/projudi/movimentacao/Peticionar*"]}
);

function sendMessage(details) {
  chrome.tabs.sendMessage(
    details.tabId,
    {
      startInjection: true,
      fromCache: details.fromCache ?? null,
      tabId: details.tabId ?? null,
      frameId: details.frameId ?? null,
      httpStatus: details.statusCode ?? null
    }
  );
};