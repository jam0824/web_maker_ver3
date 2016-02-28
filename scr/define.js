/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var GAME_WIDTH         = 640;      //ゲームの幅
var GAME_HEIGHT        = 957;      //ゲームの高さ（全体）
var GAME_MAIN_HEIGHT   = 700;      //ゲームの画像が表示される高さ
var GAME_MSG_WND_Y     = 700;      //メッセージウィンドウが表示される位置
var GAME_MSG_WND_HEIGHT= 257;      //メッセージウィンドウの高さ
var CHAR_LEFT_OFFSET   = -50;      //左側に表示されるキャラの位置補正
var CHAR_RIGHT_OFFSET  = 50;       //右側に表示されるキャラの位置補正


////////////////////////////////////////////////////////////////////////

var SYS_DATA_PATH      = "sys/";   //データフォルダのパス
var DEFAULT_FPS        = 30;       //Frame rate
var PRELOAD_MAX        = 20;       //Max number of preload.
var font               = "'ＭＳ ゴシック'";

var USER_VAR_MAX       = 26;       //Max size of user varibles.
var SEL_MAX            = 4;

var BG_HOWTO           = 1;			//コマンドＢＧの方法
var BG_PATH            = 2;			//コマンドＢＧのパス

//コマンド用の定数
var CHAR_POS           = 1;
var CHAR_HOWTO         = 2;
var CHAR_PATH          = 3;

var CHAR_L_F           = 0;
var CHAR_C_F           = 1;
var CHAR_R_F           = 2;

var FADE_SPEED         = 500;

var MSG_X              = 20;
var MSG_Y              = 510;
var MSG_W              = 750;

var LETTER_W           = 24;

var BGM_PATH           = 1;

var VAR_LETTER         = 1;
var VAR_NUM            = 2;

var VAR_C_F            = 2;
var VAR_C_NUM          = 3;
var VAR_IF_HATA        = 4;

var SEL_MSG            = 0;
var SEL_HATA           = 1;

var SEL_X              = 150;
var SEL_Y              = 140;
var SEL_H              = 40;
var SEL_PADDING        = 10;

var TIME_NUM           = 1;

var SAVE_MAX           = 5;			//セーブ領域最大値
var SAVE_EVENTFLAG     = 0;
var SAVE_CHAR_L        = 1;
var SAVE_CHAR_C        = 2;
var SAVE_CHAR_R        = 3;
var SAVE_BG            = 4;
var SAVE_BGM           = 5;
var SAVE_USER_VAL      = 6;
var SAVE_DATE          = 16;
var SAVE_SENTENSE      = 17;

var SE_PATH            = 1;

var OPT_BGM_VOL        = 0;
var OPT_SE_VOL         = 1;
var OPT_KIDOKU         = 2;