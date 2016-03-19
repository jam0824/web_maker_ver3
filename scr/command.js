


var c_save_char = ",";


////////////////////////////////////////////////////オプション

//////////////////////////////////////////////////////オプション決定

function option_save() {
    var bg_v = document.getElementById("bgm_vol").value;
    var se_v = document.getElementById("se_vol").value;

    game_status['bgm_volume'] = setVolume(bg_v);
    document.getElementById("bgm").volume = game_status['bgm_volume'];	//BGMのボリューム設定

    game_status['se_volume'] = setVolume(se_v);

    if (document.getElementById("kidoku_checkbox").checked) {
        skip_switch = 1;
        skip_mode = 1;
    } else {
        skip_switch = 0;
        skip_mode = 0;
    }

    var s = "" + bg_v + c_save_char + se_v + c_save_char + skip_switch;

    setCookie("option", s);	//クッキーを更新
    alert("設定を保存しました。");
    scrollbar_y = getScrollPosition();	//スクロールバーの位置を取得しておく
    footer_redraw();	//下のアイコンを描画
    returnCancel();		//オプションを消す
    return;
}
// option_saveのサブルーチン
function setVolume(volumeString) {
    if (volumeString.match(/^[0-9]+$/) != false) {	//数字か確認
        volumeString = parseInt(volumeString);
        if (volumeString > 10)
            volumeString = 10;
        volumeString = volumeString / 10;
    } else {
        volumeString = 0.5;
    }
    return volumeString;
}


///////////////////////////////////////////////選択肢選択モード
//選択肢
function selectItem(sel_wnd, data, lineNo) {
    var isOk = false;
    var x = 70;
    var y = 0;
    var originlineNo = lineNo;

    lineNo++;

    for (var i = 0; i < SEL_MAX + 1; i++) {
        var d_cmd = data[lineNo].split(" ");		//スペース区切り
        //、区切りだった場合
        if(d_cmd[1] == null){
            d_cmd = data[lineNo].split("、");		//、区切り
        }
        if ((d_cmd[SEL_MSG] === "selectend")
                || (d_cmd[SEL_MSG] === "■選択肢終わり")) {
            isOk = true;
            break;
        }
        y = (i * 80) + 50;
        sel_wnd[i] = new SELWINDOW(x, y, d_cmd[SEL_MSG], d_cmd[SEL_HATA]);
        lineNo++;
    }

    if (!isOk) {		//エラーメッセージ
        errorAlert("Line : " + originlineNo + " : "
                   + "選択肢終了コマンド「selectend」"
                   + "または「■選択肢終わり」がありません。");
        return sel_wnd;
    }


    return sel_wnd;
}
////////////////////////////////////////////////
//選択肢実行
function execSelect(hata) {
    click_flag = true;

    for (var i = 0; i < sel_wnd.length; i++) {
        sel_wnd[i].remove();
    }
    sel_wnd = new Array();

    var ok_flag = goto_return(hata);
    repeat_flag = true;
}

/////////////////////////////////////////////////////////////////wait

/*****************************
 * 指定時間だけ待機
 * @returns {Boolean}
 */
function t_wait() {
    var f = false;
    click_flag = false;
    timer_cnt--;
    if (timer_cnt <= 0) {
        timer_cnt = 0;
        click_flag = true;
        f = true;
    }

    return f;
}

/////////////////////////////////////////////////////waitコマンド登録
function waitTime(cnt) {
    timer_cnt = parseInt(cnt / DEFAULT_FPS);
    //char_cut_anime();
    return;
}

//////////////////////////////////////////////////////////////////////
//ifコマンド
function ifCmd(d_cmd) {
    var variableValue;
    
    var letterNum = user_L_to_N(d_cmd[VAR_LETTER]);
    if (letterNum === -1) {	//変数が間違っている場合。
        console("Error : variableLetter : " + d_cmd[VAR_LETTER]);
        errorAlert("変数：" + d_cmd[VAR_LETTER]
                + "\n変数が正しくありません。変数はAからZまでです。");
        return;
    }
    
     //被数の取得
    if(getValueFromVariable(d_cmd[VAR_C_NUM]) == null){
       return;
    }
    variableValue = getValueFromVariable(d_cmd[VAR_C_NUM]);

    var isOk = isIfTrue(game_status['user_var'][letterNum], d_cmd[VAR_C_F], variableValue);


    //条件に合っていたら
    if (isOk) {
        //ジャンプ
        var ok_f = goto_return(d_cmd[VAR_IF_HATA]);
        return;
    }

    return;
}

/*
 * 条件が正しいか返す
 * @param {type} target
 * @param {type} sign
 * @param {type} variableValue
 * @returns {isOk|Boolean}
 */
function isIfTrue(target, sign, variableValue){
    isOk = false;
    switch (sign) {
        case ">":
            if (target > variableValue)
                isOk = true;
            break;
        case "<":
            if (target < variableValue)
                isOk = true;
            break;
        case "=":
            if (target === variableValue)
                isOk = true;
            break;
        case "==":
            if (target === variableValue)
                isOk = true;
            break;
        case "!=":
            if (target !== variableValue)
                isOk = true;
            break;
        case ">=":
            if (target >= variableValue)
                isOk = true;
            break;
        case "<=":
            if (target <= variableValue)
                isOk = true;
            break;
    }
    return isOk;
}

//////////////////////////////////////////////////フラグ計算
function flagCal(d_cmd) {
    var variableValue;
    
    var letterNum = user_L_to_N(d_cmd[VAR_LETTER]);
    if (letterNum === -1) {	//変数が間違っている場合。
        console("Error : variableLetter : " + d_cmd[VAR_LETTER]);
        errorAlert("変数：" + d_cmd[VAR_LETTER]
                + "\n変数が正しくありません。変数はAからZまでです。");
        return;
    }

    //被数の取得
    if(getValueFromVariable(d_cmd[VAR_C_NUM]) == null){
       return;
    }
     variableValue = getValueFromVariable(d_cmd[VAR_C_NUM]);

    switch (d_cmd[VAR_C_F]) {
        case "+":
            game_status['user_var'][letterNum] = game_status['user_var'][letterNum] + variableValue;
            break;
        case "-":
            game_status['user_var'][letterNum] = game_status['user_var'][letterNum] - variableValue;
            break;
        case "*":
            game_status['user_var'][letterNum] = game_status['user_var'][letterNum] * variableValue;
            break;
        case "/":
            game_status['user_var'][letterNum] = game_status['user_var'][letterNum] / variableValue;
            parseInt(game_status['user_var'][letterNum]);
            break;
        case "%":
            game_status['user_var'][letterNum] = game_status['user_var'][letterNum] % variableValue;
            break;
    }
    return;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////ユーザ変数に値代入
function flagSet(d_cmd) {
    var variableValue;

    var letterNum = user_L_to_N(d_cmd[VAR_LETTER]);
    if (letterNum === -1) {	//変数が間違っている場合。
        console("Error : variableLetter : " + d_cmd[VAR_LETTER]);
        errorAlert("変数：" + d_cmd[VAR_LETTER]
                + "\n変数が正しくありません。変数はAからZまでです。");
        return;
    }

    if(getValueFromVariable(d_cmd[VAR_NUM]) != null){
        variableValue = getValueFromVariable(d_cmd[VAR_NUM]);
        game_status['user_var'][letterNum] = variableValue;
    }

    
    
    return;
}


/************************************************
 * 被数の形から値を取得する
 * @param {type} variableLetter
 * @returns {unresolved}
 */
function getValueFromVariable(variableLetter){
    var variableValue = null;
    var variableNumber = null;
    
    if (variableLetter.match(/[A-Z]/)) {
        variableNumber = user_L_to_N(variableLetter);
        variableValue = game_status['user_var'][variableNumber];
    } else if (checkInteger(variableLetter)) {
        variableValue = parseInt(variableLetter);
    } else {
        console("Error : variableLetter : " + variableLetter);
        errorAlert("変数の値：" + variableLetter
                + "\n設定する値が正しくありません。値は整数です。");
    }
    console("variableLetter : " + variableLetter);
    return variableValue;
}

/*********************************
 * 整数化チェックする
 * @param {type} str
 * @returns {unresolved}
 */
function checkInteger(str){
    return str.match(/^(0|[1-9]\d*)$/);
}

//////////////////////////////////////////変数の文字を数字に置き換え
function user_L_to_N(c) {
    
    var n = c.charCodeAt(0);
    //A(65)~Z(90)まで。
    if((n >=65) && (n < 91)){
        return n - 65;
    }else{
        return -1;
    }

}


////////////////////////////////////////////gotoコマンド
function gotoCmd(d_cmd) {

    var goto_flag = d_cmd[1];		//探す旗を退避
    var isOk = goto_return(goto_flag);

    return isOk;
}

///////////////////////////////////////////goto実体
function goto_return(goto_f) {
    var isOk = false;
    for (var i = 0; i < data.length; i++) {

        var d_cmd = data[i].split(" ");		//スペース区切り
        if ((d_cmd[0] === "#") && (goto_f === d_cmd[1])) {
            game_status['event_flag'] = i;				//進行フラグ書き換え
            isOk = true;
            break;
        } else {
            d_cmd = data[i].split("、");		//句読点区切り
            if ((d_cmd[0] === "■＃") && (goto_f === d_cmd[1])) {
                game_status['event_flag'] = i;				//進行フラグ書き換え
                isOk = true;
                break;
            }
        }
    }

    if (!isOk) {		//エラーのとき
        errorAlert("ハタ：" + goto_f + "\nハタが見つかりません");
    }

    return isOk;
}


///////////////////////////////////////////////SEプレイ
function sePlay(d_cmd, game, game_status, dataSet) {
    
    if (!game_status['sound_mode']){
        return;
    }
    
    if(checkLoaded(game, dataSet, d_cmd[SE_PATH], false)){
        game.assets[d_cmd[SE_PATH]].play();
    }
    
    return;
}


//////////////////////////////////////////BGMコマンド
function bgmStart(d_cmd) {
    game_status['bgm'] = d_cmd[BGM_PATH];
    if (game_status['sound_mode']) {
        //再生中のbgmがあったら止める
        if (audio != null) {
            audio.pause();
        }
        if ((env == "mobilesafari")) {
            isAudioLoadStart = true;
        } else {
            mobileeSafariBGMLoad(game_status['bgm']);
        }

    }
    return;
}


///////////////////////////////////////////再生を停止
function bgmStop(d_cmd) {
   
    audio.pause();
   
    return;
}

///////////////////////////////////////キャラ消しコマンド
/********************************
 * キャラを消す
 * @param {type} d_cmd
 * @param {type} game_status
 * @returns {mode|String}
 */
function charRm(d_cmd, game_status) {

    charFlagReset(d_cmd[CHAR_POS]);

    return  fixDisplayMode(d_cmd[CHAR_HOWTO], game_status);
}

/////////////////////////////////////キャラフラグリセット
function charFlagReset(pos) {

    if ((pos === "l") || (pos === "left") || (pos === "左")) {
        game_status['char_left'] = "";
    } else if ((pos === "c") || (pos === "center") || (pos === "中央")) {
        game_status['char_center'] = "";
    } else if ((pos === "r") || (pos === "right") || (pos === "右")) {
        game_status['char_right'] = "";
    } else if ((pos === "a") || (pos === "all") || (pos === "全員")) {
        game_status['char_left'] = "";
        game_status['char_right'] = "";
        game_status['char_center'] = "";
    } else {
        game_status['char_left'] = "";
        game_status['char_right'] = "";
        game_status['char_center'] = "";
    }


    return;
}

/////////////////////////////////////////////////////
/////////////////////////////////shakeアニメ
/****************************************
 * 揺らすコマンド
 * @param {type} d_cmd
 * @param {type} mode
 * @returns {undefined}
 */
function shake_init(d_cmd, mode, sub_screen) {
    var shake_time = "";
    var shake_pos = "";

    if (mode === "char") {
        shake_time = d_cmd[2];
        shake_pos = fixCharPos(d_cmd[1]);

    } else {
        shake_time = d_cmd[1];
        shake_pos = "bg";
    }

    sub_screen.setShake(shake_pos, getShakeNum(shake_time));

    return;
}

///////////////////////////////////////キャラコマンド
/************************
 * キャラロードコマンド
 * @param {type} d_cmd コマンド
 * @param {type} game ゲームオブジェクト
 * @param {type} game_status ゲームのステータス
 * @param {type} dataSet データセット
 * @return {type} 描画モード
 */
function charLoad(d_cmd, game, game_status, dataSet) {

   //読み込みチェック
    checkLoaded(game, dataSet, d_cmd[CHAR_PATH], true);
    
    //キャラの立ち位置に代入
    var pos = fixCharPos(d_cmd[CHAR_POS], game_status);
    game_status[pos] = d_cmd[CHAR_PATH];

    return fixDisplayMode(d_cmd[CHAR_HOWTO], game_status);
}

///////////////////////////////////////ＢＧコマンド
/*********************************************************
 * BGコマンド
 * @param {type} d_cmd コマンド
 * @param {type} game ゲームオブジェクト
 * @param {type} game_status ゲームのステータス
 * @param {type} dataSet データセット
 * @return {type} 描画モード
 ******************************************************/
function bgLoad(d_cmd, game, game_status, dataSet) {
    charFlagReset("all");
    
    //読み込みチェック
    checkLoaded(game, dataSet, d_cmd[BG_PATH], false);
    
    //現在のURLを保持
    game_status['bg'] = d_cmd[BG_PATH];			
    return fixDisplayMode(d_cmd[BG_HOWTO], game_status);
}

///////////////////////////////////////タイトルコマンド
/*****************************************************
 * titleコマンド
 * @param {type} d_cmd コマンド
 * @param {type} game ゲームオブジェクト
 * @param {type} game_status ゲームのステータス
 * @param {type} dataSet データセット
 * @returns {undefined}
 */
function titleLoad(d_cmd, game, game_status, dataSet) {
    
     //読み込みチェック
    checkLoaded(game, dataSet, d_cmd[BG_PATH], false);
    
    return;
}

/*************************************
 * 次のデータを先行ロードする
 * @param {type} game ゲームオブジェクト
 * @param {type} dataSet
 * @returns {undefined}
 */
function nextDataLoad(game, dataSet) {

    var currentNo = dataSet['currentNo'];
    if (currentNo < dataSet['Url'].length) {
        if (!dataSet['isLoaded'][currentNo]) {
            loadImage(dataSet, currentNo);
        } else {
            //現在参照しているURLがロード済みだった場合、そこ以降の未ロードを探す
            var notLoadedNo = getNotLoadNo(dataSet, currentNo);
            if (notLoadedNo !== -1) {
                loadImage(dataSet, notLoadedNo);
            }
        }
    } else {
        //一通り最後までロードフラグが行ってしまっている場合。
        var notLoadedNo = getNotLoadNo(dataSet, 0);
        if (notLoadedNo !== -1) {
            loadImage(dataSet, notLoadedNo);
        }

    }
    return;
}

/**********************
 * 未ロードのURL配列Noを返す
 * @param {type} dataSet
 * @param {type} index
 * @returns {getNotLoadNo.i|Number}
 */
function getNotLoadNo(dataSet, index) {
    var returnValue = -1;
    for (var i = index; i < dataSet['Url'].length; i++) {
        if (!dataSet['isLoaded'][i]) {
            returnValue = i;
            break;
        }

    }
    return returnValue;
}

/****************************
 * URLの画像をロードする
 * @param {type} dataSet
 * @param {type} no
 * @returns {undefined}
 */
function loadImage(dataSet, no) {
    preload_flag = true;
    game.load(dataSet['Url'][no], function () {
        //ロードが終わった時の処理
        dataSet['isLoaded'][no] = true;
        dataSet['currentNo'] = no + 1;
        preload_flag = false;
    });
}

////////////////////////////////////////////////////////////////////////////
//処理系

/********************************
 * データの読み込みチェック
 * @param {type} game
 * @param {type} dataSet
 * @param {type} path
 * @param {type} isRedraw 読み込み時に再描画するか
 * @returns {undefined}
 */
function checkLoaded(game, dataSet, path, isRedraw){
    var returnValue = true;
    var imageNumber = urlSearch(dataSet['Url'], path);
     //	例外
     //ロードされていなかった場合
    if (!dataSet['isLoaded'][imageNumber]) {
        returnValue = false;
        game.load(dataSet['Url'][imageNumber], function () {
            //ロードが終わった時の処理
           dataSet['isLoaded'][imageNumber] = true;
           dataSet['currentNo'] = imageNumber;
           if(isRedraw){
               sub_screen.redraw("cut");
           }
        });
    }
    return returnValue;
}
/***************************************
 * 表示モードを返す
 * @param var howTo 表示方法
 * @param var game_status ゲーム全体のステータス
 * @return var 整形済み表示モード 
 * 
 **************************************/
function fixDisplayMode(howTo, game_status){
    if ((howTo === "c")
            || (howTo === "cut")
            || (howTo === "カット")) {
        mode = "cut";
    }
    else if ((howTo === "w")
            || (howTo === "wipe")
            || (howTo === "ワイプ")) {
        mode = "wipe";
    }
    else if ((howTo === "f")
            || (howTo === "fade")
            || (howTo === "フェード")) {
        mode = "fade";
    }
    else {
        mode = "fade";
    }
    
    if (!game_status['effect_mode'])
        mode = "cut";		//エフェクトモードが０のときは強制的にカット
    if ((game_status['skip_mode'])
            && (read_flag[game_status['event_flag']]) === 1)
        mode = "cut";		//エフェクトモードが０のときは強制的にカット
    return mode;
}

/************************************
 * キャラの立ち位置を返す
 * @param {type} pos
 * @returns {String}
 ************************************/
function fixCharPos(pos){
     if ((pos === "l")
             || (pos === "left")
             || (pos === "左")) {
        return 'char_left';
    }
    else if ((pos === "c")
            || (pos === "center")
            || (pos === "中央")) {
        return 'char_center';
    } 
    else if ((pos === "r")
            || (pos === "right")
            || (pos === "右")) {
        return 'char_right';
    }
    else {
        return 'char_center';
    }
}

/*******************************
 * 揺らす回数を返す
 * @param {type} howTo
 * @returns {Number} 揺らす回数
 */
function getShakeNum(howTo){
    switch (howTo) {
        case "一瞬":
            return 10;
            break;
        case "普通":
            return 50;
            break;
        case "長い":
            return 100;
            break;
        case "instant":
            return 10;
            break;
        case "nomal":
            return 50;
            break;
        case "long":
            return 100;
            break;
        default :
            return 10;
            break;

    }
}

/////////////////////////////////////////////////////ＵＲＬ検索
function urlSearch(array_tmp, path) {
    var s_f = -1;

    for (var i = 0; i < array_tmp.length; i++) {
        if (path === array_tmp[i]) {
            s_f = i;
            break;
        }
    }
    return s_f;
}

/***************************
 * エラーメッセージを表示する
 * @param {type} message
 * @returns {undefined}
 */
function errorAlert(message){
    message = game_status['event_flag'] + "行目近く--" + message;
    alert(message);
}

/***************************
 * コンソールに出力
 * @param {type} message
 * @returns {undefined}
 */
function console(message){
   //console.error('エラーの内容');
}