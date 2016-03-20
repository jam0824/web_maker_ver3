/* global PRELOAD_MAX */
enchant();

var game;
var msg_wnd;
var main_screen;
var sub_screen;
var debug_wnd;

var VERSION            = "ver1.0";	//バージョン情報
var DEBUG_MODE         = false;		//デバッグモード
var read_flag          = new Array();	//Read flags
var preload_flag       = false;		//画像ロード中にロード発生で失敗するのでロックをかける
var preload_turn_num   = 0;		//先行画像ロードの順番

var click_flag         = true;		//Click control
var timer_cnt          = 0;		//Use wait command

var data               = new Array();
var sel_wnd            = new Array();
var dataSet            = new Array();  //BG,Char,SEのURL、ロードフラグ保持用
var backLog            = "";           //バックログ保管用

var env                = enchant.ENV.BROWSER;
var audio              = null;         //iOS用audio
var isAudioLoadStart   = false;        //trueになったらタッチイベントでBGMロード

//保存に使う変数群
var game_status = {
    event_flag    : 0,
    char_left     : "",
    char_center   : "",
    char_right    : "",
    bg            : "",
    bgm           : "",
    sound_mode    : true,
    effect_mode   : true,
    skip_mode     : false,
    user_var      : new Array(),
    bgm_volume    : 0.5,
    se_volume     : 0.5
};

/////////////////////////////////////////////////////
//initiation
window.onload = function () {
   
    enchant.Sound.enabledInMobileSafari = true;
    game = new Core(GAME_WIDTH, GAME_HEIGHT);
    game.fps = DEFAULT_FPS;
    game.touched = false;
    
    //Load and fix scenario data
    data = dataLoad();

    //Initiate Read flags
    for (var i = 0; i < data.length; i++) {
        read_flag[i] = 0;
    }
    //Initiate user varibles
    for (var i = 0; i < USER_VAR_MAX; i++) {
        game_status['user_var'][i] = 0;
    }
   

    game.preload(
            SYS_DATA_PATH + 'msg_wnd.png',
            SYS_DATA_PATH + 'select_wnd.png',
            SYS_DATA_PATH + 'setting.png',
            SYS_DATA_PATH + 'load.png',
            SYS_DATA_PATH + 'save.png',
            SYS_DATA_PATH + 'backlog.png',
            SYS_DATA_PATH + 'sound_on.png',
            SYS_DATA_PATH + 'sound_off.png',
            SYS_DATA_PATH + 'effect_on.png',
            SYS_DATA_PATH + 'effect_off.png',
            SYS_DATA_PATH + 'read_on.png',
            SYS_DATA_PATH + 'read_off.png',
            SYS_DATA_PATH + 'save_base.png',
            SYS_DATA_PATH + 'load_base.png',
            SYS_DATA_PATH + 'black.jpg'
    );
            
    dataSet = initDataSet();                 //データセットの初期化
    dataSet = dataUrlGet(data, dataSet);     //全体のＵＲＬ取得
    dataSet = initIsLoaded(dataSet);
    dataSet = initDataLoad(dataSet);	     //先行ロード
    loadOption();
    
    
    var box = document.getElementById("enchant-stage");

    //iOS音声用のタッチイベント
    box.addEventListener('touchstart', function (e) {
        if ((env == "mobilesafari") && (isAudioLoadStart)) {
            mobileeSafariBGMLoad(game_status['bgm']);
            isAudioLoadStart = false;
        }
    });
   
    game.onload = function () {
        main_screen = new MAINSCREEN();
        sub_screen = new SUBSCREEN(main_screen);
        msg_wnd = new MSGWINDOW();
        var setting_icon = new IMGBUTTON(0, 0, 80, 80,
                                         SYS_DATA_PATH + 'setting.png',
                                         'setting');
        game.rootScene.addEventListener(Event.TOUCH_START, function (e) {
        clickSelector();
            
        });
         
        //メインを登録
        game.rootScene.addEventListener('enterframe', main);
        clickSelector();
    };
    game.start();
    window.scrollTo(0,1);
    //option_load();
};


//////////////////////////////////////////////
//Game loop
function main() {
    //waitが設定されている場合
    if (timer_cnt > 0) {
        if (t_wait()) {
            clickSelector();
        }
    }
}

/////////////////////////////////////////////////クリックロック時は何もしない(クリック実態）
function clickSelector() {
    var repeat_flag = false;
    
    if (click_flag) {
        repeat_flag = mainEvent();
    }

    //if repeatFlag is true, continue this routine
    if (repeat_flag){
        clickSelector();
    }
    return;
}
////////////////////////////////////////////////////////////////////////////////
//メインのイベント処理
function mainEvent() {

    var repeat_flag = false;
    var str_tmp = transrateCommand(data[game_status['event_flag']]);
    var d_cmd = str_tmp.split(" ");		//スペース区切り

    switch (d_cmd[0]) {
        case "bg":
            var howTo = bgLoad(d_cmd, game, game_status, dataSet);
            //表示
            sub_screen.redraw(howTo);
            click_flag = false;
            break;
        case "title":
            titleLoad(d_cmd, game, game_status, dataSet);
            var titlebuff = new TITLESCREEN(d_cmd[BG_PATH]);
            click_flag = false;
            break;

        case "char":
            var howTo = charLoad(d_cmd, game, game_status, dataSet);
            //表示
            sub_screen.redraw(howTo);
            click_flag = false;
            break;

        case "rm":
            var howTo = charRm(d_cmd, game_status);
            sub_screen.redraw(howTo);
            break;

        case "music":
            bgmStart(d_cmd);
            repeat_flag = true;
            break;

        case "musicstop":
            bgmStop(d_cmd);
            repeat_flag = true;
            break;

        case "goto":
            var isOk = gotoCmd(d_cmd);
            if(isOk){
                loadPreload(game, data, dataSet, game_status['event_flag']);
            }
            repeat_flag = true;
            break;

        case "flagset":
            flagSet(d_cmd);
            repeat_flag = true;
            break;

        case "flagcal":
            flagCal(d_cmd);
            repeat_flag = true;
            break;

        case "if":
            ifCmd(d_cmd);
            repeat_flag = true;
            break;

        case "select":
            sel_wnd = selectItem(sel_wnd, data, game_status['event_flag']);
            game_status['skip_mode'] = false;	//スキップ一旦ストップ
            click_flag = false;
            break;

        case "wait":
           if(!checkInteger(d_cmd[TIME_NUM])){
               errorAlert("変数の値：" + d_cmd[TIME_NUM]
                + "\n設定する値が正しくありません。値は整数です。");
                repeat_flag = true;
           }
            waitTime(parseInt(d_cmd[TIME_NUM]));
            break;

        case "se":
            sePlay(d_cmd, game, game_status, dataSet);
            repeat_flag = true;
            break;
        case "shake":
            shake_init(d_cmd, "bg", sub_screen);
            click_flag = false;
            break;
        case "charshake":
            shake_init(d_cmd, "char", sub_screen);
            break;

        case "#":
            repeat_flag = true;
            break;

        case "//":
            repeat_flag = true;
            break;
            
        case "debug":
            DEBUG_MODE = true;
            debug_wnd = new DEBUGWINDOW();
            repeat_flag = true;
            break;

            //コマンドではないならメッセージ表示
        default:
            msg_wnd.text(data[game_status['event_flag']]);
            backLog += data[game_status['event_flag']] + "<br>";   //バックログ保管
            
            break;
    }



    if ((game_status['skip_mode']) && (read_flag[game_status['event_flag']] === 1)) {
        repeat_flag = true;
    }
    read_flag[game_status['event_flag']] = 1;			//既読フラグon

    game_status['event_flag']++;		//イベントフラグをインクリメント
    
    //先行ロード
    nextDataLoad(game, dataSet);

    return repeat_flag;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * データセット初期化
 * @param var dataSet データ配列
 * @return var 初期化された配列データ
 */
function initDataSet() {
    var dataSet         = new Array();
    dataSet['Url']       = new Array();
    dataSet['isLoaded']  = new Array();
    dataSet['currentNo'] = 0;
    
    return dataSet;
}
///////////////
/******************************************
 * 画像先行ロード
 * @param var dataSet データ配列
 * @return var 初期化された配列データ
 ******************************************/
function initDataLoad(dataSet) {
    var max;
    var array_tmp = new Array();
    
    //先行読み込み最大数決定
    var max = (dataSet['Url'].length > PRELOAD_MAX) ? PRELOAD_MAX : dataSet['Url'].length;
    for (var i = 0; i < max; i++) {
        array_tmp.push(dataSet['Url'][i]);
        dataSet['isLoaded'][i] = true;
    }
    dataSet['currentNo'] = max;

    //読み込む
    game.preload(array_tmp);
    game.onerror = function(){
      alert("画像、音の読み込みに失敗しました。\nファイルが存在するかご確認ください。");  
    };
    
    return dataSet;
}

////////////////////////////////////スクリプト内のＵＲＬ取得
/*
 * スクリプト内のロードするURL収集
 * @param var data スクリプトデータ
 * @param var dataSet URL保存先
 * @return var URL保存先
 */
function dataUrlGet(data, dataSet) {

    for (var i = 0; i < data.length; i++) {
        //Transrate
        var str_tmp = transrateCommand(data[i]);
        var d_cmd = str_tmp.split(" ");		//スペース区切り
        switch (d_cmd[0]) {
            case "bg":
                if(!checkLoadedUrl(dataSet['Url'], d_cmd[BG_PATH])){
                     dataSet['Url'].push(d_cmd[BG_PATH]);
                }
                break;

            case "title":
                if(!checkLoadedUrl(dataSet['Url'], d_cmd[BG_PATH])){
                    
                     dataSet['Url'].push(d_cmd[BG_PATH]);
                }
                break;

            case "char":
                if(!checkLoadedUrl(dataSet['Url'], d_cmd[CHAR_PATH])){
                    
                     dataSet['Url'].push(d_cmd[CHAR_PATH]);
                }
                break;
                
            case "se":
                if(!checkLoadedUrl(dataSet['Url'], d_cmd[SE_PATH])){
                   
                     dataSet['Url'].push(d_cmd[SE_PATH]);
                }
                break;
                
        }

    }
    return dataSet;
}


function initIsLoaded(dataSet){
    for(var i = 0; i < dataSet['Url'].length; i++){
        dataSet['isLoaded'][i] = false;
    }
    return dataSet;
}

////////////////////////////////////////////////////////
//該当URLが含まれているかチェック
function checkLoadedUrl(urlArray, targetUrl) {
    var isLoaded = false;
    for (var i = 0; i < urlArray.length; i++) {
        if (urlArray[i] === targetUrl) {
            isLoaded = true;
            break;
        }
    }
    return isLoaded;
}

///////////////////////////////////////////////
//Transrate Japanese Commands to English ones
function transrateCommand(command) {
    var array_tmp = command.split("、");
    var str_tmp = "";
    switch (array_tmp[0]) {
        case "■背景":
            str_tmp = "bg";
            break;

        case "■タイトル":
            str_tmp = "title";
            break;

        case "■キャラ":
            str_tmp = "char";
            break;

        case "■キャラ消し":
            str_tmp = "rm";
            break;

        case "■音楽":
            str_tmp = "music";
            break;

        case "■音楽ストップ":
            str_tmp = "musicstop";
            break;

        case "■ジャンプ":
            str_tmp = "goto";
            break;

        case "■フラグセット":
            str_tmp = "flagset";
            break;

        case "■フラグ計算":
            str_tmp = "flagcal";
            break;

        case "■もし":
            str_tmp = "if";
            break;

        case "■選択肢":
            str_tmp = "select";
            break;

        case "■ウェイト":
            str_tmp = "wait";
            break;

        case "■ＳＥ":
            str_tmp = "se";
            break;

        case "■シェイク":
            str_tmp = "shake";
            break;
        case "■キャラシェイク":
            str_tmp = "charshake";
            break;

        case "■＃":
            str_tmp = "#";
            break;
        case "＃":
            str_tmp = "#";
            break;
        case "■デバッグ":
            str_tmp = "debug";
            break;

        case "//":
            str_tmp = "//";
            break;
    }

    //もし置き換えが発生していたら変換
    if (str_tmp !== "") {
        command = command.replace(/、/g, " ");
        command = command.replace(array_tmp[0], str_tmp);
    }
    return command;
}

/******************
 * iOS用BGM読み込み
 * @param {type} bgmPath
 * @returns {undefined}
 */
function mobileeSafariBGMLoad(bgmPath) {
    audio = new Audio(bgmPath);
    audio.load();
    audio.volume = game_status['bgm_volume'];
    audio.addEventListener('canplaythrough', function () {
        audio.play();
    }, false);
    audio.addEventListener("ended", function () {
        audio.play();
    }, false);

}


function debugDataSet(){
    var s = "";
    for(var i = 0; i < dataSet['Url'].length; i++){
        s += dataSet['isLoaded'][i] + " : " + dataSet['Url'][i] + "\n";
    }
    alert(s);
}