/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
//メイン表示クラス
var MAINSCREEN = enchant.Class.create(enchant.Sprite, {
    initialize: function () {

        enchant.Sprite.call(this, GAME_WIDTH, GAME_MAIN_HEIGHT);
        this.image = game.assets[SYS_DATA_PATH + 'black.jpg'];
        this.x = 0;
        this.y = 0;

        //アニメーション設定
        this.addEventListener('enterframe', function () {

        });
        game.rootScene.addChild(this);
    },
    redraw: function (image) {
        this.image = image;
    }
});
///////////////////////////////////////////////////////////////////////
//バッファクラス
var SUBSCREEN = enchant.Class.create(enchant.Sprite, {
    initialize: function (main_screen) {

        enchant.Sprite.call(this, GAME_WIDTH, GAME_MAIN_HEIGHT);
        this.image = game.assets[SYS_DATA_PATH + 'black.jpg'];
        this.x = 0;
        this.y = 0;
        this.age = 0;
        this.opacity = 0;
        this.wipe_mx = -32;
        this.shake_time = 0;	//シェイクの時に使用
        this.shake_pos = "";	//シェイクの時に使用
        this.animationFlag = "none";
        this.main_screen = main_screen;
        this.startColumnOffset = 20;    //ワイプ時の一画面描画の縦ライン数
        //ワイプ用の画像保存バッファ
        this.buffer = new Surface(GAME_WIDTH, GAME_MAIN_HEIGHT);
        //アニメーション設定
        this.addEventListener('enterframe', function (main_screen) {
            //カット
            if (this.animationFlag == "cut") {
                this.opacity = 1;
                this.end();
            }
            //ワイプ
            else if (this.animationFlag == "wipe") {
                var startColumnOffset = this.startColumnOffset;
                var numColumn = GAME_WIDTH / startColumnOffset;
                for (var i = 0; i < numColumn; i++) {
                    var startColumn = i * startColumnOffset;	//x座標の開始位置を計算
                    var widthColumn = i + this.wipe_mx;         //幅を計算
                    if ((widthColumn > startColumnOffset)||(widthColumn < 0)){
                        widthColumn = 0;
                    }
                    //1～20ドットのサイズになる時だけコピー	
                    try {
                        if (widthColumn > 0) {
                            this.buffer.draw(game.assets[game_status['bg']],
                                    startColumn + widthColumn, 0, 1, GAME_MAIN_HEIGHT,
                                    startColumn + widthColumn, 0, 1, GAME_MAIN_HEIGHT);
                        }
                    } catch (e) {
                    }

                }
                this.image = this.buffer;
                this.wipe_mx++;			//全体のカウンターを+1
                if (this.wipe_mx > this.startColumnOffset) {
                    this.end();
                }
            }
            //フェード
            else if (this.animationFlag === "fade") {
                this.opacity += 0.1;
                if (this.opacity >= 1.0)
                    this.end();
            }
            //シェイク
            else if (this.animationFlag === "shake") {
                var r = Math.floor(Math.random() * 100) - 50;
                if (this.shake_time < 2)
                    r = 0;	//初期値に戻して描画させる;
                var bg_left_x = (this.shake_pos === "bg") ? r : 0;
                var char_left_x = (this.shake_pos === "char_left") ? r : 0;
                var char_center_x = (this.shake_pos === "char_center") ? r : 0;
                var char_right_x = (this.shake_pos === "char_right") ? r : 0;
                
                var suf = this.subCharRedraw(bg_left_x, char_left_x, char_center_x, char_right_x);

                this.image = suf;
                this.shake_time--;
                if (this.shake_time <= 0) {
                    this.end();
                }
            }
        });
        game.rootScene.addChild(this);
    },
    end: function () {
        this.main_screen.redraw(this.image);
        this.opacity = 0;
        this.wipe_mx = -1 * GAME_WIDTH / this.startColumnOffset;
        this.animationFlag = "none";
        if ((game_status['skip_mode']) && (read_flag[game_status['event_flag']] === 1))
            repeat_flag = true;
        click_flag = true;
        clickSelector();
    },
    setShake: function (s_pos, s_time) {
        //シェイク時の初期化
        this.animationFlag = "shake";
        this.shake_time = s_time;
        this.shake_pos = s_pos;
        this.opacity = 1;
    },
    redraw: function (howto) {
        this.x = 0;
        this.y = 0;
        this.age = 0;
        //キャラの書き込み
        var suf = this.subCharRedraw(0, 0, 0, 0);

        if (howto === "wipe") {
            //this.image = this.main_screen.image;
            this.buffer = this.main_screen.image;
        } else {
            this.image = suf;
        }

        this.animationFlag = howto;

    },
    //キャラを書き込む
    subCharRedraw: function (offsetBgX, offsetCharLeftX, offsetCharCenterX, offsetCharRightX) {
        var suf = new Surface(GAME_WIDTH, GAME_MAIN_HEIGHT);
        
        //背景を描く
        suf.draw(game.assets[game_status['bg']], 0 + offsetBgX, 0);

        //人を書く
        if (game_status['char_left'] !== "") {
            //20%ずらす。
            try {
                var x = 0 - (game.assets[game_status['char_left']].width * 0.2);
                x += offsetCharLeftX;
                var y = GAME_MAIN_HEIGHT - game.assets[game_status['char_left']].height;
                if(y < 0) y = 0;
                
                suf.draw(game.assets[game_status['char_left']], x, y);
            } catch (e) {
                //if (DEBUG_MODE)
                    errorAlert("画像がみつかりません:" + game_status['char_left']);
            }
        }

        if (game_status['char_center'] !== "") {
            try {
                var x = (GAME_WIDTH - game.assets[game_status['char_center']].width) / 2;
                x += offsetCharCenterX;
                var y = GAME_MAIN_HEIGHT - game.assets[game_status['char_center']].height;
                if(y < 0) y = 0;
                suf.draw(game.assets[game_status['char_center']], x, y);
            } catch (e) {
                //if (DEBUG_MODE)
                    errorAlert("画像がみつかりません:" + game_status['char_center']);
            }
        }

        if (game_status['char_right'] !== "") {
            //20%ずらす。
            try {
                var x = GAME_WIDTH - game.assets[game_status['char_right']].width +
                        (game.assets[game_status['char_right']].width * 0.2);
                x += offsetCharRightX;
                var y = GAME_MAIN_HEIGHT - game.assets[game_status['char_right']].height;
                if(y < 0) y = 0;
                suf.draw(game.assets[game_status['char_right']], x, y);
            } catch (e) {
                //if (DEBUG_MODE)
                    errorAlert("画像がみつかりません:" + game_status['char_right']);
            }

        }
        
        return suf;
    }
});

///////////////////////////////////////////////////////////////////////
//メイン表示クラス
var TITLESCREEN = enchant.Class.create(enchant.Sprite, {
    initialize: function (path) {

        enchant.Sprite.call(this, GAME_WIDTH, GAME_HEIGHT);
        this.image = game.assets[path];
        this.opacity = 0;
        this.x = 0;
        this.y = 0;
        this.animationFlag = "start";

        //表示時にタッチされたら
        this.addEventListener('touchstart', function (e) {
            if (this.animationFlag === "stop")
                this.end();
        });

        //アニメーション設定
        this.addEventListener('enterframe', function () {
            if (this.animationFlag === "start") {
                if (this.opacity < 1)
                    this.opacity += 0.1;
                if (this.opacity >= 1)
                    this.animationFlag = "stop";
            }
            if (this.animationFlag === "end") {
                if (this.opacity > 0)
                    this.opacity -= 0.1;
                if (this.opacity <= 0)
                    this.remove();
            }

        });
        game.rootScene.addChild(this);
    },
    end: function () {
        this.animationFlag = "end";
    },
    remove: function () {
        click_flag = true;
        game.rootScene.removeChild(this);
        delete this;
        clickSelector();
    }
});

///////////////////////////////////////////////////////////////////////
//メッセージ表示クラス
var MSGWINDOW = enchant.Class.create(enchant.Sprite, {
    initialize: function () {

        enchant.Sprite.call(this, GAME_WIDTH, GAME_MSG_WND_HEIGHT);
        this.image = game.assets[SYS_DATA_PATH + 'msg_wnd.png'];
        this.x = 0;
        this.y = GAME_MSG_WND_Y;
        this.f_size = 30;
        this.msg = "";

        //アニメーション設定
        this.addEventListener('enterframe', function () {
            this.m_label.text = this.msg;
        });
        game.rootScene.addChild(this);
        //game.rootScene.insertBefore(this);

        this.m_label = new Label();
        this.m_label.color = 'white';
        this.m_label.font = "" + this.f_size + "px " + font;
        this.m_label.x = this.x + 5;
        this.m_label.y = this.y + 12;
        this.m_label.width = this.width - 60;
        this.m_label.text = "";
        game.rootScene.addChild(this.m_label);
    },
    text: function (msg) {

        this.msg = replaceCaractor(msg);
    }
});

///////////////////////////////////////////////////////////////////////
//選択肢表示クラス
var SELWINDOW = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y, msg, hata) {

        enchant.Sprite.call(this, 500, 40);
        this.image = game.assets[SYS_DATA_PATH + 'select_wnd.png'];
        this.x = x;
        this.y = y;
        this.f_size = 24;
        this.msg = msg;
        this.hata = hata;

        //アニメーション設定
        this.addEventListener('enterframe', function () {
            this.sel_label.text = this.msg;
        });
        this.addEventListener('touchstart', function (e) {
            execSelect(this.hata);
            clickSelector();
        });
        game.rootScene.addChild(this);

        this.sel_label = new Label();
        this.sel_label.color = 'white';
        this.sel_label.font = "" + this.f_size + "px " + font;
        this.sel_label.x = this.x + 10;
        this.sel_label.y = this.y + 5;
        this.sel_label.width = this.width;
        this.sel_label.text = "";
        this.sel_label.hata = this.hata;
        //ラベルにもイベントリスナー追加（ラベル上をクリックしても反応しないため
        this.sel_label.addEventListener('touchstart', function (e) {
            execSelect(hata);
        });
        game.rootScene.addChild(this.sel_label);
    },
    text: function (msg) {
        this.msg = msg;
    },
    remove: function () {
        game.rootScene.removeChild(this.sel_label);
        game.rootScene.removeChild(this);
        delete this;
    }
});
///////////////////////////////////////////////////////////////////////
//画像ボタンクラス
var IMGBUTTON = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y, w, h, path, mode) {

        enchant.Sprite.call(this, w, h);
        this.image = game.assets[path];
        this.x = x;
        this.y = y;

        this.mode = mode;

        //タッチされた時の処理
        this.addEventListener('touchstart', function (e) {
            if (this.mode === "setting") {
                displayOption();
            }
        });
        game.rootScene.addChild(this);
    },
    remove: function () {
        game.rootScene.removeChild(this);
        delete this;
    }
});

///////////////////////////////////////////////////////////////////////
//オプションボタンクラス
var OPTIONBUTTON = enchant.Class.create(enchant.Sprite, {
    initialize: function (init_x, init_y, x, y, w, h,
                            move_mode, path, mode) {

        enchant.Sprite.call(this, w, h);
        this.p_path = path;
        this.image = game.assets[getOptionPath(path, mode)];
        this.move_mode = move_mode;	//移動モード
        this.toX = x;				//到着予定場所
        this.toY = y;				//到着予定場所
        this.mode = mode;			//load,saveなどのモード
        this.move_flag = 0;			//移動制御フラグ
        //横からくるモード
        if (this.move_mode === "vx") {
            this.x = init_x;
            this.y = y;
            this.vx = 60;
            this.vy = 0;
        }
        //縦からアニメーションするモード
        else {
            this.x = x;
            this.y = init_y;
            this.vx = 0;
            this.vy = 70;
        }


        //タッチされた時の処理
        this.addEventListener('touchstart', function (e) {
            switch (this.mode) {
                case "load":
                    option_status = 'hidden';
                    displaySaveArea(this.mode);
                    break;
                case "save":
                    option_status = 'hidden';
                    displaySaveArea(this.mode);
                    break;
                case "backlog":
                    drawBackLog(backLog);
                    break;
                case "sound_mode":
                    switchingSound();
                    this.image = game.assets[
                            getOptionPath(this.p_path, this.mode)
                    ];
                    break;
                case "effect_mode":
                    switchingEffect();
                    this.image = game.assets[
                            getOptionPath(this.p_path, this.mode)
                    ];
                    break;
                case "read_mode":
                    switchingRead();
                    this.image = game.assets[
                            getOptionPath(this.p_path, this.mode)
                    ];
                    break;
            }
        });

        //アニメーション設定
        this.addEventListener('enterframe', function () {
            if (this.move_flag === 0) {
                this.x += this.vx;
                this.y += this.vy;
            }
            //消すときの動作
            if (this.move_flag === 2) {
                this.x -= 70;
            }

            //目的地に到着したらモードを変更する。
            if ((this.move_mode === "vx") && (this.x >= this.toX)) {
                this.x = this.toX;
                this.move_flag = 1;
            } else if ((this.move_mode === "vy") && (this.y >= this.toY)) {
                this.y = this.toY;
                this.move_flag = 1;
            }

            //消す時
            if ((this.move_flag === 2) && (this.x <= -100)) {
                this.remove();
            }

            //もし終了だったら
            if ((option_status === 'hidden')
                    && (this.mode !== 'save_wnd')
                    && (this.mode !== 'load_wnd')) {

                this.move_flag = 2;
            }
            //もし終了だったら
            if (option_status === 'hidden_all') {
                this.move_flag = 2;
            }
        });


        game.rootScene.addChild(this);
    },
    remove: function () {
        game.rootScene.removeChild(this);
        delete this;
    }
});
////////////////////////////////////////////////////////////////////////
//オプションクラスを継承して作成
var SAVEWINDOW = enchant.Class.create(OPTIONBUTTON, {
    initialize: function (init_x, init_y, x, y, w, h,
                           move_mode, path, mode, msg, save_name) {
        OPTIONBUTTON.call(this, init_x, init_y, x, y, w, h,
                          move_mode, path, mode);

        this.msg = msg;
        this.save_name = save_name;
        this.f_size = 20;
        this.close_flag = 0;

        this.sel_label = new Label();
        this.sel_label.color = 'white';
        this.sel_label.font = "bold " + this.f_size + "px " + font;
        this.sel_label.x = this.x + 5;
        this.sel_label.y = this.y + 5;
        this.sel_label.width = w - this.f_size;
        this.sel_label.text = msg;


        this.addEventListener('enterframe', function () {
            this.sel_label.x = this.x + 5;
            this.sel_label.y = this.y + 5;
            this.sel_label.text = msg;

            //セーブウィンドウのみのアニメーションスイッチ
            if (option_status === 'close_save') {
                this.move_flag = 2;
                this.sel_label.text = "";
            }
        });
        //ラベルにもイベントリスナー追加（ラベル上をクリックしても反応しないため
        this.addEventListener('touchstart', function (e) {
            if (this.mode === 'save_wnd')
                save(save_name);
            if (this.mode === 'load_wnd') {
                saveDataLoad(save_name);
                loadPreload(game, data, dataSet, game_status['event_flag']);	//先行ロード
            }
        });

        this.sel_label.addEventListener('touchstart', function (e) {
            if (this.mode === 'save_wnd')
                save(save_name);
            if (this.mode === 'load_wnd') {
                saveDataLoad(save_name);
                loadPreload(game, data, dataSet, game_status['event_flag']);	//先行ロード
            }
        });
        game.rootScene.addChild(this.sel_label);

    },
    remove: function () {
        game.rootScene.removeChild(this.sel_label);
        game.rootScene.removeChild(this);
        delete this;
    }
});


///////////////////////////////////////////////////////////////////////
//メッセージ表示クラス
var DEBUGWINDOW = enchant.Class.create(enchant.Sprite, {
    initialize: function () {

        enchant.Sprite.call(this, GAME_WIDTH, 200);
        this.x = 20;
        this.y = 20;
        this.f_size = 12;
        this.msg = "";

        //アニメーション設定
        this.addEventListener('enterframe', function () {
            this.msg = '';
            this.msg += "Line : " + game_status['event_flag'] + "<br>";
            this.msg += "char_left : " + game_status['char_left'] + "<br>";
            this.msg += "char_center : " + game_status['char_center'] + "<br>";
            this.msg += "char_right : " + game_status['char_right'] + "<br>";
            this.msg += "bg : " + game_status['bg'] + "<br>";
            this.msg += "bgm : " + game_status['bgm'] + "<br>";
            this.msg += "timer_cnt : " + timer_cnt + "<br>";
            for (var i = 0; i < game_status['user_var'].length; i++) {
                this.msg += String.fromCharCode(i + 65) + " = " + game_status['user_var'][i] + "<br>";
            }
            this.msg += "";
            label.text = this.msg;
        });
        game.rootScene.addChild(this);

        var label = new Label();
        //label.color = 'white';
        label.font = "" + this.f_size + "px " + font;
        label.x = this.x;
        label.y = this.y;
        label.width = this.width;
        label.text = "";
        game.rootScene.addChild(label);
    },
    text: function (msg) {
        this.msg = msg;
    }
});
