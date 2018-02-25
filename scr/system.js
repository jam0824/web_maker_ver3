

/////////////////////////////////
//オプション画像のパスを取得する。
function getOptionPath(p_path, mode) {
    var path;
    switch (mode) {
        case "sound_mode":
            path = (game_status['sound_mode']) ?
                    'sound_on.png' : 'sound_off.png';
            break;
        case "effect_mode":
            path = (game_status['effect_mode']) ?
                    'effect_on.png' : 'effect_off.png';
            break;
        case "read_mode":
            path = (game_status['skip_mode']) ?
                    'read_on.png' : 'read_off.png';
            break;
        default:
            path = p_path;
            break;
    }

    path = SYS_DATA_PATH + path;
    return path;
}

/////////////////////////////////
//Replace charactors
function replaceCaractor(msg) {
    msg = msg.replace("】", "】<br>");
    msg = msg.replace(/＠/g, "<br>");
    return msg;
}

//////////////////////////////////ストーリーデータをｊｓで運用するときのコード
function dataLoad() {
    var data = file_data;	//シナリオデータ読み込み

    //データの余計な部分を削除
    //data.splice(0,2);
    for (var i = 0; i < data.length; i++) {
        data[i] = data[i].replace(/\r/g, "");	//改行削除
        data[i] = data[i].replace(/\n/g, "");
        //data[i] = exchangeStr(data[i]);

        if (data[i] == "") {
            data.splice(i, 1);	//空白行削除
            i--;				//文字も次も空白の場合に飛ばされるのを防ぐ
        }
    }

    return data;
}

/*****************************************
 * 現在位置から一番近い画像ロードの位置を取得
 * 戻り値はdetaSetの飛び先の直近未ロードの配列番号
 * @param {type} data
 * @param {type} dataSet
 * @param {type} currentLine
 * @returns {Number} dataSet内の直近の未ロードの配列番号
 */
function searchNearImgUrl(data, dataSet, currentLine) {
    var returnLine = 0;
    var pathNo = new Array();
    pathNo["bg"] = BG_PATH;
    pathNo["char"] = CHAR_PATH;
    pathNo["se"] = SE_PATH;
    for (var i = currentLine; i < data.length; i++) {
        var str_tmp = transrateCommand(data[i]);
        var d_cmd = str_tmp.split(" ");		//スペース区切り

        if ((d_cmd[0] === "bg") 
         || (d_cmd[0] === "char") 
         || (d_cmd[0] === "se")){
            
            for (var j = 0; j < dataSet['Url'].length; j++) {
                var path = pathNo[d_cmd[0]];
                if (dataSet['Url'][j] === d_cmd[path]) {
                    //もしその画像が読み込まれていないのならそれを返す
                    if (!dataSet['isLoaded'][j]) {
                        returnLine = j;
                        break;
                    }

                }
            }
            if (returnLine !== 0)
                break;
        }
    }
    return returnLine;
}

//////////////////////////////////////////////////////////音声モード変更
function switchingSound() {
    if (game_status['sound_mode']) {
        bgmStop(null);
        game_status['sound_mode'] = false;
    } else {
        game_status['sound_mode'] = true;
        var d_cmd = new Array("bgm", game_status['bgm']);
        bgmStart(d_cmd);
    }
    saveOption();
    return;
}

//////////////////////////////////////////////////////////エフェクトモード変更
function switchingEffect() {

    game_status['effect_mode'] = (game_status['effect_mode']) ? false : true;
    saveOption();
    return;
}
//////////////////////////////////////////////////////////既読モード変更
function switchingRead() {
    game_status['skip_mode'] = (game_status['skip_mode']) ? false : true;
    saveOption();
    return;
}


///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////
//オプションを表示
function displayOption() {
     click_flag = false;
     var modalBg = new MODALBG(GAME_WIDTH, GAME_HEIGHT);
     modalBg.option = makeOptionItem(modalBg);
}

/******************************************************************
 * オプションアイテムを作成する
 * @param {type} modalBg 親モーダル
 * @returns {Array|makeOptionItem.option_item}
 */
function makeOptionItem(modalBg) {
    var w = 200;
    var x = 95;
    var y = 50;
    var option_item = new Array();
    option_item['load'] = new OPTIONBUTTON(x, y, w, w, 'load.png', 'load', modalBg);
    option_item['save'] = new OPTIONBUTTON(x + w + 50, y, w, w, 'save.png', 'save', modalBg);
    option_item['backlog'] = new OPTIONBUTTON(x, y + w + 50, w, w, 'backlog.png', 'backlog', modalBg);
    option_item['sound'] = new OPTIONBUTTON(x + w + 50, y + w + 50, w, w, 'sound_on.png', 'sound_mode', modalBg);
    option_item['effect'] = new OPTIONBUTTON(x, y + (w + 50) * 2, w, w, 'effect_on.png', 'effect_mode', modalBg);
    option_item['read'] = new OPTIONBUTTON(x + w + 50, y + (w + 50) * 2, w, w, 'read_on.png', 'read_mode', modalBg);
    return option_item;
}

///////////////////////////////////////
/////////////////////////////////////
//セーブとロード領域を書き込む
function displaySaveArea(mode, modalBg) {
    var w = 200;
    var x = 95;
    var y = 50;
    var margin = 50;
    var save_item = new Array();
    var type = "";
    var path;

    if (mode === "save") {
        type = "save_wnd";
        path = 'save_base.png';
    } else if (mode === "load") {
        type = "load_wnd";
        path = 'load_base.png';
    }

    for (var i = 0; i < SAVE_MAX; i++) {
        var init_x = (i % 2 === 0) ? x : x + w + margin;
        var str_msg = makeSaveList(i, type);
        var save_name = "DATA " + i;
        save_item[i] = new SAVEWINDOW(init_x, y, w, w,
                                      path, type, str_msg, save_name, modalBg);

        //２段目の処理
        if (i % 2 === 1) {
            y += w + margin;
        }

    }

    return save_item;
}
/////////////////////////////////localに保存
function save(save_name, modalBg) {
    if (!confirm(save_name + "にセーブをします。よろしいですか？"))
        return;

    save_len_make(save_name);
    alert("ゲームのデータを保存しました。\n");
    modalBg.remove();   //親モーダルごと破棄

    return;
}
////////////////////////////////////////////////////////
//表示領域作成。type = save or load
function makeSaveList(no, type) {
    var str_tmp = "";
    var str_msg = "";
    str_tmp = "DATA " + no;

    try {
        var array_tmp = JSON.parse(localStorage.getItem(str_tmp));
    } catch (e) {
        storageError();
        return;
    }
    //str_msg += '<div onClick="' + type + '(\''+str_tmp+'\')">';
    if (array_tmp == null){
        str_msg += "なし";
    } else {
        str_msg += str_tmp + "<br>"
                + array_tmp['timestamp'] + "<br>"
                + array_tmp['msg'];
    }
    return str_msg;
}

///////////////////////////coockieに保存するときの文字列を作成
function save_len_make(save_name) {
  
    //オブジェクトを作り、JSON形式で保存
    var obj = {
        timestamp      : getDateString(),
        event_flag     : game_status['event_flag'] - 1,
        char_left      : game_status['char_left'],
        char_center    : game_status['char_center'],
        char_right     : game_status['char_right'],
        bg             : game_status['bg'],
        bgm            : game_status['bgm'],
        user_val       : game_status['user_var'].join(","),
        msg            : data[game_status['event_flag'] - 1].substr(0, 20) + "…", //そのときの読んでいる文章データを登録
        kidoku         : readMake()
    };

    localStorage.setItem(save_name, JSON.stringify(obj));
    return;
}

/*************************
 * 今の時刻を取得する
 * @returns {String}
 */
function getDateString(){
    var date_nowdate = new Date();				//日付取得
    var date_year = date_nowdate.getFullYear();
    var date_month = date_nowdate.getMonth() + 1;
    var date_date = date_nowdate.getDate();
    var date_hour = date_nowdate.getHours();
    var date_min = date_nowdate.getMinutes();
    
    return date_year + "/" + date_month + "/" + date_date + " "
            + date_hour + ":" + date_min;	//日付の文字列作成

}

/////////////////////////////////////既読フラグ保存時の文字列作成
function readMake() {
    var i;
    var start = 0;
    var end = 0;
    var start_f = read_flag[0];		//一番最初の行のフラグ
    var return_s = "";

    for (i = 0; i < data.length; i++) {

        if (start_f != read_flag[i]) {
            end = i - 1;	//フラグが変わる手前だから-1
            return_s += start + ":" + end + ":" + start_f + ",";

            start_f = read_flag[i];
            start = i;
        }
    }

    //最後の処理。最後のブロックはそのまま抜けるので描きこまれない。それを防ぐ
    end = i;	//フラグが変わる手前だから-1
    return_s += "" + start + ":" + end + ":" + start_f + ",";

    return return_s;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////ロード

function saveDataLoad(save_name, modalBg) {

    try {
        var s = JSON.parse(localStorage.getItem(save_name));
    } catch (e) {
        storageError();
        return;
    }

    if (s == null) {
        alert("保存されたセーブデータはありません。");
        return;
    }

    game_status['event_flag'] = parseInt(s['event_flag']);		//イベントフラグロード
    
    ////////////////////////////////////////////BGロード
    if (s['bg'] !== "") {
        game_status['bg'] = s['bg'];		//現在のURLを保持
    } else {
        game_status['bg'] = "";		//現在のURLを保持
    }

    /////////////////////////////////////人物ロード
    //左
    if (s['char_left'] !== "") {
        game_status['char_left'] = s['char_left'];
    } else {
        game_status['char_left'] = "";
    }

    //中央
    if (s['char_center'] !== "") {
        game_status['char_center'] = s['char_center'];
    } else {
        game_status['char_center'] = "";
    }

    //右
    if (s['char_right'] != "") {
        game_status['char_right'] = s['char_right'];
    } else {
        game_status['char_right'] = "";
    }

    ////////////////////////////////////////////BGMロード
    if (s['bgm'] !== "") {
        var d_cmd = new Array();
        d_cmd[BGM_PATH] = s['bgm'];
        bgmStart(d_cmd);
        game_status['bgm'] = s['bgm'];
    } else {
        game_status['bgm'] = "";
    }

 
    ////////////////////////////////////////////変数ロード
    var d = s['user_val'].split(",");	//データ切り分け
    for (var i = 0; i < USER_VAR_MAX; i++) {
        game_status['user_var'][i] = parseInt(d[i]);
    }
   
    kidoku_load(s['kidoku']);
    modalBg.remove();   //親モーダルごと破棄
    clickSelector();
    sub_screen.redraw("fade");
    return;
}
//////////////////////////////既読部分ロード
function kidoku_load(kidoku_str) {
    var section = new Array();
    var line_data = new Array();
    section = kidoku_str.split(",");

    for (var i = 0; i < section.length; i++) {
        line_data = section[i].split(":");
        for (var j = parseInt(line_data[0]); j <= parseInt(line_data[1]); j++) {
            read_flag[j] = parseInt(line_data[2]);
        }

    }

    return;
}

///////////////////////////////
//イベントフラグの次から途中先行ロード
function loadPreload(game, data, dataSet, flag) {
    var index = searchNearImgUrl(data, dataSet, flag);
    if(index !== 0){
        dataSet['currentNo'] = index;
    }

    nextDataLoad(game, dataSet);
}


/////////////////////////////////////////////////////////////////////////////////////////////
//オプションセーブ(ゲームステータスをそのまま保存)
function saveOption() {
    var save_name = "tj_option";
    localStorage.setItem(save_name, JSON.stringify(game_status));
}

/////////////////////////////////////////////////////////////////////////////////////////////
//オプションロード
function loadOption() {
    var save_name = "tj_option";
    try {
        var s = JSON.parse(localStorage.getItem(save_name));
        //データがなかったら戻る
        if (s == null)
            return;

        game_status['sound_mode'] = s['sound_mode'];
        game_status['effect_mode'] = s['effect_mode'];
        game_status['skip_mode'] = s['skip_mode'];
    } catch (e) {
        storageError();
    }


}
//////////////////////////////////////////////////////////////////////////
function storageError() {
    var str = "オプションロードに失敗しました。"
            + "IEの場合、インターネットオプション＞詳細設定＞セキュリティの「DOMストレージを有効にする」にチェックをお願い致します。"
            + "\nまたローカル環境ではIEは使用できませんのでChromeかFirefoxなどのブラウザをご使用ください。";
    alert(str);
    return;
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////バックログ出力
function drawBackLog(backLog) {

    document.getElementById("enchant-stage").style.display = "none";
    document.getElementById("OPTION").innerHTML = makeBackLogPage(backLog);
    document.getElementById("OPTION").style.left = "0px;";
    location.href = "index.html#latest";

    return;
}


////////////////////////////////////////////////////////////
//バックログ作成
function makeBackLogPage(backLog){
    var html = [
        '<header class="fontFrame">BackLog</header>',
        '<div class="BackLogMain">',
        backLog,
        '<a name="latest"></a>',
        '</div>',
        '<button onClick="vanishBackLog()">戻る</button>'
    ];
    
    return html.join("");
    
}

/////////////////////////////////////////////////////////
//バックログ削除
function vanishBackLog(){
    document.getElementById("OPTION").innerHTML = "";
    document.getElementById("enchant-stage").style.display = "inline";
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ブラウザ判別
function judge_browser() {
    if (navigator.userAgent.indexOf("MSIE") !== -1) { // 文字列に「MSIE」が含まれている場合
        browser_type = "IE";
    } else if (navigator.userAgent.indexOf("firefox") !== -1) { // 文字列に「Firefox」が含まれている場合
        browser_type = "FF";
    } else if (navigator.userAgent.indexOf("Chrome") !== -1) { // 文字列に「Netscape」が含まれている場合
        browser_type = "chrome";
    } else if (navigator.userAgent.indexOf("Safari") !== -1) { // 文字列に「Safari」が含まれている場合
        browser_type = "safari";
    } else {
        browser_type = "other";
    }

    return browser_type;
}