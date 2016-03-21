/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var helpUrl = "help/command.html";
var originExchangeList = new Array();
var afterExchangeList = new Array();

function exchangeText() {
    var str_msg = "var file_data=new Array(";
    var t = "";
    var s = new Array();
    var i, j;
    //一度エラー表示をリセット
    document.getElementById("success").innerHTML = "";
    
    exchangeList();		//変換リストを取得
    t = document.getElementById("text_area_1").value;

    s = t.split("\n");
    for (i = 0; i < s.length; i++) {
        var lineNo = i + 1;
        for (j = 0; j < originExchangeList.length; j++) {		//変換
            if (s[i].indexOf(originExchangeList[j]) != -1) {
                s[i] = s[i].split(originExchangeList[j]).join(afterExchangeList[j]);
            }
        }
        checkCommand(s[i], lineNo);
        str_msg += "'" + s[i] + "',\n";
    }
    str_msg += "'');";
    document.getElementById("text_area_2").value = str_msg;
    alert("データを変換しました。\n変換したデータをテキストに貼り付けて、ファイル名を「story.js」に変更してください");
    return;
}

///////変換リストを変数に保存
function exchangeList() {
    var array_tmp = new Array();
    var line = new Array();
    var str_tmp = document.getElementById("exchange_list").value;
    var i = 0;
    var cnt = 0;

    array_tmp = str_tmp.split("\n");

    for (i = 0; i < array_tmp.length; i++) {
        if (array_tmp[i].indexOf(">") != -1) {		//もし>が含まれる行なら
            line = array_tmp[i].split(">");
            originExchangeList[cnt] = line[0];
            afterExchangeList[cnt] = line[1];
            cnt++;
        }
    }
}

///////保存
function saveStorage() {
    var str_tmp = document.getElementById("exchange_list").value;
    localStorage.setItem("key_exchange_list", str_tmp);
    alert("保存しました。");
}
///////ロード
function loadStorage() {
    document.getElementById("exchange_list").value = localStorage.getItem("key_exchange_list");
}

////////////////////////////////////////////////////////////////////////////////
//コマンドチェック
function checkCommand(command, lineNo) {
    
    var str_tmp = transrateCommand(command);
    var d_cmd = str_tmp.split(" ");		//スペース区切り

    switch (d_cmd[0]) {
        case "bg":
            checkUsage(d_cmd, "背景コマンド", 3, lineNo, "#bg");
            fileExistCheck(d_cmd[BG_PATH], lineNo,"img");
            break;
        case "title":
           checkUsage(d_cmd, "タイトルコマンド", 3, lineNo, "#title");
           fileExistCheck(d_cmd[BG_PATH], lineNo,"img");
            break;

        case "char":
            checkUsage(d_cmd, "キャラコマンド", 4, lineNo, "#char");
            fileExistCheck(d_cmd[CHAR_PATH], lineNo,"img");
            break;

        case "rm":
           checkUsage(d_cmd, "キャラ削除コマンド", 3, lineNo, "#rm");
            break;

        case "music":
            checkUsage(d_cmd, "音楽コマンド", 2, lineNo, "#bgm");
           fileExistCheck(d_cmd[BGM_PATH], lineNo,"audio");
            break;

        case "musicstop":
           checkUsage(d_cmd, "音楽ストップコマンド", 1, lineNo, "#musicstop");
            break;

        case "goto":
           checkUsage(d_cmd, "ジャンプコマンド", 2, lineNo, "#goto");
            break;

        case "flagset":
            checkUsage(d_cmd, "変数セットコマンド", 3, lineNo, "#flagset");
            break;

        case "flagcal":
           checkUsage(d_cmd, "フラグ計算コマンド", 4, lineNo, "#flagcal");
            break;

        case "if":
             checkUsage(d_cmd, "もしコマンド", 5, lineNo, "#if");
            break;

        case "select":
           checkUsage(d_cmd, "選択肢コマンド", 1, lineNo, "#select");
            break;

        case "wait":
           checkUsage(d_cmd, "ウェイトコマンド", 2, lineNo, "#wait");
            break;

        case "se":
             checkUsage(d_cmd, "SEコマンド", 2, lineNo, "#se");
            fileExistCheck(d_cmd[SE_PATH], lineNo,"audio");
            break;
        case "shake":
            checkUsage(d_cmd, "シェイクコマンド", 2, lineNo, "#shake");
            break;
        case "charshake":
            checkUsage(d_cmd, "キャラシェイクコマンド", 3, lineNo, "#charshake");
            break;

        case "#":
           
            break;

        case "//":
            
            break;
            
        case "debug":
           
            break;

    }

    return;
}

/**********************
 * 
 * @returns {undefined}
 */
function checkUsage(d_cmd, commandName, usageNum, lineNo, commandUsage){
    if(d_cmd.length != usageNum){
        var msg = commandName + "エラー (" + lineNo + '行目) 参考：<a target="_blank" href="' + helpUrl + commandUsage + '">' + commandName + "</a><br>";
        $("#success").append(msg);
    }
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


function fileExistCheck(filePath, checkLine, tag) {

    if (tag == "img") {
        var img = new Image();
        img.onload = function () {
            console.info('Loaded: ' + filePath + '<br>');
        }
        img.onerror = function () {
            console.info('Failed: ' + filePath + '<br>');
            $("#success").append('ファイルがありません。' + checkLine + "行目:" + filePath + "<br>");
        }
        img.src = filePath;
    }
    else{
        var audio = new Audio();
        audio.onload = function () {
            console.info('Loaded: ' + filePath + '<br>');
        }
        audio.onerror = function () {
            console.info('Failed: ' + filePath + '<br>');
            $("#success").append('ファイルがありません。' + checkLine + "行目:" + filePath + "<br>");
        }
        audio.src = filePath;
    }

}