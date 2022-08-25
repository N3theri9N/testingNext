const AIPlayer = function (wrapper, options = {}) {
  const region = "world"; // cn: 중국, world: other
  const platform = "web"; // SDK platform
  const sdk_v = 1302; // sdk version
  const uuid = getUUID();
  let serverUrl = "";
  let socketUrl = "";
  let baseUrl = "";
  
  if (region === "world") {
    serverUrl = "https://aihuman.deepbrainai.io";
    socketUrl = "https://aimid.deepbrainai.io";
    baseUrl = "https://d2s5oxcf7msaxg.cloudfront.net";
  } else { // region: "cn"
    serverUrl = "https://aihuman.deepbrainai.io";
    socketUrl = "https://aimid.aistudios.cn";
    baseUrl = "https://aihumanres.aistudios.cn/aihuman";
  }
  const buildUrl = options.buildUrl || "Build"; // 3D: build folder url
  let settings = { zIndex: -1, size: 1, top: 0, left: 0, speed: 1 };
  let mReq = {};

  let currentAI; // 3D: default voice AI model
  let currentUnityAI; // 3D: AI model
  let currentAIType; // 3D: getAIList에서 값 가져옴.
  let cache_db;
  let AI_DB;
  let that = this;
  let isLoadUnityScript = false;
  let unityCanvas; // 3D: WebGL Build randering canvas
  let unityInstance; // 3D: WebGL Build instance

  let clip_box = {
    idle: {},
    gst: {},
    back: {},
  };
  let AIs = {};

  // 3D: webGL 포함하기 위한 config 설정부분
  const loaderUrl = buildUrl + "/aihuman.loader.js";
  let unityConfig = {
    dataUrl: buildUrl + "/aihuman.data",
    frameworkUrl: buildUrl + "/aihuman.framework.js",
    codeUrl: buildUrl + "/aihuman.wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "DeepbrainAI",
    productName: "ExportNative",
    productVersion: "1.0"
  };

  let canvas_wrapper;
  let canvas;
  let canvas2;
  let canvasCTX;
  let ctx;
  let canvas_size_x, canvas_size_y;
  let canvas2_size_x, canvas2_size_y;
  let faceX, faceY;
  let ai_model_scale = 1;
  let loaded_images_count;
  let all_images_count;
  let tempImages = {};
  let service = "native";
  let newServerDiv = false;
  let serverEmitType = "msg";
  let projectInfoLanguage = "";

  // MOV Versin 관련 수정.
  let ai_mov_live;

  class ConditionVariable {
    constructor() {
      this.lock = false;
    }
    update(curAIName) {
      this.lock = true;
      this.curAIName = curAIName;
    }
    isLocked(cond) {
      if (cond.ai_name == this.curAIName) {
        return false;
      } else {
        return true;
    }
    }
    release() {
      this.lock = false;
      this.curAIName = "";
    }
  }
  let condition = new ConditionVariable();
  //Animation
  let animationId;
  let ai_socket;
  let ai_socket_connect = false;
  let isPausing = false;
  let isPlaying = false;
  let pauseTime;
  let adjustTime;
  let socket_audio;
  let audio_volume = 100;
  let fpsInterval = 1000 / 30;
  let audioPlaybackRate = 1;
  let now, then, elapsed;
  let isInitComplete = false;
  let isReleased = false;
  let needChroma = false;

  //Callbacks
  let AISpeakStart; //start callback
  let AISpeakEnd; //end callback

  //images load
  let idleStartIndex;
  let idleEndIndex;
  let idleBackMapFrames;
  let idleDownloadPath;
  let threshold = 16;
  //speak order
  let speak_box_order = [];
  let speak_box_by_msg = {};

  // MOV관련 임시 추가.
  let sequence_box_by_msg = {};

  function AnimateNow(timestamp) {
    if (!currentAI || !animationId) return;
    //--- fps limit
    now = Date.now();
    elapsed = now - then;
    if (elapsed < fpsInterval) {
      animationId = requestAnimationFrame(AnimateNow);
      return;
    }
    then = now - (elapsed % fpsInterval);
    //--- canvas init
    canvasCTX.clearRect(0, 0, canvas_size_x, canvas_size_y);
    ctx.clearRect(0, 0, canvas2_size_x, canvas2_size_y);

    let current_frame = AnimateNow.sequence.getNextFrame();

    if (!current_frame) {
      const next_key = AnimateNow.sequence.current_clip.next_key;

      AnimateNow.sequence = new Sequence();
      //case1. When there is Speak clip to speak
      if (AnimateNow.current_speak && AnimateNow.current_speak?.isReady) {
        AnimateNow.current_speak.isReady = false;
        if (AnimateNow.current_speak.clipType !== "CLIP_GESTURE") AnimateNow.current_speak.setAudio();
        const { gst } = AnimateNow.current_speak;
        let speak_clip = { ...clip_box.idle[idleStartIndex] };
        if (gst !== "backend") {
          speak_clip = { ...clip_box.gst[gst] };
          speak_clip.min_next_key = speak_clip.next_key;
        }

        switch (AnimateNow.current_speak.clipType) {
          case "CLIP_SPEECH":
          case "CLIP_SPEECH_GESTURE":
            speak_clip.body_frames = [...speak_clip.body_frames];
            speak_clip.face_frames = AnimateNow.current_speak.images;
            speak_clip.play_duration = AnimateNow.current_speak.duration;
            speak_clip.subtitle = AnimateNow.current_speak.subtitle;

            if (speak_clip.gst_duration && speak_clip.gst_duration > speak_clip.play_duration) speak_clip.play_duration = speak_clip.gst_duration;

            /**
             * Idle Looping
             * 트리거: currentAI.long_speech: 120 초과시 idle looping 적용 (웹 미사용)
             * 공식: ((i - idleStartIndex) % ((idleEndIndex - idleStartIndex) + 1)) + idleStartIndex;
             * 이 있으나 웹은 백모션이 있는 key(index)값에 idle, backmotion 이미지들을 가지고 있어서 공식을 응용한 for문 중첩사용
             */
            const idleFrameCount = (idleEndIndex - idleStartIndex) + 1;
            const loopingCount = Math.ceil(AnimateNow.current_speak.duration / idleFrameCount);

            for (let i = 0; i < loopingCount; i++) {
              const idleIdxWeight = idleFrameCount * i;
              for (let idleKey in clip_box.idle) {
                idleKey = parseInt(idleKey);

                if (idleKey === speak_clip.next_key && (idleKey + idleIdxWeight) < AnimateNow.current_speak.duration + idleStartIndex) {
                  speak_clip.body_frames = [...speak_clip.body_frames, ...clip_box.idle[idleKey].body_frames];

                  speak_clip.next_key = clip_box.idle[idleKey].next_key;
                  // looping point
                  if (loopingCount > 0 && idleKey === idleEndIndex) {
                    speak_clip.next_key = idleStartIndex;
                  }
                }
              }
            }
            speak_clip.speak = AnimateNow.current_speak;
            break;
          case "CLIP_GESTURE": speak_clip.play_duration = speak_clip.gst_duration; break;
        }

        AnimateNow.sequence.setClip([clip_box.back[next_key], speak_clip]);
        delete AnimateNow.current_speak;

        speakNext();
      }
      // case2. when reach to the end frame
      else if (next_key === idleEndIndex) {
        AnimateNow.sequence.setClip([clip_box.back[next_key], clip_box.idle[idleStartIndex]]);
      }
      // case3. when there is nothing to play
      else {
        if (next_key) AnimateNow.sequence.setClip([clip_box.idle[next_key]]);
        else {
          AnimateNow.sequence.setClip([clip_box.back[idleEndIndex], clip_box.idle[idleStartIndex]]);
        }
      }
      current_frame = AnimateNow.sequence.getNextFrame();
    }

    canvasCTX.drawImage(current_frame.body, 0, 0, canvas_size_x, canvas_size_y);
    if (current_frame.face) {
      needChroma ? bitmap_Alpha(current_frame.face) : ctx.drawImage(current_frame.face, 0, 0, canvas2_size_x, canvas2_size_y);
    }
    animationId = requestAnimationFrame(AnimateNow);
    return;
  }

  class Sequence {
    constructor() { }
    setClip(clips) {
      this.clip_idx = 0;
      this.frame_idx = 0;
      this.clips = clips;
      this.current_clip = this.clips[this.clip_idx];
      this.clip_idx++;
    }
    getNextFrame() {
      if (!this.clip_start_time) {
        this.clip_start_time = new Date();
      } else {
        let time_gap = adjustTime ? new Date() - adjustTime - this.clip_start_time : new Date() - this.clip_start_time;

        this.frame_idx = Math.round(time_gap / fpsInterval);
      }

      if (!this.current_clip || !this.current_clip?.body_frames[this.frame_idx]) {
        if (adjustTime) adjustTime = null;

        if (!this.clips[this.clip_idx]) {
          return false;
        }

        this.current_clip = this.clips[this.clip_idx];

        if (this.current_clip.play_duration) {
          if (this.current_clip.speak) {
            this.current_clip.speak.audio.volume = audio_volume / 100;

            this.current_clip.speak.audio.play();
            this.current_clip.speak.audio.playbackRate = audioPlaybackRate;
          }

          isPlaying = true;
          that.onAIPlayerStateChanged("speakingStarted");

          if (AISpeakStart) {
            AISpeakStart({
              subtitle: this.current_clip.subtitle,
              duration: this.current_clip.play_duration / fpsInterval,
            });
          }
        }

        this.frame_idx = 0;
        delete this.clip_start_time;
        this.clip_idx++;
      }
      const output = { body: this.current_clip.body_frames[this.frame_idx] };

      if (this.current_clip.play_duration) {
        if (this.current_clip.face_frames) {
          if (this.current_clip.face_frames[[this.frame_idx]]) output.face = this.current_clip.face_frames[[this.frame_idx]];
        }

        if (isPlaying && this.frame_idx === this.current_clip.play_duration - 1) {
          isPlaying = false;
          that.onAIPlayerStateChanged("speakingAllComplete");
          if (AISpeakEnd) AISpeakEnd(AnimateNow.current_speak ? true : false);
        }
      }

      return output;
    }

    isSpeaking() {
      if (this.current_clip.face_frames) return true;
      else return false;
    }

    resumeSpeaking() {
      this.current_clip.speak.audio.play().then();
      adjustTime = new Date() - pauseTime;
      animationId = requestAnimationFrame(AnimateNow);
    }

    pauseSpeaking() {
      this.current_clip.speak.audio.pause();
      pauseTime = new Date();
    }

    stopSpeaking() {
      delete this.current_clip.face_frames;
      delete AnimateNow.current_speak;
      const { min_next_key } = this.current_clip;
      let find_idx;
      if (min_next_key && this.frame_idx < min_next_key) {
        find_idx = min_next_key;
      } else {
        find_idx = this.current_clip.next_key - this.current_clip.body_frames.length + this.frame_idx;
        for (let i = find_idx; i < idleEndIndex + 1; i++) {
          if (clip_box.idle[i]) {
            find_idx = i;
            break;
          }
        }
      }
      this.current_clip.body_frames = this.current_clip.body_frames.slice(0, find_idx - idleStartIndex);
      this.current_clip.next_key = find_idx;
      if (this.current_clip.speak && this.current_clip.speak.audio) {
        this.current_clip.speak.audio.pause();
      }
    }
  }

  function img_loading(callback, finish) {
    if (condition.isLocked(currentAI)) {
      return false;
    }
    ++loaded_images_count;
    if (!isInitComplete) {
      if (loaded_images_count === idleEndIndex - idleStartIndex - 10) {
        load_backmotion(currentAI.ai_name);
      }

      if (loaded_images_count === all_images_count) {
        condition.release();
        isInitComplete = true;
        AnimateNow.sequence = new Sequence();
        AnimateNow.sequence.setClip([clip_box.idle[idleStartIndex]]);
        that.onAIPlayerStateChanged("playerLoadComplete");
        that.startAnimation();
        if (finish) finish(); // init callback
      }
    }
    that.onAIPlayerLoadingProgressed({
      loading: Math.floor(((loaded_images_count || 0) / (all_images_count || 1)) * 100),
    });
  }
  this.onAIPlayerLoadingProgressed = (json) => { };
  async function load_backmotion() {
    for (let i in idleBackMapFrames) {
      clip_box.back[i] = {
        body_frames: [],
      };

      for (let i2 = 0; i2 < idleBackMapFrames[i]; i2++) {
        let url = idleDownloadPath + i + "_" + (i2 + 1) + ".png";
        const img = new Image();
        loadImage(url, img)
          .then((img) => {
            img_loading(mReq.callback, mReq.finish);
          })
          .catch((err) => console.error(err));
        clip_box.back[i].body_frames.push(img);
      }
    }
  }
  async function load_idle() {
    let current_idle_key;

    for (let i = idleStartIndex; i < idleEndIndex + 1; i++) {
      if (idleBackMapFrames[i] || i === idleStartIndex) {
        if (current_idle_key) clip_box.idle[current_idle_key].next_key = i;

        current_idle_key = i;
        clip_box.idle[current_idle_key] = {
          src: [],
        };
      }
      clip_box.idle[current_idle_key].src.push(idleDownloadPath + i + ".png");
    }
    for (let key in clip_box.idle) {
      if (key >= clip_box.idle[key].next_key) {
        window.alert("error ai loading");
        throw "error ai loading";
      }
    }
    for (const key in clip_box.idle) {
      const item = clip_box.idle[key];
      item.body_frames = [];
      item.src.map((e) => {
        const img = new Image();
        loadImage(e, img)
          .then((img) => {
            img_loading(mReq.callback, mReq.finish);
          })
          .catch((err) => console.error(err));
        item.body_frames.push(img);
      });
    }
    return;
  }

  const loadImage = (url, img) => {
    const temp = new Promise((resolve, reject) => {
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.src = url;
    });
    if (tempImages[currentAI.ai_name].length <= all_images_count) tempImages[currentAI.ai_name].push(temp);

    return temp;
  };

  async function load_gst() {
    for (let gst_key in currentAI.gst_map) {
      const gst = currentAI.gst_map[gst_key];
      let next_key = parseInt(gst.next_key || gst.end);
      for (let idle_key in clip_box.idle) {
        idle_key = parseInt(idle_key);
        if (next_key <= idle_key) {
          next_key = idle_key;

          break;
        }
      }
      clip_box.gst[gst_key] = {
        src: [],
        next_key,
      };
      for (let i = gst.start; i < gst.end + 1; i++) {
        let gstRevision = gst.revision ? `_${gst.revision}` : "";
        let gstDownloadPath = `${baseUrl}/${currentAI.ai_name}/${currentAI.emotion}/${currentAI.version}/${gst_key}${gstRevision}/${currentAI.ai_name}_${currentAI.emotion}_${gst_key}_v${currentAI.version}_`;
        clip_box.gst[gst_key].src.push(gstDownloadPath + i + ".png");
      }
    }

    for (let key in currentAI.gst_map) {
      const item = clip_box.gst[key];
      item.body_frames = [];
      item.gst_duration = 0;

      item.src.map((e) => {
        const img = new Image();
        loadImage(e, img)
          .then((img) => {
            img_loading(mReq.callback, mReq.finish);
          })
          .catch((err) => console.error(err));
        item.body_frames.push(img);
        item.gst_duration++;
      });
    }
  }

  const percentRoundFn = (num) => Math.round(num * 100) / 100;
  function rgb_to_hsv(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);

    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      v = max;

    let d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: percentRoundFn(s * 100),
      v: percentRoundFn(v * 100),
    };
  }
  function bitmap_Alpha(bitmap) {
    function isCloth({ h, s, v }) {
      return (200 < h && h < 260 && v < 50 && 70 < s) || (160 < h && h < 260 && 70 < s);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0)";

    ctx.drawImage(bitmap, 0, 0, canvas2_size_x, canvas2_size_y);
    const frame = ctx.getImageData(0, 0, canvas2_size_x, canvas2_size_y);

    let width = 4 * ctx.canvas.width;
    for (let y = 0; y < ctx.canvas.height; y++) {
      let height = width * y;
      if (y <= 10) {
        for (let x = 0; x < width; x += 4) {
          frame.data[x + 3 + height] = y * 25;
        }
      }
      if (y >= ctx.canvas.height - 60) {
        for (let x = 0; x < width; x += 4) {
          frame.data[x + 3 + height] = (ctx.canvas.height - y) * 4;
        }
      }
      let cnt = 0;
      let cnt_limit = 3;
      if (y > ctx.canvas.height - 200) {
        cnt_limit = 40;
      }
      for (let x = 0; x < width / 3; x += 4) {
        if (cnt > cnt_limit) break;
        let r = frame.data[x + height];
        let g = frame.data[x + 1 + height];
        let b = frame.data[x + 2 + height];
        let hsv = rgb_to_hsv(r, g, b);
        if (hsv.h > currentAI.hue_min && hsv.h < currentAI.hue_max) {
          frame.data[x + 3 + height] = 0;
          cnt = 0;
        } else if (isCloth(hsv)) {
          frame.data[x + 3 + height] = 0;
          cnt = 0;
        }
        cnt += 1;
      }
      cnt = 0;
      for (let x = width - 4; x > (width * 2) / 3; x -= 4) {
        if (cnt > cnt_limit) break;
        let r = frame.data[x + height];
        let g = frame.data[x + 1 + height];
        let b = frame.data[x + 2 + height];
        let hsv = rgb_to_hsv(r, g, b);
        if (hsv.h > currentAI.hue_min && hsv.h < currentAI.hue_max) {
          frame.data[x + 3 + height] = 0;
          cnt = 0;
        } else if (isCloth(hsv)) {
          frame.data[x + 3 + height] = 0;
          cnt = 0;
        }
        cnt += 1;
      }
    }

    ctx.putImageData(frame, 0, 0);
  }
  /*
   * event listener
   * */
  /**
   * @event AIPlayer#onAIPlayerError
   * @description error event
   * @example
   * AIPlayer.onAIPlayerError = function (err) {
   * console.log('err: ', err.error, err.errorCode);
   *
   * };
   * @property {Object} json - onAIPlayerError callback
   * @property {String} json.error - error
   * @property {Number} json.errorCode - error code
   */
  this.onAIPlayerError = (json) => {
    // console.log(`onAIPlayerError [${json.errorCode}] ${json.error}\n${json.description}\n${json.detail || ''}`);
  };
  function initSocket() {
    if (!ai_socket) {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js";
      document.body.appendChild(script);
      script.onload = function () {
        socketFunction();
      };
    } else {
      socketFunction();
    }
  }
  function socketFunction() {
    if (!ai_socket_connect) {
      ai_socket = io(socketUrl, { transports: ["websocket"] });
    }
    ai_socket_connect = ai_socket.connected;

    ai_socket.on("disconnect", function () {
      if (ai_socket_connect) that.onAIPlayerError(error_code("SynthSocketError"));
    });
    ai_socket.on("preInfo", function (msg) {
      // 2D, 3D 통합으로 임시추가
      if (currentAIType === "2D") speak_box_by_msg[msg.text].onPreInfo(msg);
    });
    ai_socket.on("image", function (msg) {
      // 2D, 3D 통합으로 임시추가
      if (msg) {
        if (currentAIType === "2D") {
          speak_box_by_msg[msg.text].onImage(msg);
        } else if (currentAIType === "MOV") {
          sequence_box_by_msg[newServerDiv ? msg.req.key : msg.key].speak.onImage(msg);
        }
      }
      
    });

    ai_socket.on("audio", function (msg) {
      if(currentAIType === "MOV") {
        sequence_box_by_msg[newServerDiv ? msg.req.key : msg.key].speak.onAudio(msg);
      } else {
        speak_box_by_msg[msg.text]?.onAudio(msg);
      }
      if (currentAIType === "3D") onReadyCurrentSpeak();
    });

    ai_socket.on("error", function (error) {
      console.error("gpu / mid server error", error);
      that.onAIPlayerError(error);
    });

    ai_socket.emit("users", { agent: navigator.userAgent });
  }

  function initDB() {
    // indexedDB.deleteDatabase('aiHuman') // delete cache
    AI_DB = function () {
      let DATABASE = "aiHuman";
      // let DATABASE = "aistudios";
      let DB_VERSION = 1;
      let DB_STORE_NAME = "ai_live_cache";
      let db;

      this.openDB = () => {
        let req = indexedDB.open(DATABASE, DB_VERSION);
        req.onsuccess = function (evt) {
          db = this.result;
        };
        req.onerror = function (evt) {
          that.onAIPlayerError({
            error: evt.target.errorCode,
            errorCode: evt.target.errorCode,
          });
        };
        req.onupgradeneeded = function (evt) {
          let store = evt.currentTarget.result.createObjectStore(DB_STORE_NAME, { keyPath: "cache_key" });
        };
      };

      this.add = (data) => {
        let transaction = db.transaction([DB_STORE_NAME], "readwrite");
        // Do something when all the data is added to the database.
        transaction.oncomplete = function (event) { };

        transaction.onerror = function (event) {
          // Don't forget to handle errors!
        };

        let objectStore = transaction.objectStore(DB_STORE_NAME);
        let request = objectStore.add(data);
        request.onsuccess = function (event) { };
      };
      this.get = (cache_key) => {
        return new Promise((resolve, reject) => {
          let db_req = db.transaction(DB_STORE_NAME).objectStore(DB_STORE_NAME).get(cache_key);
          db_req.onsuccess = function (event) {
            resolve(event.target.result);
          };
          db_req.onerror = function (event) {
            console.error("indexedDB error");
            resolve();
          };
        });
      };
      this.clear = () => {
        db.transaction(DB_STORE_NAME, "readwrite").objectStore(DB_STORE_NAME).clear();
      };

      this.close = () => {
        db.close();
      }

      this.backup = () => {
        const transaction = db.transaction([DB_STORE_NAME]);
        const object_store = transaction.objectStore(DB_STORE_NAME);
        const request = object_store.openCursor();

        request.onerror = function (event) {
          console.err("error fetching data");
        };
        request.onsuccess = function (event) {
          let cursor = event.target.result;
          if (cursor) {
            let key = cursor.primaryKey;
            let value = cursor.value;
            socket.emit("cache_save", value);
            cursor.continue();
          } else {
            // no more results
          }
        };
      };
    };
  }

  /**
   * [호출가능한 실행함수]
   *
   * 1. init({params}): AI 모델 초기화 함수.
   * params
   *    1) ai_name: String
   *    2) callback(): function(progress)  => loading progress data callback
   *    3) finish(): function()  => loading complete callback
   *
   * 2. startAnimation(): Idle 영상 play start
   *
   * 3. speak(text, version): 영상합성 요청
   * params
   *    1) text: 합성을 원하는 text
   *    2) version: ai model version(default 1)
   *
   * 4. stopSpeak(): 말하고 있는 도중 pause(주의 resume 안됨)
   *
   * 5. destroy(): AI 서버와 소켓연결 해제. Idle 영상 멈춤.
   * **/

  this.init = async function (json, callback) {
    reset();

    clip_box = {
      idle: {},
      gst: {},
      back: {},
    };
    const aiName = json.AIModelInfo.ai_name;

    if (!AI_DB) {
      initDB();
    }
    initSocket();
    if (!cache_db) {
      cache_db = new AI_DB();
      cache_db.openDB();
    }
    if (!AIs[aiName]) {
      const result = await getAIInfo({
        appId: mReq.AppInfo.appId,
        token: mReq.AppInfo.token,
        aiName
      });
      if (!result.succeed) return returnResult(result, true, callback);
    }

    /**
     * 3D: 일반적으로 getAIInfo를 한번만 하지만, 3D의 경우 default_voice에 해당하는 목소리 ai를 가져오기 위해 getAIInfo를 두번 해줌. 
     *     aiInfo 결과중, 3D모델의 정보는 currentUnityAI, 2D모델(voice용) 정보는 currentAI에 집어넣음.   
     */

    currentAI = AIs[aiName];

    // TODO: 임시
    const beforeAIType = currentAIType;
    const updatedAI = AIs[aiName];
    currentAIType = updatedAI.type || "2D";

    //default setting
    that.setter({ zIndex: json.AIModelInfo.zIndex });
    that.setter({ size: json.AIModelInfo.size });
    that.setter({ top: json.AIModelInfo.top });
    that.setter({ left: json.AIModelInfo.left });
    that.setter({ speed: json.AIModelInfo.speed });

    switch (currentAIType) {
      case "MOV":
        if (beforeAIType === "2D") reset2DObject();
        if (beforeAIType === "3D") reset3DObject();
        setupMovObject();

        currentAI = updatedAI;

        canvas_size_x = currentAI.imageWidth;
        canvas_size_y = currentAI.imageHeight;
        faceX = currentAI.faceX_F ? currentAI.faceX_F : currentAI.faceX;
        faceY = currentAI.faceY_F ? currentAI.faceY_F : currentAI.faceY;
        canvas2_size_x = currentAI.imageWidth
        canvas2_size_y = currentAI.imageHeight;
        canvasCTX.canvas.width = canvas_size_x;
        canvasCTX.canvas.height = canvas_size_y;
        ctx.canvas.width = canvas2_size_x;
        ctx.canvas.height = canvas2_size_y;
        ctx.canvas.style.position = "";

        setCanvas();

        if (!ai_mov_live) {
          ai_mov_live = new AI_LIVE_MOV({
            canvas: canvas2,
            canvas2: canvas,
            language: currentAI.language,
          });
        }

        ai_mov_live.init({
          aiName,
          ai_name: aiName,
        });

        return returnResult({ texts: AIs[aiName].texts }, false, callback);
      case "3D":
        if (beforeAIType === "MOV") resetMOVObject(); // MOV
        if (beforeAIType === "2D") reset2DObject();
        if (!AIs[updatedAI.default_voice]) {
          const result = await getAIInfo({
            appId: mReq.AppInfo.appId,
            token: mReq.AppInfo.token,
            aiName: updatedAI.default_voice,
          });
          if (!result.succeed) return returnResult(result, true, callback);
        }

        currentAI = AIs[updatedAI.default_voice];
        currentUnityAI = updatedAI;

        if (!isLoadUnityScript) await loadUnityScript(); // 동적으로 webgl loaderUrl script를 추가해줌.
        if (beforeAIType !== "3D") await setup3DObject();

        const unityAIInfo = { ...currentUnityAI };
        unityAIInfo.name = currentUnityAI.ai_name;
        unityAIInfo.res_region = region;
        unityInstance.SendMessage("MasterObject", "LoadCharacter", JSON.stringify(unityAIInfo));

        isInitComplete = true;

        return returnResult({ texts: currentAI.texts }, false, callback);
      case "2D":
        if (beforeAIType === "MOV") resetMOVObject(); // MOV
        if (beforeAIType === "3D") reset3DObject();
        if (beforeAIType !== "2D") setup2DObject();

        currentAI = updatedAI;

        canvas_size_x = currentAI.imageWidth;
        canvas_size_y = currentAI.imageHeight;
        faceX = currentAI.faceX_F ? currentAI.faceX_F : currentAI.faceX;
        faceY = currentAI.faceY_F ? currentAI.faceY_F : currentAI.faceY;
        canvas2_size_x = currentAI.faceWidth_F ? currentAI.faceWidth_F : currentAI.faceWidth;
        canvas2_size_y = currentAI.faceHeight_F ? currentAI.faceHeight_F : currentAI.faceHeight;
        canvasCTX.canvas.width = canvas_size_x;
        canvasCTX.canvas.height = canvas_size_y;
        ctx.canvas.style.position = "absolute";
        ctx.canvas.width = canvas2_size_x;
        ctx.canvas.height = canvas2_size_y;

        setCanvas();
        mReq.AppInfo = { ...mReq.AppInfo, ...json.AppInfo };
        mReq.AIModelInfo = json.AIModelInfo;
        mReq.callback = json?.callback;
        mReq.finish = json.finish;
        if (currentAI.hue_min && currentAI.hue_max) needChroma = true;
        //---db data set!
        idleStartIndex = currentAI.animations.idle.fileBeginIndex;
        idleEndIndex = currentAI.animations.idle.fileEndIndex;
        idleBackMapFrames = currentAI.animations.idle.backMotionFrames;
        const revision = currentAI.revision ? `_${currentAI.revision}` : "";
        const info_version = currentAI.info_version;
        //fps Interval
        if(!currentAI.fps) currentAI.fps = 30;
        fpsInterval = 1000 / (currentAI.fps * audioPlaybackRate);
        
        if (info_version == 2) {
          //new way!!!
          idleDownloadPath = `${baseUrl}/${currentAI.animations.idle.downloadPath}${revision}/${currentAI.ai_name}_${currentAI.emotion}_idle_v${currentAI.version}_`;
        } else {
          //old way!!!
          idleDownloadPath = `${baseUrl}/${currentAI.animations.idle.downloadPath}${revision}/${currentAI.fileName_prefix}_${currentAI.animations.idle.objectName}_`;
        }
        all_images_count = idleEndIndex - idleStartIndex;
        for (let i in idleBackMapFrames) {
          all_images_count += idleBackMapFrames[i];
        }
        loaded_images_count = 0;
        that.onAIPlayerStateChanged("playerLoadStarted");
        if (currentAI.gst_map && info_version == 2) {
          for (const gst_key in currentAI.gst_map) {
            const gst = currentAI.gst_map[gst_key];
            all_images_count += gst.end - gst.start;
          }
        }
        condition.update(currentAI.ai_name);
        if (!tempImages[currentAI.ai_name]) tempImages[currentAI.ai_name] = [];

        load_idle(currentAI.ai_name);

        if (currentAI.gst_map && info_version == 2) load_gst(currentAI.ai_name);

        return returnResult({ texts: AIs[aiName].texts }, false, callback);
      default: return;
    }
  };

  function setCanvas() {
    canvas_wrapper.style.height = `calc(${settings.size * 100}%)`;
    ai_model_scale = canvas.clientHeight / canvas_size_y;
    canvas_wrapper.style.width = canvas_size_x * ai_model_scale + "px";
    canvas_wrapper.style.left = `calc(50% + ${settings.left}px)`;
    canvas_wrapper.style.top = settings.top + "px";
    canvas_wrapper.style.transform = "translate(-50%,0)";

    canvas2.style.width = canvas2_size_x * ai_model_scale + "px";
    canvas2.style.height = canvas2_size_y * ai_model_scale + "px";
    canvas2.style.left = faceX * ai_model_scale + "px";
    canvas2.style.top = faceY * ai_model_scale + "px";
  }

  function reset() {
    // AI변경시 사운드 계속 재생되어 추가 (발화 정지 및 큐 초기화)
    that.stopSpeak();

    if (currentAIType === "3D") {
      unityInstance.SendMessage("MasterObject", "UnloadCharacter");
    }
    else {
      if (animationId) cancelAnimationFrame(animationId);
    }

    needChroma = false;
    isInitComplete = false;
  }

  function resizeCanvas() {
    if (currentAI) setCanvas();
  }

  function setup2DObject() {
    if (!canvas_wrapper) {
      canvas_wrapper = document.createElement('div');
      canvas_wrapper.style.position = 'relative';

      canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.height = '100%';

      canvas2 = document.createElement('canvas');
      canvas2.style.position = 'absolute';

      canvas_wrapper.append(canvas, canvas2);

      canvasCTX = canvas.getContext("2d");
      ctx = canvas2.getContext("2d");
    }

    wrapper.append(canvas_wrapper);
    window.addEventListener("resize", resizeCanvas);
  }

  // 2D, 3D 통합으로 reset 부분 추가
  function reset2DObject() {
    canvas_wrapper.remove();
    ctx.clearRect(0, 0, canvas_size_x, canvas_size_y);
    canvasCTX.clearRect(0, 0, canvas_size_x, canvas_size_y);
    window.removeEventListener('resize', resizeCanvas);
  }

  // 3d unity script load
  const loadUnityScript = () => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = loaderUrl;

    document.body.appendChild(script);
    script.onload = () => {
      isLoadUnityScript = true;
      resolve();
    };
  });

  // MOV Versin 관련 수정.
  async function setupMovObject() {
    if (!canvas_wrapper) {
      canvas_wrapper = document.createElement('div');
      canvas_wrapper.style.position = 'relative';

      canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.height = '100%';

      canvas2 = document.createElement('canvas');
      canvas_wrapper.append(canvas, canvas2);

      canvasCTX = canvas.getContext("2d");
      ctx = canvas2.getContext("2d");
    }
    wrapper.append(canvas_wrapper);
    window.addEventListener("resize", resizeCanvas);
  }

  async function setup3DObject() {
    if (!unityCanvas) {
      unityCanvas = document.createElement('canvas');
      unityCanvas.id = `unity-canvas`;
      unityCanvas.style.position = "absolute";
      unityCanvas.style.width = "100%";
      unityCanvas.style.height = "100%";
    }

    wrapper.append(unityCanvas);

    if (window.AI_PLAYER === undefined) window.AI_PLAYER = that;

    that.onAIPlayerStateChanged("playerLoadStarted");
    await createUnityInstance(unityCanvas, unityConfig, (progress) => {
      that.onAIPlayerLoadingProgressed({ loading: Math.floor(progress * 100) });
    }).then((instance) => {
      that.onAIPlayerStateChanged("playerLoadComplete");
      unityInstance = instance;
    }).catch(err => that.onAIPlayerError(typeof err === "string" ? err : err.message));
  }

  async function resetMOVObject() {
    if (!ai_mov_live) return;
    canvas_wrapper.remove();
    ai_mov_live.resetAIMovLive(true);
  }

  // 2D, 3D 통합으로 reset 부분 추가
  async function reset3DObject() {
    if (!unityInstance) return;

    await unityInstance.Quit().then(() => {
      unityCanvas.remove();
      unityInstance = null;
    });
  }

  function set3DScale() {
    unityInstance.SendMessage("MasterObject", "SetScale", settings.size.toString());
  }

  function onReadyCurrentSpeak() {
    const currentSpeak = AnimateNow.current_speak;
    if (!currentSpeak) return;

    if (!isPlaying && currentSpeak.isReady) {
      const binaryStr = window.atob(currentSpeak.audio_socket_raw.audio);
      const binaryStrLength = binaryStr.length;
      const bytes = new Uint8Array(binaryStrLength);

      for (var i = 0; i < binaryStrLength; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const unityMessage = {
        audioData: URL.createObjectURL(new Blob([new Uint8Array(bytes.buffer)], { type: 'audio/mp3' })),
        text: currentSpeak.msg_text,
        gesture: currentSpeak.gst,
        speed: 1
      };
      unityInstance.SendMessage("MasterObject", "Send", JSON.stringify(unityMessage));
    }
  }

  // unity state change 콜백함수
  this.onUnityStateChanged = function (str) {
    const json = JSON.parse(str);
    const eventName = json.event_name;

    this.onAIPlayerStateChanged(eventName);

    // 2D, 3D 통합으로 임시추가
    switch (eventName) {
      case "SpeechStart":
        isPlaying = true;
        if (AISpeakStart) AISpeakStart({ subtitle: AnimateNow.current_speak.subtitle });
        break;
      case "SpeechEnd":
        delete AnimateNow.current_speak;
        isPlaying = false;
        speakNext();
        if (AISpeakEnd) AISpeakEnd(AnimateNow.current_speak ? true : false);
        onReadyCurrentSpeak();
        break;
      case "CharacterLoadComplete":
        set3DScale();
        break;
    }
  }

  /**
   * @event AIPlayer#onAIPlayerStateChanged
   * @description AIPlayer state값 콜백
   * @example
   * AIPlayer.onAIPlayerStateChanged = function (state) {
   *
   * if (['playerLoadStarted', 'speakingPrepareStarted', 'preloadStarted'].includes(state)) showLoadingBar();
   * if (['playerLoadComplete', 'speakingPrepareComplete', 'preloadComplete'].includes(state)) hiddenLoadingBar();
   *
   * if (state === 'playerLoadStarted') showLoadingProcess();
   * if (state === 'playerLoadComplete') hideLoadingProcess();
   *
   * if (state == 'speakingAllComplete') {
   * if (onUserInput) startUserInput();
   * if (onEnd) release();
   * }
   *
   * };
   * @property {('playerLoadStarted'|'playerLoadComplete'|'speakingPrepareStarted'|'speakingPrepareComplete'|'speakingStarted'|'speakingComplete'|'preloadStarted'|'preloadComplete'|'speakingAllComplete')} state - AIPlayer state
   */
  this.onAIPlayerStateChanged = (state, detail = "") => { };
  this.setConfig = (json) => {
    if (json.midServer) socketUrl = json.midServer;
    if (json.authServer) serverUrl = json.authServer;
    if (json.resourceServer) baseUrl = json.resourceServer;
    if (json.service) service = json.service;
    if (json.newServerDiv) newServerDiv = json.newServerDiv;
    if (json.serverEmitType) serverEmitType = json.serverEmitType;
    if (json.language) projectInfoLanguage = json.language;
  };

  // TODO: 미사용 임시주석
  // this.getValue = (key) => {
  //   let keys = key.split(".");
  //   console.log("keys", keys);
  //   if (!currentAI) {
  //     return that.onAIPlayerError(error_code("keyError"));
  //   }
  //   let temp = currentAI;
  //   console.log("currentAI", currentAI);
  //   for (let idx in keys) {
  //     console.log("idx", idx);
  //     let each_key = keys[idx];
  //     console.log(temp[each_key]);
  //     if (temp[each_key]) temp = temp[each_key];
  //     else return that.onAIPlayerError(error_code("keyError"));
  //   }
  //   return temp;
  // };

  this.setter = function (json) {
    if (!json) {
      that.onAIPlayerError(error_code("Missing Parameter error"));
      return false;
    }


    if (typeof json.token == "string" && json.token && mReq.AppInfo) mReq.AppInfo.token = json.token;
    if (typeof json.appId == "string" && json.appId && mReq.AppInfo) mReq.AppInfo.appId = json.appId;

    /* position */
    if (!settings) settings = {};
    if (typeof json.zIndex == "number") {
      settings.zIndex = json.zIndex;
    }
    if (typeof json.size == "number") {
      settings.size = json.size;
    }
    if (typeof json.top == "number") {
      settings.top = json.top;
    }
    if (typeof json.left == "number") {
      settings.left = json.left;
    }
    if (typeof json.speed == "number") {
      settings.playbackRate = json.speed;
      const fps = currentAI.fps || 30;
      fpsInterval = 1000 / (fps * json.speed);
      audioPlaybackRate = json.speed;
    }

    // 3D, 2D 통합으로 canvas를 init이후에 생성하기때문에  임시 추가
    if(isInitComplete) {
      if(currentAIType === "3D") {
        set3DScale();
      } else {
        setCanvas();
      }
    }

    return true;
  };
  async function getAIInfo(json, callback) {
    let err = checkReq(json);
    if (err || !json || !json.aiName) {
      return returnResult(err || error_code("RequestParamsMissing"), true, callback);
    }
    const { appId, token, aiName } = json;
    if (AIs[aiName]) return { succeed: true, aiInfo: AIs[aiName] };
    const result = await makeRequest("POST", `${serverUrl}/api/aihuman/getAIInfo`, {
      appId,
      platform: platform,
      token,
      aiName,
      uuid,
      sdk_v,
      service,
    });
    if (result && result.succeed) {
      AIs[aiName] = result.aiInfo;
    } else {
      return returnResult(result, true, callback);
    }
    return returnResult(result, null, callback);
  }
  this.getAIList = async function (json, callback) {
    const appId = json ? json.appId : "";
    const token = json ? json.token : "";
    const options = { appId, token, platform, uuid, sdk_v };
    let result = await makeRequest("POST", `${serverUrl}/api/aihuman/getAIList`, options);
    if (!result || !result.succeed) {
      return returnResult(result, true, callback);
    }
    return returnResult(result, false, callback);
  };
  this.getGestures = function (aiName) {
    const gestureList = [];
    const selectAI = AIs[aiName];

    switch (selectAI.type) {
      case "MOV":
        if (!selectAI.video_map) return gestureList;
        for (const [key, value] of Object.entries(selectAI.video_map)) {
          gestureList.push({
            gst: key,
            enableSpeech: true,
          });
        }
        break;
      case "3D":
        if (!selectAI.gestures) return gestureList;

        for (let value of selectAI.gestures) {
          gestureList.push({ gst: value, enableSpeech: true });
        }

        break;
      default:
        if (!selectAI.gst_map) return gestureList;

        for (const [key, value] of Object.entries(selectAI.gst_map)) {
          gestureList.push({ gst: key, enableSpeech: value.enableSpeech || false });
        }
        break;
    }

    return gestureList;
  };
  this.getter = function (key) {
    if (!currentAI) currentAI = {};
    if (!settings) settings = {};
    if (key === "maxTextLength") return currentAI.maxTextLength || 120;
    if (key === "language") return currentAI.language || "";
    if (key === "zIndex") return settings.zIndex;
    if (key === "size") return settings.size;
    if (key === "speed") return settings.speed;
    if (key === "top") return settings.top;
    if (key === "left") return settings.left;
    if (key === "token") return mReq.AppInfo.token;
    if (key === "appId") return mReq.AppInfo.appId;
    if (key === "tokenExpire") return mReq.AppInfo.tokenExpire || 0;
    if (key === "playBackRate") return settings.playbackRate;
    return "";
  };

  this.set_socket_audio = (e) => {
    socket_audio = e;
  };
  this.generateToken = async function (json, callback) {
    const { appId, token } = json;
    console.log("test json : ", json);
    const options = { appId, token, platform, uuid, sdk_v };

    let result = await makeRequest("POST", `${serverUrl}/api/aihuman/generateToken`, options);
    console.log("test result : ", result);
    if (result && result.succeed) {
      setMReq({
        AppInfo: {
          appId,
          token: result.token,
          tokenExpire: result.tokenExpire,
        },
      });
    } else {
      return returnResult(result, true, callback);
    }

    return returnResult(result, false, callback);
  };
  this.startAnimation = function () {
    then = Date.now();

    animationId = requestAnimationFrame(AnimateNow);
    return null;
  };
  function setMReq(json) {
    if (!json || typeof json != "object") return that.onAIPlayerError(error_code("RequestParamsMissing"));

    Object.keys(json).map((key) => (mReq[key] = json[key]));
  }

  function checkReq(json) {
    let err = null;
    if (!json || !json.appId || !json.token) {
      err = error_code("RequestParamsMissing", `missing request parameters`);
    }
    return err;
  }
  function returnResult(result, isError, callback) {
    if (isError) {
      if (result) that.onAIPlayerError(result);
      else that.onAIPlayerError(error_code("", "unknown error"));
    }

    if (callback != null) return callback(result);
    else return result;
  }

  function getUUID() {
    let uuid = localStorage.getItem("aiHumanUUID");
    if (!uuid || uuid === undefined) {
      uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 3) | 8;
        return v.toString(16);
      });
      localStorage.setItem("aiHumanUUID", uuid);
    }
    return uuid;
  }

  this.send = function (msg) {
    sendSpeakRequest(msg);
  };
  this.preload = function (msg) {
    sendSpeakRequest(msg, true);
  };

  function sendSpeakRequest(msg, isPreload = false) {
    const newMsg = changeAIClipSet(msg);
    if(currentAI.type === "MOV") {
      let movText = "";
      let subTitle = "";
      //중복 발하 이슈로 한문장으로 처리 해당 오류 수정 예정 (2022.08.17)
      newMsg.forEach((AIClipSet) => {
        movText += AIClipSet.text;
        subTitle += AIClipSet.subtitle ? AIClipSet.subtitle : "";
      });
      isPlaying = true;
      console.log("currentAI : ", currentAI, newMsg, movText, subTitle);
      ai_mov_live.msg_send([movText], [subTitle], "random", currentAI.language);
    } else {
    if (!checkInit()) return;
      if (newMsg)
      newMsg.forEach((AIClipSet) => {
        if (AIClipSet) {
          const speak = new Speak({
            msg: AIClipSet.text,
            gst: AIClipSet.gst ? AIClipSet.gst : "backend",
            clipType: AIClipSet.clipType,
            subtitle: AIClipSet.subtitle?.length > 0 ? AIClipSet.subtitle : AIClipSet.text,
            preload: isPreload
          });

          speak_box_order.push(speak);
          speak_box_by_msg[AIClipSet.text] = speak;
        }
      });

    speakNext();
    }
  }

  function changeAIClipSet(msg) {
    const result = !Array.isArray(msg) ? [msg] : msg;

    return result.map((item) => {
      switch (typeof item) {
        case "string":
          if (item.length === 0) return null;
          return { text: item, subtitle: "", gst: "backend", clipType: "CLIP_SPEECH" };
        case "object":
          if (!item?.gst && !item?.text) return null;

          let clipSet = { text: "", gst: "backend", clipType: "CLIP_SPEECH" };
          const text = item.text;
          const subtitle = item.subtitle;
          const gst = item.gst;

          if (text && text.length > 0) clipSet.text = text;
          if (subtitle && subtitle.length > 0) clipSet.subtitle = subtitle;

          // MOV
          if (currentAIType === "MOV") {
            clipSet.gst = gst;
            clipSet.clipType = "CLIP_GESTURE";
          } else if (currentAIType === "2D") {
            if (gst && currentAI.gst_map?.[gst]) {
              clipSet.gst = gst;
              clipSet.clipType = "CLIP_GESTURE";

              if (currentAI.gst_map[gst]?.enableSpeech && clipSet.text.length > 0) clipSet.clipType = "CLIP_SPEECH_GESTURE";
            }
          } else {
            if (gst && currentUnityAI.gestures && currentUnityAI.gestures.includes(gst)) {
              clipSet.gst = gst;
              if (clipSet.text.length === 0) clipSet = null;
            }
          }

          return clipSet;
        default: return null;
      }
    });
  }

  function speakNext() {
    if (!AnimateNow.current_speak) {
      AnimateNow.current_speak = speak_box_order.shift();
    }
  }

  class Speak {
    constructor({ msg, gst, clipType, subtitle, preload }) {
      this.subtitle = subtitle;
      this.images = [];
      this.images_socket_raw = [];
      this.audio = new Audio();
      this.codec = "mp3";
      this.msg_text = msg;
      this.gst = gst;
      this.clipType = clipType;
      this.preload = preload;
      this.isCache = false;
      this.isReady = false;

      if (this.gst === "backend" || !this.gst) {
        this.cache_key = [currentAI.ai_name, currentAI.emotion, currentAI.version, this.msg_text].join("_");
      } else {
        this.cache_key = [currentAI.ai_name, currentAI.emotion, currentAI.version, this.gst, this.msg_text].join("_");
      }

      if (this.clipType === "CLIP_GESTURE") {
        this.images = [];
        this.isReady = true;
      } else {
        cache_db.get(this.cache_key).then((cache_msg) => {
          if (cache_msg) {
            this.audio_socket_raw = cache_msg.audio;
            // 2D, 3D 통합으로 분기 임시추가
            if (currentAIType === "2D") {
              cache_msg.images.forEach((msg) => this.setImage(msg));
              this.duration = parseInt(cache_msg.audio.num_images);
              this.didWirteCache = true;
            }
            this.check_isReady();

            if (this.preload) that.onAIPlayerStateChanged("preloadComplete");
          } else {
            const option = {
              text: this.msg_text,
              ai_name: currentAI.ai_name,
              version: currentAI.version,
              emotion: currentAI.emotion,
              language: currentAI.language,
              gst: this.gst,
              ai_name_temp: currentAI.ai_name,
              server_name: currentAI.server_name,
              platform,
              uuid,
              sdk_v,
              appId: mReq.AppInfo.appId,
              token: mReq.AppInfo.token,
              preload: this.preload,
              clientHostname: window.location.hostname,
              long_speech: currentAI.long_speech,
            };

            ai_socket.emit("msg", option);
          }
        });
      }
    }

    onImage(msg) {
      this.images_socket_raw[msg.frame_number] = msg;
      this.setImage(msg);
      this.check_isReady();
    }
    setImage(msg) {
      let img = new Image();
      img.src = "data:image/jpeg;base64," + msg.image;
      this.images[msg.frame_number] = img;
    }
    onPreInfo(msg) {
      if (msg.isCache) this.isCache = true;
      else this.isCache = false;
    }

    onAudio(msg) {
      this.audio_socket_raw = msg;
      this.check_isReady();
      // 2D, 3D 통합으로 분기 임시추가
      if (currentAIType === "2D") this.duration = parseInt(msg.num_images);
    }

    setAudio() {
      this.audio = socket_audio || new Audio();
      const msg = this.audio_socket_raw;
      this.audio.src = "data:audio/" + this.codec + ";base64," + msg.audio;
      this.audio.load();
    }

    check_isReady() {
      // 2D, 3D 통합으로 분기 임시추가
      switch (currentAIType) {
        case "3D":
          if (!this.isReady) this.isReady = true;
          break;
        case "2D":
          if (this.duration) {
            if (!this.isReady) {
              if (!this.isCache) {
                if (this.images.length > this.duration * 0.3 && !this.preload) {
                  this.isReady = true;
                }
              } else {
                if (this.images.length > threshold && !this.preload) {
                  this.isReady = true;
                }
              }
            }
            if (this.preload) {
              that.onAIPlayerStateChanged("preloadComplete");
              delete AnimateNow.current_speak;
            } else {
              if (!this.didWirteCache && this.images.length === this.duration) {
                this.didWirteCache = true;
                cache_db.add({
                  images: this.images_socket_raw,
                  audio: this.audio_socket_raw,
                  cache_key: this.cache_key,
                });
              }
            }
          }
          break;
      }
    }
  }

  this.stopSpeak = function () {
    console.log(">>>>>>>> stopSpeak isPlaying : " + isPlaying);
    if (!isPlaying) return;

    if (currentAIType === "3D") {
      delete AnimateNow.current_speak;
      if (unityInstance) unityInstance.SendMessage("MasterObject", "StopSpeaking");
    } else if (currentAIType === "MOV") {
      console.log(">>>>>>>> stopSpeak : 1");
      ai_mov_live.stopSpeak();
    } else {
      if (AnimateNow.sequence) AnimateNow.sequence.stopSpeaking();
      // 2D pause상태일때 stop을누르면 애니메이션이 pause 상태로 지속되서 임시추가
      if (isPausing) that.startAnimation();
    }

    speak_box_order = [];
    speak_box_by_msg = {};
    isPlaying = false;
    isPausing = false;
  };

  this.release = function () {
    if (isReleased) return;

    reset();
    cache_db.close();
    if (ai_socket) {
      ai_socket.disconnect();
      ai_socket.close();
      ai_socket_connect = false;
    }

    AIs = null;
    currentAI = null;
    settings = null;
    mReq = null;
    condition.release();
    condition = null;
    speak_box_order = null;
    speak_box_by_msg = null;
    AnimateNow.current_speak = null;
    AnimateNow.sequence = null;
    AnimateNow = null;

    reset3DObject();
    unityConfig = null;
    unityCanvas = null;

    reset2DObject();
    canvas_wrapper = null;
    canvas = null;
    canvas2 = null;
    canvasCTX = null;
    ctx = null;
    tempImages = null;
    idleBackMapFrames = null;
    clip_box = null;

    wrapper.innerHTML = "";
    isReleased = true;
    that = null;
  };

  this.pause = function () {
    if(currentAIType === "MOV") {
      ai_mov_live.pause();
    } else {
      if (!checkInit()) return;
      if (!isPlaying) return;
  
      isPausing = true;
  
      if (currentAIType === "3D") unityInstance.SendMessage("MasterObject", "Pause");
      else {
        AnimateNow.sequence.pauseSpeaking();
        if (animationId) cancelAnimationFrame(animationId);
      }
    }
  };

  this.resume = function () {
    if(currentAIType === "MOV") {
      ai_mov_live.resume();
    } else {
      if (!checkInit()) return;
      // pause상태일때만 resume 동작
      if (!isPausing) return;
  
      isPausing = false;
  
      if (currentAIType === "3D") unityInstance.SendMessage("MasterObject", "Resume");
      else AnimateNow.sequence.resumeSpeaking();
    }
  };

  // TODO: 미사용 임시 주석
  // this.callSpeakStarted = function () {
  //   AISpeakStart();
  // };

  // this.callSpeakEnd = function () {
  //   AISpeakEnd();
  // };
  this.isAiSpeaking = function () {
    if (AnimateNow && AnimateNow.sequence && AnimateNow.sequence.isSpeaking()) return true;
    return false;
  };
  this.splitSentence = async (text) => {
    let result = await makeRequest("POST", `${socketUrl}/split`, {
      text,
      language: currentAI.language,
      long_speech: currentAI.long_speech,
    });

    if (result.status === 200) {
      return result.data.text;
    } else {
      return [text];
    }
  };

  // kiosk template에서 사용
  this.audioVolumeUp = () => {
    if (audio_volume >= 100) {
      audio_volume = 100;
      return;
    }
    audio_volume += 10;
  };

  // kiosk template에서 사용
  this.audioVolumeDown = () => {
    if (audio_volume <= 0) {
      audio_volume = 0;
      return;
    }
    audio_volume -= 10;
  };

  // TODO: template에서 사용 추후 삭제 해야함
  this.setSpeed = (e) => {
    if (e == 1.0) e = 1;
    if (audioPlaybackRate !== e) {
      const fps = currentAI.fps || 30;
      fpsInterval = 1000 / (fps * e);
      audioPlaybackRate = e;
    }
  };

  /**
   * [Event 함수]
   * 1. speakStarted(): speak() 요청으로 합성된 음성/영상이 시작되는 시점에 호출되는 callback 함수.
   * 2. speakEnded(): speak() 요청으로 합성된 음성/영상이 종료되는 시점에 호출되는 callback 함수.
   * **/
  this.speakStarted = function (callback) {
    AISpeakStart = callback;
  };
  this.speakEnded = function (callback) {
    AISpeakEnd = callback;
  };

  function gesture_jump(e) {
    if (!currentAI.gestures[e]) return;
    if (currentAI.currentGesture) return;

    currentAI.readyGesture = {
      isIdleCT: currentAI.gestures[e].isIdleCT,
      name: e,
      frames: [...currentAI.gestures[e].main],
      audio: currentAI.gestures[e].audio,
    };
  }

  // kiosk template에서 사용
  this.debug_jump = function (e) {
    if (!isInitComplete) return;
    if (currentAI.gestures[e]) return gesture_jump(e);
  };

  // TODO: 미사용 임시 주석
  // this.cache_backup = function () {
  //   cache_db.backup();
  // };

  // TODO: 미사용 임시 주석
  // this.write_ai_direct = function (data) {
  //   cache_db.add(data.data);
  // };

  // kiosk template에서 사용
  this.isAiLoaded = () => isInitComplete;

  function checkInit() {
    if (!isInitComplete && !currentAI) that.onAIPlayerError(error_code("InitError"));
    return isInitComplete && currentAI;
  }

  /*
   * handle error
   * */
  function error_code(err = "", detail = "") {
    let error = {
      errorCode: 500,
      error: "Server error",
      description: "An unknown server error has occurred.",
    };
    switch (err) {
      // 요청 변수 확인
      case "RequestParamsMissing":
        error = {
          errorCode: 1400,
          error: "Missing Parameter error",
          description: "The required request variable is missing or the request variable name is incorrect",
        };
        break;
      case "InvalidAppInfo":
        error = {
          errorCode: 1400,
          error: "Invalid App Info error",
          description: "Incorrect app information.",
        };
        break;
      // init error
      case "InitError":
        error = {
          errorCode: 1401,
          error: "AI Init Error",
          description: "Failed to create ai object.",
        };
        break;
      // TODO: 미사용 임시 주석
      // case "keyError":
      //   error = {
      //     errorCode: 1402,
      //     error: "Invalid key error",
      //     description: "Failed to get value of the key",
      //   };
      //   break;
      case "SynthMaxLengthError":
        error = {
          errorCode: 1501,
          error: "AI Synth error",
          description: "Sentences are over max length",
        };
        break;
      case "SynthSocketError":
        error = {
          errorCode: 1502,
          error: "AI Synth error",
          description: "The synthesis server is disconnected or has an error.",
        };
        break;
      case "AudioPlayError":
        error = {
          errorCode: 1503,
          error: "AI Synth error",
          description: "The audio is abnormal or there is an error in play.",
        };
        break;
      // server error
      default:
        break;
    }

    error.succeed = false;
    if (detail) error.detail = detail;

    return error;
  }
  async function makeRequest(method, url, params) {
    if (!params) params = {};

    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json; charSet=utf-8",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
      },
    };
    if (method === "POST") {
      params.clientHostname = window.location.hostname;
      options.body = JSON.stringify(params);
    }
    return await fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("** An error occurred during the fetch", error);
        return undefined;
      });
  }

  class AI_LIVE_MOV {
    constructor({
      canvas, canvas2, isOnlySocketUrl, language
    }) {
      console.log(">>> AI_LIVE_MOV <<<");
      let testCount = 0;
      let testCount2 = 0;
      let sumTime = 0;
      let total_duration2 = [];
      let total_duration3 = 0;

      let statTime = 0;
      let startDate;
      let endDate_1;
      let endDate_2;

      let nextAudio = [];
      let ai_socket_connect = false;
      // let ai_socket;
      // initSocket();
      const { browser, isMobile, isIOS } = deviceDetect();

      var canvasBgCtx = canvas.getContext("2d");
      var canvasFaceCtx = canvas2.getContext("2d");

      let op_step = 20;
      let user_select_gst = "random";

      if (browser === "safari") {
        canvas2.setAttribute(
          "style",
          "-webkit-filter:brightness(106.5%) contrast(92%)"
        );
        op_step = 30;
      }

      // const debug_playspeed = $("#playspeed");
      // const debug_start_time = $("#start_time");
      // const debug_video_info = $("#video_info");
      // const jq_usertext = $("#user_txt");

      let audioCtx; // = new AudioContext();
      let audioCtxPlayedTime = 0;

      let fpsInterval = 1000 / 29.97;
      let time_to_frame = 1 / 29.97;
      let previousIdleGstIndex = 0;
      let idleGstTriggerIdx = 30;
      let latestUserTextChanged = new Date();
      let now, elapsed, then;
      var playing_video;
      let current_speak;
      let videoBox = [];
      let sequence_box_order = [];
      // let sequence_box_by_msg = {};

      let forceStop = false;

      let currentAI;

      if (isOnlySocketUrl)
        return socketUrl;

      let animationId;

      // let previous_backmotion_time = 0;
      function initSocket() {
        if (!ai_socket) {
          let script = document.createElement("script");
          script.type = "text/javascript";
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js";
          document.body.appendChild(script);
          script.onload = function () {
            socketFunction();
          };
        } else {
          socketFunction();
        }
      }

      function socketFunction() {
        // const _socketUrl = "https://aihuman-dev.playchat.ai:3010";  //Leo Kim
        const _socketUrl = socketUrl;
        if (!ai_socket_connect) {
          ai_socket = io(_socketUrl, { transports: ["websocket"] });
        }

        ai_socket_connect = ai_socket.connected;

        ai_socket.on("disconnect", function () {
          console.error("disconnect", "msg");
        });

        // ------------------- 여기서 gpu 서버에서 데이터를 받기 시작.
        ai_socket.on("image", function (msg) {
          if (msg.error) {
            console.error("GPU ERROR", msg);
            return;
          }
          if (!msg) return;
          sequence_box_by_msg[newServerDiv ? msg.req.key : msg.key].speak.onImage(msg);
        });

        ai_socket.on("audio", function (msg) {
          if (!msg) return;
          sequence_box_by_msg[newServerDiv ? msg.req.key : msg.key].speak.onAudio(msg);
        });

        ai_socket.on("error", function (error) {
          console.error("gpu / mid server error", error);
          window.alert("합성에 문제가 발생하였습니다. 재시작 합니다.");
          window.location.reload();
        });

        ai_socket.on("users", (msg) => {
          console.log("socker users", msg);
        });

        ai_socket.emit("users", { agent: navigator.userAgent });
      }


      function AnimateNow(timestamp) {
        //--- fps limit
        if (forceStop)
          return cancelAnimationFrame(animationId);
        now = Date.now();
        elapsed = now - then;
        if (elapsed < fpsInterval) {
          animationId = requestAnimationFrame(AnimateNow);
          return;
        }
        then = now - (elapsed % fpsInterval);

        prt_start_time();

        //faceX :  400 faceY 76 faceWidth undefined faceHeight 150
        // canvasFaceCtx.clearRect(100, 76, 300, 150);
        canvasFaceCtx.clearRect(currentAI.faceX, currentAI.faceY, currentAI.faceWidth, currentAI.faceHeight);

        let sequenceStartKey = currentAI.video_map_start_key;
        if (AnimateNow.sequence) {
          if (sequence_box_order[0] && sequence_box_order[0].isReady()) {
            AnimateNow.sequence.gohome = true;
          }
          const currentVideo = AnimateNow.sequence.getCurrentVideo();

          if (currentVideo) {
            if (currentVideo.playing) {
              canvasBgCtx.drawImage(
                currentVideo.dom,
                0,
                0,
                canvas.width,
                900,
                0,
                0,
                canvas.width,
                900
              );
              if (currentVideo.faceFrame) {
                bitmap_Alpha(currentVideo.faceFrame);
              }
            }

            if (typeof currentVideo.nextVideoKey !== "undefined") {
              delete AnimateNow.sequence;
              sequenceStartKey = currentVideo.nextVideoKey;
            }
          }
        }
        if (!AnimateNow.sequence) {
          if (sequence_box_order[0] && sequence_box_order[0].isReady()) {
            console.log("speak sequence is ready !!", sequence_box_order.length);
            AnimateNow.sequence = sequence_box_order.shift();
            if (AnimateNow.sequence.isIdleGst &&
              sequence_box_order[0] &&
              sequence_box_order[0].speak) {
              prt_start_time.vars.idleGstTime = new Date();
              console.log("!!!!!!!!!! idleGstTime adjust");
            }
            if (prt_start_time.vars.idleGstTime && AnimateNow.sequence.speak)
              prt_start_time.vars.idleGstTimeEnd = new Date();
          } else {
            AnimateNow.sequence = new Sequence({
              startVideoKey: sequenceStartKey,
            });
          }
        }

        if (sequence_box_order[0] && sequence_box_order[0].speak) {
          sequence_box_order[0].speak.check_isReady();
        }

        animationId = requestAnimationFrame(AnimateNow);
      }

      function bitmap_Alpha(bitmap, gst) {
        function isCloth({ h, s, v }) {
          return (
            (200 < h && h < 260 && v < 50 && 70 < s) ||
            (160 < h && h < 260 && 70 < s)
          );
        }

        // ctx.clearRect(0, 0, canvas2_size_x, canvas2_size_y);
        canvasFaceCtx.fillStyle = "rgba(0, 0, 0, 0)";
        canvasFaceCtx.drawImage(
          bitmap,
          currentAI.faceX,
          currentAI.faceY,
          currentAI.faceWidth,
          currentAI.faceHeight
        );
        // console.log("cAI 3", {canvas2_size_x, canvas2_size_y, ai_model_scale, ai_center_location_x, ai_center_location_y})
        const frame = canvasFaceCtx.getImageData(
          currentAI.faceX,
          currentAI.faceY,
          currentAI.faceWidth,
          currentAI.faceHeight
        );

        const canvasWidth = currentAI.faceWidth;
        const canvasHeight = currentAI.faceHeight;

        let width = 4 * canvasWidth;
        for (let y = 0; y < canvasHeight; y++) {
          let height = width * y;
          // fade left, right
          for (let i = 0; i < op_step; i++) {
            frame.data[width - i * 4 + 3 + height] = (255 / op_step) * i;
            frame.data[i * 4 + 3 + height] = (255 / op_step) * i;
          }

          // fade top
          if (y < op_step) {
            let fade_cross_adjust = y * 4;
            for (let x = 0 + fade_cross_adjust; x < width - fade_cross_adjust; x += 4) {
              frame.data[x + 3 + height] = (255 / op_step) * y;
            }
          }

          // fade bottom
          if (y > canvasHeight - op_step) {
            let fade_cross_adjust = (canvasHeight - y) * 4;
            let al = y - (canvasHeight - op_step);
            for (let x = fade_cross_adjust; x < width - fade_cross_adjust; x += 4) {
              frame.data[x + 3 + height] = (255 / op_step) * (op_step - al);
            }
          }
          // left
          let cnt = 0;
          let cnt_limit = 3;

          if (y > canvasHeight - 200) {
            cnt_limit = 40;
          }
          let hue_min = currentAI.hue_min;
          if (currentAI.ai_name === "leejungsub") {
            hue_min = currentAI.hue_min - y / 20;
          }

          for (let x = 0; x < width / 3; x += 4) {
            if (cnt > cnt_limit) break;
            let r = frame.data[x + height];
            let g = frame.data[x + 1 + height];
            let b = frame.data[x + 2 + height];

            let hsv = rgb_to_hsv(r, g, b);
            if (hsv.h > hue_min && hsv.h < currentAI.hue_max) {
              frame.data[x + 3 + height] = 0;
              cnt = 0;
            } else if (isCloth(hsv)) {
              frame.data[x + 3 + height] = 0;
              cnt = 0;
            }
            cnt += 1;
          }
          // right
          cnt = 0;
          for (let x = width - 4; x > (width * 2) / 3; x -= 4) {
            if (cnt > cnt_limit) break;
            let r = frame.data[x + height];
            let g = frame.data[x + 1 + height];
            let b = frame.data[x + 2 + height];
            let hsv = rgb_to_hsv(r, g, b);
            if (hsv.h > hue_min && hsv.h < currentAI.hue_max) {
              frame.data[x + 3 + height] = 0;
              cnt = 0;
            } else if (isCloth(hsv)) {
              frame.data[x + 3 + height] = 0;
              cnt = 0;
            }
            cnt += 1;
          }
        }

        canvasFaceCtx.putImageData(frame, currentAI.faceX, currentAI.faceY);
      }

      this.init = async function (req) {
        forceStop = false;
        latestUserTextChanged = new Date();
        audioCtx = req.AudioContext;
        if (!audioCtx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioContext();
        }

        currentAI = AIs[req.ai_name];
        videoBox = AIs[req.ai_name].video_map;

        // if (isMobile) {
        //   for (const key in videoBox) {
        //     const video = videoBox[key];
        //     video.src = video.src
        //       .replace("/v6/", "/v6_crop/")
        //       .replace(".mp4", "_crop.mp4");
        //   }
        //   fpsInterval = 1000 / 20;
        //   currentAI.faceX = currentAI.faceX - 224;
        //   canvas.width = "502";
        //   canvas2.width = "502";
        //   $(".canvas_wrapper").css({ marginLeft: 0, left: 0 });
        // }

        function video_load(key) {
          const video = videoBox[key];
          video.dom = document.createElement("video");

          // for iOS
          video.dom.controls = false;
          video.dom.style.display = "none";
          video.dom.src = video.src;
          video.dom.autoplay = false;
          video.dom.setAttribute("webkit-playsinline", "webkit-playsinline");
          video.dom.setAttribute("playsinline", "playsinline");
          video.dom.load();
          testCount++;

          return new Promise((resolve, reject) => {
            function playReady() {
              console.log("canplaythrough", key);
              video.dom.currentTime = 0;
              video.isReady = true;
              video.dom.removeEventListener("canplaythrough", playReady);
              testCount2++;
              return resolve();
            }
            video.dom.addEventListener("canplaythrough", playReady);
          });
        }
        let loading_count = 0;
        let videoBox_legnth = Object.keys(videoBox).length;
        await video_load("idle");
        await video_load("backmotion");
        for (const key in videoBox) {
          // console.log("loading_count/videoBox.length", loading_count, videoBox_legnth);
          video_load(key);
          loading_count++;

          if (videoBox_legnth === loading_count) {
            console.log("video_load end =================");
            isInitComplete = true;
            that.onAIPlayerStateChanged("playerLoadComplete");
          } else {
            that.onAIPlayerLoadingProgressed({
              loading: Math.floor(loading_count),
            });
          }
        }
        then = Date.now();
        animationId = requestAnimationFrame(AnimateNow);
        if (isIOS) {
          window.addEventListener("scroll", preventMotion, false);
          window.addEventListener("touchmove", preventMotion, false);

          let scroll_point = 0;
          function preventMotion(event) {
            event.preventDefault();
            event.stopPropagation();
            window.scrollTo(0, scroll_point);
          }

          // jq_usertext.on("focus", () => {
          //   $("#start_time").hide();
          //   socket_check();
          //   $("#gst_sel_box_wrapper").hide();
          //   scroll_point = 280;
          //   $(".canvas_wrapper").css("opacity", 0);
          //   $(".canvas_wrapper")[0].style.top = "250px";

          //   setTimeout(() => {
          //     $(".canvas_wrapper").animate(
          //       {
          //         opacity: 1,
          //       },
          //       150
          //     );
          //   }, 150);

          //   https: latestUserTextChanged = new Date();
          // });
          // jq_usertext.on("blur", () => {
          //   socket_check();
          //   $(".canvas_wrapper").css("opacity", 0);
          //   $(".canvas_wrapper")[0].style.top = 0;
          //   $("#ui")[0].style.bottom = 0;
          //   setTimeout(() => {
          //     $(".canvas_wrapper").animate(
          //       {
          //         opacity: 1,
          //       },
          //       150
          //     );
          //   }, 150);

          //   latestUserTextChanged = new Date();
          // });
        }
      };

      let _speak_finish_time = 0;
      let _speak_start_time = 0;
      class Sequence {
        constructor({ startVideoKey, isIdleGst }) {
          console.log("====== new sequence ======= : ", startVideoKey);
          this.currentVideoKey = startVideoKey;
          this.videoList = [videoBox[this.currentVideoKey]];
          this.paused_duration = 0;
          this.previousFrameIdx = 0;
          this.speakPreviousFrameIdx = 0;
          this.time_start = new Date();
          this.video_start = new Date();
          this.isIdleGst = isIdleGst;
        }

        stopVideo(currentVideo) {
          // console.log("video stop 1", currentVideo.dom.src);
          currentVideo.dom.pause();
          currentVideo.playing = false;
          currentVideo.dom.currentTime = 0;
          delete currentVideo.faceFrame;
          // animationId = requestAnimationFrame(AnimateNow);
          console.log("video stop 2");
          // delete AnimateNow;
        }

        getCurrentVideo(options) {
          const currentVideo = this.videoList[0];          
          if (currentVideo.isReady) {
            if (!currentVideo.playing) {
              // console.log("speak start >>>>>>>>>>>>>>>>>>> : ", testCount, testCount2);
              currentVideo.playing = true;
              currentVideo.dom.play();
              // console.log("video play 1 ", currentVideo.dom.src);
              this.video_start = new Date();
              this.video_start2 = this.video_start;
              if (options && options.adjust_video_start) {
                this.video_start2 = this.video_start.getTime() - options.adjust_video_start * 1000;
                // console.log("options.adjust_video_start",options.adjust_video_start,this.video_start2);
              }

              let audio = {};
              if (this.speak && !this.speak.played) {
                isPlaying = true;
                that.onAIPlayerStateChanged("speakingStarted");
                if (AISpeakStart) {
                  //console.log("total_duration : ", this.speak.total_duration, this.speak.subtitle);
                  AISpeakStart({
                    subtitle: this.speak.subtitle,
                    // duration: sequence_box_order[0].speak.total_duration / fpsInterval
                    duration: 20
                  });
                }

                audio = this.speak.getNextAudio();
                audio.gain.gain.value = 1;

                prt_start_time.vars.speak = this.speak;
                prt_start_time.vars.time_start = this.time_start;
                prt_start_time.vars.speakStartTime = new Date();
                prt_start_time(true);

                this.speak_start_time = audioCtx.currentTime;
                _speak_start_time = audioCtx.currentTime;
                // Leo Kim이 알려준 종료 타임 계산 (해당 방법으로 중복 발하 이슈 해결 하지 못함)
                // this.speak_finish_time = this.speak_start_time + this.speak.total_duration / fpsInterval
                audio.source.start(this.speak_start_time);
                audioCtxPlayedTime = this.speak_start_time;
                this.speak.played = true;
              }
            } else if (currentVideo.dom.paused &&
              currentVideo.dom.currentTime < 3 &&
              audioCtx.state === "running") {
              currentVideo.dom.play();
            }
            let time_gap2 = (new Date() - this.paused_duration - this.video_start2) / 1000;
            if (this.speak) {
              time_gap2 = audioCtx.currentTime - this.speak_start_time - this.speakPreviousFrameIdx * time_to_frame;
            }

            const video_frame_diff = time_gap2 - currentVideo.dom.currentTime;
            const currentFrameIdx = currentVideo.dom.currentTime / time_to_frame;

            // 프레임 보정을 해주는 역할. (백엔드 서버에서 처리를 해준다고 하지만 우선 제거 하지 않음)
            if (video_frame_diff > 0.05) {
              currentVideo.dom.playbackRate = 1.4;
            } else if (video_frame_diff > 0.03) {
              currentVideo.dom.playbackRate = 1.2;
            } else if (video_frame_diff > 0.015) {
              currentVideo.dom.playbackRate = 1.1;
            } else if (video_frame_diff < -0.05) {
              currentVideo.dom.playbackRate = 0.7;
            } else if (video_frame_diff < -0.015) {
              currentVideo.dom.playbackRate = 0.9;
            } else {
              currentVideo.dom.playbackRate = 1;
            }

            const faceFrameIdx = Math.floor(
              this.previousFrameIdx + currentFrameIdx
            );

            let current_audio;
            if (this.speak) {
              current_audio = this.speak.getCurrentAudio();
              if (current_audio) {
                const current_audio_time = audioCtx.currentTime - audioCtxPlayedTime;
                let source_duration = current_audio.source.buffer.duration;
                if (current_audio &&
                  current_audio_time > source_duration - 0.5
                ) {
                  const audio = this.speak.getNextAudio();
                  if (audio) {
                    latestUserTextChanged = new Date();
                    const diff = source_duration - current_audio_time;
                    let transition = 0.402 - 0.066;
                    if (!this.speak.didFirstAudio) {
                      this.speak.didFirstAudio = true;
                      transition = 0.402;
                    }
                    let start_time = source_duration + audioCtxPlayedTime - transition;
                    audio.source.start(start_time);
                    audioCtxPlayedTime = start_time;
                  }
                } else if (current_audio && current_audio_time < 0.5) {
                  this.speak.fadeAudio();
                }
              }

              console.log("this.speak.total_duration", this.speak.total_duration)
              if (this.speak.total_duration && this.speak.total_duration / fpsInterval + this.speak_start_time + 0.5 < audioCtx.currentTime) {
                current_audio = null
              }
            }

            if (!current_audio && !this.did_speak_ui_to_ready && isPlaying) {
              this.did_speak_ui_to_ready = true;
              isPlaying = false;
              if (AISpeakEnd) AISpeakEnd(AnimateNow.current_speak ? true : false);
            }

            const set_frame = (parseInt(currentFrameIdx / 8) * 8 + 1) * time_to_frame;
            if (currentVideo.isIdle && !current_audio && videoBox.backmotion.dom.currentTime.toFixed(3) !== set_frame.toFixed(3)) {
              videoBox.backmotion.dom.currentTime = set_frame;
              if (this.gohome) videoBox.backmotion.dom.play();
            }

            if (this.gohome && !current_audio && currentVideo.isIdle && !this.conversionFrame && currentFrameIdx < 328) {
              if (!this.speak || !this.speak.images[faceFrameIdx]) {
                this.conversionFrame = parseInt(currentFrameIdx / 8) * 8 + 1;
                this.conversionVideo = videoBox.backmotion;
                this.conversionVideo.dom.currentTime = this.conversionFrame * (1 / 29.97);
                this.conversionVideo.go_back_frame = this.conversionFrame + 7;
              }
            }

            if (this.conversionFrame && this.conversionFrame < currentFrameIdx) {
              delete this.conversionFrame;
              this.stopVideo(currentVideo);
              this.videoList.push(this.conversionVideo);
              this.videoList.shift();
              return this.getCurrentVideo();
            }

            // for speak continue next video prepare
            if (!this.gohome && currentVideo.link_frame - 2 < currentFrameIdx) {
              const nextVideo = videoBox[currentVideo.link_next_key];
              nextVideo.dom.play();
            }

            // 대기 중에 램덤으로 제스쳐 처리 부분.
            if (currentFrameIdx > idleGstTriggerIdx &&
              !this.speak &&
              currentVideo.isIdle &&
              !this.triggeredIdleGst &&
              // !jq_usertext.is(":focus") &&
              new Date() - latestUserTextChanged > 1000 * 10 &&
              sequence_box_order.length === 0) {
              this.triggeredIdleGst = true;
              idleGstTriggerIdx = 100;

              const gst_list = ["hair_care", "fighting", "clothe_care", "hand_care"];
              let gst = gst_list[previousIdleGstIndex++];
              if (previousIdleGstIndex > 3) previousIdleGstIndex = 0;
              sequence_box_order.push(new Sequence({ startVideoKey: gst, isIdleGst: true }));
            }
            
            // this.gohome 
            if (!this.gohome && currentVideo.link_frame - 1 < currentFrameIdx) {
            // if (currentVideo.link_frame - 1 < currentFrameIdx) { // 발하 중복 관련 해결 부분.
              if (this.speak) {
                if (faceFrameIdx < this.speak.duration) {
                  this.stopVideo(currentVideo);
                  const nextVideo = videoBox[currentVideo.link_next_key];
                  this.videoList.push(nextVideo);
                  this.videoList.shift();
                  this.previousFrameIdx += time_gap2 / time_to_frame;
                  this.speakPreviousFrameIdx += currentVideo.link_frame;

                  const adjust_video_start = (this.previousFrameIdx - this.speakPreviousFrameIdx) * time_to_frame;
                  return this.getCurrentVideo({ adjust_video_start });
                }
              }

              if (videoBox[currentVideo.link_next_key].isReady) {
                this.stopVideo(currentVideo);
                if (isPlaying && sequence_box_order.length === 0) {
                  console.log("speakingAllComplete1");
                  isPlaying = false;
                  that.onAIPlayerStateChanged("speakingAllComplete");
                  if (AISpeakEnd) AISpeakEnd(AnimateNow.current_speak ? true : false);
                }
                return { nextVideoKey: currentVideo.link_next_key };
              }
            }

            if (currentVideo.go_back_frame - 1 <= currentFrameIdx) {
              this.stopVideo(currentVideo);
              console.log("dummy value for next speak sequence", currentFrameIdx);
              return { nextVideoKey:currentAI.video_map_start_key };
            }

            if (this.speak) {
              currentVideo.faceFrame = this.speak.images[faceFrameIdx];
            }
            return currentVideo;
          }
        }

        isReady() {
          if (this.speak && this.speak.isReady) {
            return true;
          }
          if (!this.speak) {
            return true;
          }
        }

        stopSpeaking() {
          if (this.speak) {
            this.speak.stopped = true;
            this.speak.audio_box.forEach(element => {
              try {
                element.source.stop();
              } catch (error) { }
            });
            sequence_box_order = [];
            this.speak.audio_box = [];
            delete this.speak;
          }
        }
      }

      class Speak {
        constructor({ msg, emotion, subtitle, isBow, callback, gst, key, lang }) {
          this.subtitle = subtitle;
          console.log("total_duration 2:", subtitle);
          this.callback = callback;
          this.images = [];
          this.images_socket_raw = [];
          this.audio_box = [];
          this.audio = new Audio();
          this.codec = "mp3";
          this.duration = 0;

          this.msg_text = msg;
          this.isBow = isBow;
          this.size_audio = 0;
          this.size_video = 0;
          this.prev_audio_recv_time; // = new Date();
          this.prev_video_recv_timel; // = new Date();
          this.audio_count = 0;
          this.audio_key = key;
          this.getNextCount = 0;

          this.gst = gst;
          this.gst_title = videoBox[gst].title;

          if (currentAI.gst_map &&
            currentAI.gst_map[this.gst] &&
            currentAI.gst_map[this.gst].request_gst_name)
            this.gst = currentAI.gst_map[this.gst].request_gst_name;

          let custom_emotion = currentAI.emotion;
          if (currentAI.ai_name === "sny") {
            custom_emotion = this.gst;
          }

          this.debug_start_time = new Date();

          this.getCurrentAudio = function () {
            if (this.getNextCount > 0) {
              return this.audio_box[this.getNextCount - 1];
            } else {
              return this.audio_box[this.getNextCount];
            }
          };

          this.getPrevAudio = function () {
            const prevAudio = this.audio_box[this.getNextCount - 2];
            const currentAudio = this.audio_box[this.getNextCount - 1];
            if (prevAudio && currentAudio.audio.currentTime < 1) {
              return prevAudio;
            }
          };

          this.getNextAudio = function () {
            this.getNextCount = this.getNextCount || 0;
            const output = this.audio_box[this.getNextCount++];
            return output;
          };

          this.fadeAudio = function () {
            const prevAudio = this.audio_box[this.getNextCount - 2];
            const currentAudio = this.audio_box[this.getNextCount - 1];
            
            if (!prevAudio || !currentAudio || prevAudio.isFinished) return;
            
            const time = audioCtx.currentTime - audioCtxPlayedTime;
            let prevVolume = 1, currentVolume = 0;

            if (0.16 < time && time < 0.26) {
              prevVolume = 1 - (time - 0.16) * 10;
            } else if (time > 0.26) {
              prevVolume = 0;
            }

            if (0.14 < time && time < 0.24) {
              currentVolume = (time - 0.14) * 10;
            } else if (time > 0.24) {
              currentVolume = 1;
            }

            prevAudio.gain.gain.value = prevVolume;
            currentAudio.gain.gain.value = currentVolume;

            if (currentVolume === 1) {
              prevAudio.isFinished = true;
              // if (isPlaying && sequence_box_order.length === 0) {
              //   console.log("fadeAudio speakingAllComplete");
              //   isPlaying = false;
              //   that.onAIPlayerStateChanged("speakingAllComplete");
              //   if (AISpeakEnd) AISpeakEnd(AnimateNow.current_speak ? true : false);
              // }
              console.log("fadeAudio ===============");
            }
          };

          socket_check();
          console.log("serverEmitType : ", serverEmitType, currentAI.server_name);
          ai_socket.emit(serverEmitType, {
            text: this.msg_text,
            ai_name: currentAI.ai_name,
            version: currentAI.version,
            emotion: "base",
            audio_cut_start: currentAI.audio_cut_start || "0.4",
            audio_cut_end: currentAI.audio_cut_end || "0.5",
            gst: this.gst,
            // nocache: true,
            novalid: true,
            language: lang,
            key,
            ai_name_temp: currentAI.ai_name,
            server_name: currentAI.server_name,
          });
          return;
        }

        onImage(msg) {
          if (parseInt(msg.frame_number) === 1) this.prev_video_recv_time = new Date();
          this.images_socket_raw[msg.frame_number] = msg;
          this.setImage(msg);
          this.check_isReady();
        }

        setImage(msg) {
          this.size_video += msg.image.length;
          // this.video_kbs = msg.image.length / ((new Date() - this.prev_video_recv_time) / 1000);
          // this.prev_video_recv_time = new Date();
          if (msg.frame_number % 100 === 0 ||
            parseInt(msg.frame_number) === this.total_duration - 1) {
            prt_start_time(true);
          }

          var img = new Image();
          img.src = "data:image/jpeg;base64," + msg.image;
          // if (parseInt(msg.frame_number) === 1) console.log("image sample", img)
          if (this.images[msg.frame_number])
            console.log("onImage twice", msg.frame_number);
          this.images[msg.frame_number] = img;
          const frame_num = parseInt(msg.frame_number);
          if (frame_num > this.duration)
            this.duration = frame_num;
          if (this.duration === frame_num)
            this.end_video_recv_time = new Date();

          // console.log("this.duration", frame_num, this.duration);
          // this.images.push(img);
        }

        onAudio(msg) {
          this.prev_audio_recv_time = this.prev_audio_recv_time || new Date();
          this.audioBoxPush(msg);
          this.check_isReady();
          
          if (msg.last_idx) {
            this.total_duration = parseInt(msg.last_idx) + parseInt(msg.num_images) - 1;
            total_duration3 = this.total_duration;
            console.log("speak_finish_time1 : ", total_duration3);
            this.end_audio_recv_time = new Date();
          }
        }
        async audioBoxPush(msg) {
          if (msg.isCache) {
            this.isCache = true;
          }
          this.size_audio += msg.audio.length;

          const data = toArrayBuffer(base64DecToArr(msg.audio));
          const buffer = await audioCtx.decodeAudioData(data);

          const source = audioCtx.createBufferSource();
          const gain = audioCtx.createGain();
          source.buffer = buffer;
          source.connect(gain);
          gain.connect(audioCtx.destination);

          gain.gain.value = 0;

          this.audio_box.push({
            duration: parseInt(msg.num_images),
            audio_idx: this.audio_count,
            source,
            gain,
            key: msg.key,
          });
        }

        check_isReady() {
          if (this.isReady)
            return;

          if (this.audio_box[0]) {
            this.ready_audio = true;
          }

          let image_line = 10;
          if (this.audio_box[0] && this.audio_box[0].duration < image_line)
            image_line = this.audio_box[0].duration - 2;
          if (this.images.length > image_line) {
            this.ready_image = true;
          }

          if (this.ready_audio && this.ready_image) {
            this.isReady = true;
          }
        }
      }

      const prt_start_time = (forceUpdate) => {
        if (prt_start_time.vars.speakStartTime && !forceUpdate) return;
        if (!prt_start_time.vars.speak_start) return;

        if (prt_start_time.vars.idleGstTime) {
          let end_time = prt_start_time.vars.idleGstTimeEnd || new Date();
          prt_start_time.line.gst_prgoress = `대기 제스처 종료 ${((end_time - prt_start_time.vars.idleGstTime) / 1000).toFixed(1)}s`;

          if (prt_start_time.vars.idleGstTimeEnd) {
            prt_start_time.line.speak_progress = ((new Date() - prt_start_time.vars.idleGstTimeEnd) / 1000).toFixed(1);
          }
        } else {
          const masure_time = (new Date() - prt_start_time.vars.speak_start) / 1000;
          if (masure_time > 10 && !prt_start_time.vars.speak) {
            forceStop = true;
            cancelAnimationFrame(animationId);
            window.alert("합성에 문제가 발생하였습니다. 재시작 합니다.");
            window.location.reload();
          }
          prt_start_time.line.speak_progress = masure_time.toFixed(1);
        }

        if (prt_start_time.vars.speak) {
          const { speak, time_start } = prt_start_time.vars;
          const start_time = prt_start_time.vars.speakStartTime - (prt_start_time.vars.idleGstTimeEnd || time_start);
          // const speak_data_type = speak.isCache ? "Cache " : "Real time ";
          const speak_data_type = speak.isCache ? "캐시 합성 " : "실시간 합성 ";
          console.log("******************* speak_data_type : ", speak_data_type);
          prt_start_time.line.speak_progress = speak_data_type + (start_time / 1000).toFixed(1) + "s";

          prt_start_time.line.gst = "제스처 : " + speak.gst_title;

          const audio_size = parseInt(speak.size_audio / 1024);
          const video_size = parseInt(speak.size_video / 1024);

          let audio_kbs = speak.size_audio / (((speak.end_audio_recv_time || new Date()) - speak.prev_audio_recv_time) / 1000) / 1024;

          let video_kbs = speak.size_video / (((speak.end_video_recv_time || new Date()) - speak.prev_video_recv_time) / 1000) / 1024;

          if (audio_kbs > audio_size) audio_kbs = audio_size;
          if (video_kbs > video_size) video_kbs = video_size;

          // console.log("kbs", audio_kbs, video_kbs)
          prt_start_time.line.audio_size = `Audio size ${audio_size}KB (${parseInt(audio_kbs)}KB/s)`; // (${parseInt(speak.audio_kbs/1024)}KB/s)
          prt_start_time.line.video_size = `Video size ${video_size}KB (${parseInt(video_kbs)}KB/s)`;
        }

        let output = [];

        if (prt_start_time.line.gst_prgoress) output.push(prt_start_time.line.gst_prgoress);
        if (prt_start_time.line.speak_progress) output.push(prt_start_time.line.speak_progress);
        if (prt_start_time.line.gst) output.push(prt_start_time.line.gst);
        if (prt_start_time.line.audio_size) output.push(prt_start_time.line.audio_size);
        if (prt_start_time.line.video_size) output.push(prt_start_time.line.video_size);
      };

      prt_start_time.line = {};
      prt_start_time.vars = {};

      const send = function (msg_object) {
        let { emotion, subtitles, texts, isBow, gst, lang } = msg_object;

        //언어 관련 정리 되기전까지 임시 코딩. 0817
        lang = (projectInfoLanguage === "") ? lang : projectInfoLanguage;
        if(!subtitles) subtitles = texts;
        console.log("sendPrams : ", subtitles, texts, lang);
        sumTime = 0;
        startDate = null;
        total_duration2 = [];
        total_duration3 = 0;
        nextAudio = [];
        prt_start_time.line = {};
        prt_start_time.vars = { speak_start: new Date() };

        for (let [idx, msg] of texts.entries()) {
          msg = msg.trim();
          if (msg === "") return;
          if (gst === "random") {
            let gst_random_list = [];
            for (const key in videoBox) {
              if (key === "idle") continue;
              if (key === "backmotion") continue;

              const video_len = videoBox[key].go_back_frame;
              if (video_len < msg.length * 5) gst_random_list.push({ key, len: video_len });
            }

            gst_random_list = gst_random_list.sort((a, b) => a.len < b.len ? 1 : -1);

            if (gst_random_list.length > 7) gst_random_list = gst_random_list.slice(0, 7);
            if (gst_random_list.length > 0) {
              gst = gst_random_list[Math.floor(Math.random() * gst_random_list.length)].key;
            } else {
              gst = "idle";
            }
          }

          if (lang === "ko") {
            msg = msg.replace("AI", "에이아이").replace(" ai", " 에이아이");
            msg = msg
              .replace("24시", "이십사시")
              .replace("23시", "이십삼시")
              .replace("22시", "이십이시")
              .replace("21시", "이십일시")
              .replace("20시", "이십시")
              .replace("19시", "십구시")
              .replace("18시", "십팔시")
              .replace("17시", "십칠시")
              .replace("16시", "십육시")
              .replace("15시", "십오시")
              .replace("14시", "십사시")
              .replace("13시", "십삼시")
              .replace("12시", "열두시")
              .replace(/ 0\.([0-9])/g, "영쩜$1")
              .replace(/([0-9]+\s*)p\s/gi, "$1페이지 ")
              .replace(/([0-9]+\s*)hpa/gi, "$1헥토파스칼")
              .replace(/([0-9]+\s*)ha/gi, "$1헥타르")
              .replace(/([0-9]+\s*)\$/gi, "$1달러")
              .replace(/([0-9]+\s*)¥/gi, "$1엔")
              .replace(/([0-9]+\s*)€/gi, "$1유로")
              .replace(/([0-9]+\s*)m\/s/gi, "초속$1미터")
              .replace(/([0-9]+\s*)km\/h/gi, "시속$1키로미터")
              .replace(/([0-9]+\s*)㎡/gi, "$1제곱미터")
              .replace(/([0-9]+\s*)mm/gi, "$1미리미터")
              .replace(/([0-9]+\s*)㎜/gi, "$1미리미터")
              .replace(/([0-9]+\s*)m2/gi, "$1제곱미터")
              .replace(/([0-9]+\s*)cm/gi, "$1센치미터")
              .replace(/([0-9]+\s*)kg/gi, "$1키로그램")
              .replace(/([0-9]+\s*)‰/gi, "$1퍼밀")
              .replace(/([0-9]+\s*)m/gi, "$1미터");
          }

          if (lang === "en") {
            msg = msg
              .replace(/\s*(20)([0-9][0-9])\s*/gi, " two thousand $2 ")
              .replace(/\s*([12][0-9])([0-9][0-9])\s*/gi, " $1 $2 ");
          }

          msg = msg.replace(/[{(]([^)}])+[)}]/g, "");

          const key = currentAI.ai_name + (emotion || currentAI.emotion) + new Date().getTime() + msg + gst + lang;
          console.log("sequence.speak key : ", key);
          console.log("sequence.speak subtitles : ", subtitles[idx]);
          nextAudio.push(key);
          const speak = new Speak({
            msg,
            emotion,
            subtitle: subtitles[idx],
            isBow,
            gst,
            key,
            lang,
          });

          if (AnimateNow.sequence.isIdleGst) prt_start_time.vars.idleGstTime = new Date();
          const sequence = new Sequence({ startVideoKey: gst });
          sequence.speak = speak;

          sequence_box_order.push(sequence);
          sequence_box_by_msg[key] = sequence;
          emotion = null;
        }
        // idleGstTriggerIdx = 10;
      };

      this.send = send;

      this.msg_send = function (text, subTitle, gesture, language) {
        this.send({ texts: text, subtitles: subTitle ,gst: gesture, lang:language });
      };

      this.setIdleGst = function (gst) {
        sequence_box_order.push(
          new Sequence({ startVideoKey: gst || "hair_care" })
        );
      };

      // ailve_mov_sh4에서 추가한 정보.
      this.stopSpeak = function () {
        if (AnimateNow.sequence)
          AnimateNow.sequence.stopSpeaking();
        sequence_box_order = [];
      };

      var isWebAudioUnlocked = false;
      var isHTMLAudioUnlocked = false;

      function socket_check() {
        if (!ai_socket.connected) {
          ai_socket.connect();
        }
      }

      function unlock() {
        latestUserTextChanged = new Date();
        // $("#debug_info1").html(
        //   `isWebAudioUnlocked : ${isWebAudioUnlocked} / isHTMLAudioUnlocked : ${isWebAudioUnlocked}`
        // );
        if (isWebAudioUnlocked && isHTMLAudioUnlocked)
          return;
        if (!audioCtx)
          return;
        const myContext = audioCtx;

        // Unlock WebAudio - create short silent buffer and play it
        // This will allow us to play web audio at any time in the app
        var buffer = myContext.createBuffer(1, 1, 22050); // 1/10th of a second of silence
        var source = myContext.createBufferSource();
        source.buffer = buffer;
        source.connect(myContext.destination);
        source.onended = function () {
          // console.log("WebAudio unlocked!");
          isWebAudioUnlocked = true;
          if (isWebAudioUnlocked && isHTMLAudioUnlocked) {
            // console.log("WebAudio unlocked and playable w/ mute toggled on!");
            window.removeEventListener("mousedown", unlock);
          }
        };
        source.start();

        // Unlock HTML5 Audio - load a data url of short silence and play it
        // This will allow us to play web audio when the mute toggle is on
        var silenceDataURL = "data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
        var tag = document.createElement("audio");
        tag.controls = false;
        tag.preload = "auto";
        tag.loop = false;
        tag.src = silenceDataURL;
        tag.onended = function () {
          // console.log("HTMLAudio unlocked!");
          isHTMLAudioUnlocked = true;
          if (isWebAudioUnlocked && isHTMLAudioUnlocked) {
            // console.log("WebAudio unlocked and playable w/ mute toggled on!");
            window.removeEventListener("mousedown", unlock);
          }
        };

        console.log("peng test play");

        var p = tag.play();
        if (p)
          p.then(
            function () {
              console.log("play success");
            },
            function (reason) {
              console.log("play failed", reason);
            }
          );
      }

      window.addEventListener("click", unlock);

      let latest_paused_time;
      this.pause = function () {
        forceStop = true;
        if (AnimateNow.sequence.videoList[0])
          AnimateNow.sequence.videoList[0].dom.pause();
        if (AnimateNow.sequence.speak) {
          audioCtx.suspend();
        }
        latest_paused_time = new Date();
      };

      this.resume = function () {
        forceStop = false;
        AnimateNow.sequence.paused_duration += new Date() - latest_paused_time;
        if (AnimateNow.sequence.videoList[0])
          AnimateNow.sequence.videoList[0].dom.play();
        if (AnimateNow.sequence.speak) {
          audioCtx.resume();
        }
        animationId = requestAnimationFrame(AnimateNow);
      };

      this.resetAIMovLive = async function (status) {
        forceStop = status;
      };
    }
  }

  function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return ab;
  }
  function b64ToUint6(nChr) {
    return nChr > 64 && nChr < 91
        ? nChr - 65
        : nChr > 96 && nChr < 123
        ? nChr - 71
        : nChr > 47 && nChr < 58
        ? nChr + 4
        : nChr === 43
        ? 62
        : nChr === 47
        ? 63
        : 0;
  }

  function base64DecToArr(sBase64, nBlocksSize) {
    var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
      nInLen = sB64Enc.length,
      nOutLen = nBlocksSize ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize : (nInLen * 3 + 1) >> 2,
      taBytes = new Uint8Array(nOutLen);

    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3;
      nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4));
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
          taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
        }
        nUint24 = 0;
      }
    }

    return taBytes;
  }

// const percentRoundFn = (num) => Math.round(num * 100) / 100;
  function rgb_to_hsv(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);

    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: percentRoundFn(s * 100),
      v: percentRoundFn(v * 100),
    };
  }

  // function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
  //   ctx.beginPath();
  //   ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  //   if (fill) {
  //     ctx.fillStyle = fill;
  //     ctx.fill();
  //   }
  //   if (stroke) {
  //     ctx.lineWidth = strokeWidth;
  //     ctx.strokeStyle = stroke;
  //     ctx.stroke();
  //   }
  // }

  function deviceDetect() {
    let userAgent = navigator.userAgent;
    let browser;

    if (userAgent.match(/chrome|chromium|crios/i)) {
      browser = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browser = "firefox";
    } else if (userAgent.match(/safari/i)) {
      browser = "safari";
    } else if (userAgent.match(/opr\//i)) {
      browser = "opera";
    } else if (userAgent.match(/edg/i)) {
      browser = "edge";
    } else if (userAgent.match(/iPhone/i)) {
      browser = "safari";
    } else if (userAgent.match(/iPad/i)) {
      browser = "safari";
    } else {
      browser = userAgent;
    }

    var isMobile = false; //initiate as false
    let isIOS = false;

    // device detection
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
      )
    ) {
      isMobile = true;
    }

    if (browser === "safari" && isMobile) isIOS = true;

    // alert("isMobile "+isMobile)

    return { browser, isMobile, isIOS };

    // document.querySelector("h1").innerText = "You are using " + browserName + " browser";
  }
};

try {
  module.exports = AIPlayer;
} catch (error) { }