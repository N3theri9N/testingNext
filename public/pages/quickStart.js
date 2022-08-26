const AILivePlayer = document.getElementById("AILivePlayer");
const AI_LIVE = new AIPlayer(AILivePlayer);

const DATA = {};

initSample();

async function initSample() {
  initAIPlayerEvent();

  // 테스트할때 쓰는 것이므로 메뉴얼에 추가하면 X
  AI_LIVE.setConfig({ midServer: "https://devmid.deepbrainai.io", authServer: "https://devaihuman.deepbrainai.io" });

  await generateClientToken();
  await generateVerifiedToken();


  await AI_LIVE.init({
    AIModelInfo: { ai_name: DATA.defaultAI.ai_name, zIndex: 0, size: 1.0, left: 0, top: 0, speed: 1.0 },
    AppInfo: { appId: DATA.appId, token: DATA.verifiedToken },
  });


}

// =========================== AIPlayer Setup ================================ //

async function generateClientToken() {
//  const result = await makeRequest("GET", "https://v75kuduosg.execute-api.ap-northeast-2.amazonaws.com/test/"); // TODO: Server generateJWT request address input
  const result = await makeRequest("GET", "/api/generateJWT"); // TODO: Server generateJWT request address input
  // TODO: response handling
  // Success
  DATA.appId = result.appId;
  DATA.clientToken = result.token;

  console.log(DATA);
  // ...
}

async function generateVerifiedToken() {
  console.log("test Data", DATA);
  const result = await AI_LIVE.generateToken({ appId: DATA.appId, token: DATA.clientToken }); // 
  if (result?.succeed) {
    // TODO: response data handling
    DATA.verifiedToken = result.token;
    DATA.tokenExpire = result.tokenExpire;
    DATA.defaultAI = result.defaultAI;
  }
  else { console.log(result) } // TODO: error handling
}

// =========================== AIPlayer Callback ================================ //

function initAIPlayerEvent() {
  // TODO: AIPlayer error handling
  AI_LIVE.onAIPlayerError = function (err) {
    // err => string || { succeed: false, errorCode: 1400, error: "...", description: "...", detail: "..." }
    console.log("on AIPlayer Error: ", err);
  };

  // TODO: AIPlayer Loading State Change Handling
  AI_LIVE.onAIPlayerStateChanged = function (state) {
    if (state === "playerLoadComplete") document.getElementById("AIPlayerTexts").style.display = "grid";
  };
}

// =========================== AIPlayer Function ================================ //

function speak(text) {
  AI_LIVE.send(text);
}

// =========================== ETC ================================ //

// sample Server request function
async function makeRequest(method, url, params) {
  const options = { method, headers: { "Content-Type": "application/json; charSet=utf-8" } };

  if (method === "POST") options.body = JSON.stringify(params || {});

  return await fetch(url, options)
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => {
      console.error("** An error occurred during the fetch", error);
      showPop("Generate Client Token Error", `no client token can be generated.`);
      return undefined;
    });
}