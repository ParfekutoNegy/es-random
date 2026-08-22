//======================================
// CPU処理
//======================================


let cpuWaiting = false;

let cpuSelectedBlocker = null;

//======================================
// CPUターン状態
//======================================

// 0 = 最初の攻撃
// 1 = サモン
// 2 = マギア
// 3 = 最後の攻撃
// 4 = 終了

let cpuTurnStep = 0;


//--------------------------------------
// CPUはターン中にサモン1枚まで
//--------------------------------------

let cpuSummonUsedThisTurn = false;


//--------------------------------------
// 現在の攻撃フェーズで処理した
// サモンを記録
//--------------------------------------

let cpuAttackQueue = [];

let cpuAttackIndex = 0;


//======================================
// CPUターン初期化
//======================================

function resetCpuTurnState(){

    cpuTurnStep = 0;

    cpuSummonUsedThisTurn = false;

    cpuAttackQueue = [];

    cpuAttackIndex = 0;

    cpuWaiting = false;

    console.log(
        "CPUターン状態リセット"
    );

}


//======================================
// CPU行動開始
//======================================

function startCpuAction(){

    //----------------------------------
    // ゲーム終了後はCPU行動禁止
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU行動開始中止：ゲーム終了"
        );

        return;

    }


    logCpuCardTotal();

    console.log(
        "=============================="
    );

    console.log(
        "CPU行動開始"
    );

    console.log(
        "=============================="
    );


    cpuWaiting = false;


    runCpuTurnStep();

}


//======================================
// CPU行動ループ
//======================================

function runCpuTurnStep(){

    //----------------------------------
    // ゲーム終了後はCPU行動禁止
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU行動停止：ゲーム終了"
        );

        cpuWaiting = false;

        return;

    }

    //----------------------------------
    // プレイヤー操作待ち
    //----------------------------------

    if(
        resistMode ||
        blockMode
    ){

        console.log(
            "CPU停止：プレイヤー操作待ち"
        );

        cpuWaiting = true;

        return;

    }


    cpuWaiting = false;


    //----------------------------------
    // CPUターン以外なら停止
    //----------------------------------

    if(
        game.currentPlayer !== ENEMY
    ){

        console.log(
            "CPU停止：CPUターンではありません"
        );

        return;

    }


    console.log(
        "CPU行動ステップ",
        cpuTurnStep
    );


    //----------------------------------
    // ステップ処理
    //----------------------------------

    switch(cpuTurnStep){


        //==================================
        // ③ 最初の攻撃
        //==================================

        case 0:

            cpuStartAttackPhase();

            break;


        //==================================
        // ① サモン
        //==================================

        case 1:

            cpuPlaySummon();

            break;


        //==================================
        // ② マギア
        //==================================

        case 2:

            cpuPlayMagia();

            break;


        //==================================
        // ③ 最後の攻撃
        //==================================

        case 3:

            cpuStartAttackPhase();

            break;


        //==================================
        // 終了
        //==================================

        case 4:

            cpuFinishTurn();

            break;

    }

}


//======================================
// CPU攻撃フェーズ開始
//======================================
function cpuStartAttackPhase(){

    console.log(
        "CPU攻撃フェーズ開始"
    );


    //----------------------------------
    // 最初の攻撃前
    //----------------------------------

    if(
        cpuTurnStep === 0
    ){

//----------------------------------
// アクアストリーム
//----------------------------------

const aquaInfo =
    cpuShouldUseAquaStream();


if(aquaInfo){

    //----------------------------------
    // PLAYERのサモンからのみ選択
    //----------------------------------

    const target =
        aquaInfo.targets[
            Math.floor(
                Math.random() *
                aquaInfo.targets.length
            )
        ];


    console.log(
        "CPU：最初の攻撃前にアクアストリーム使用",
        "対象=",
        target.card.name,
        "owner=",
        target.owner
    );


    //----------------------------------
    // CPUマギア使用
    //----------------------------------

    const result =
        cpuMagia(
            aquaInfo.card,
            target
        );


    console.log(
        "CPU：アクアストリーム使用結果",
        result
    );


    if(result){

        setTimeout(
            runCpuTurnStep,
            1200
        );

        return;

    }

}


        //----------------------------------
        // ウィンドプレッシャー
        //----------------------------------

        const windPressureInfo =
            cpuShouldUseWindPressure();


        if(windPressureInfo){

            console.log(
                "CPU：最初の攻撃前にウィンドプレッシャー使用"
            );


            const result =
                cpuMagia(
                    windPressureInfo.card,
                    windPressureInfo.target
                );


            console.log(
                "CPU：ウィンドプレッシャー使用結果",
                result
            );


            //----------------------------------
            // 強制コスト型
            //----------------------------------

            if(
                windPressureInfo.card.effect &&
                windPressureInfo.card.effect.type ===
                "forceCost"
            ){

                console.log(
                    "CPU：ウィンドプレッシャーの選択待ち"
                );

                return;

            }


            //----------------------------------
            // 通常マギア
            //----------------------------------

            if(result){

                setTimeout(
                    runCpuTurnStep,
                    1200
                );

                return;

            }

        }

    } // ← 最初の攻撃前のifをここで閉じる


    //----------------------------------
    // 攻撃キュー作成
    //----------------------------------

    createCpuAttackQueue();


    //----------------------------------
    // 攻撃可能なし
    //----------------------------------

    if(
        cpuAttackQueue.length === 0
    ){

        console.log(
            "CPU攻撃可能サモンなし"
        );


        if(
            cpuTurnStep === 0
        ){

            cpuTurnStep = 1;

        }
        else{

            cpuTurnStep = 4;

        }


        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }


    //----------------------------------
    // 攻撃開始
    //----------------------------------

    cpuAttackIndex = 0;

setTimeout(
    ()=>{

        cpuNextAttack();

    },
    2000
);
}


//======================================
// CPU攻撃キュー作成
//======================================

function createCpuAttackQueue(){

    cpuAttackQueue = [];

    cpuAttackIndex = 0;


    //----------------------------------
    // 基準パワー取得
    //----------------------------------

    const readyPlayerSummons =
    playerField.filter(
        summon => !summon.isRest
    );


    let attackPowerThreshold = 0;


    if(
        readyPlayerSummons.length > 0
    ){

        attackPowerThreshold =
        Math.max(
            ...readyPlayerSummons.map(
                summon =>
                getPower(summon)
            )
        );

    }


    console.log(
        "CPU攻撃基準パワー",
        attackPowerThreshold
    );

//----------------------------------
// 攻撃可能CPUサモン
//----------------------------------

cpuAttackQueue =
enemyField.filter(summon=>{


    //----------------------------------
    // 行動不能なら不可
    //----------------------------------

    if(summon.isRest){

        return false;

    }


    //----------------------------------
    // 召喚したターンは攻撃不可
    //----------------------------------

    if(
        !summon.attackReady &&
        summon.card.ability?.type !==
        "summonTurnAttack"
    ){

        return false;

    }


    //----------------------------------
    // 基準以上のパワー
    //----------------------------------

    return (
        getPower(summon)
        >=
        attackPowerThreshold
    );

});
}


//======================================
// CPU次の攻撃
//======================================

function cpuNextAttack(){


    //----------------------------------
    // ゲーム終了後はCPU攻撃禁止
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU攻撃停止：ゲーム終了"
        );

        cpuAttackQueue = [];

        cpuAttackIndex = 0;

        cpuWaiting = false;

        return;

    }

    console.log(
    "CPU次攻撃処理",
    "cpuTurnStep=",
    cpuTurnStep,
    "cpuAttackIndex=",
    cpuAttackIndex,
    "queue=",
    cpuAttackQueue.map(
        summon => summon.card.name
    )
);

    //----------------------------------
    // プレイヤー操作待ち
    //----------------------------------

    if(
        resistMode ||
        blockMode
    ){

        cpuWaiting = true;

        console.log(
            "CPU攻撃停止：プレイヤー操作待ち"
        );

        return;

    }


    //----------------------------------
    // 全攻撃終了
    //----------------------------------

    if(
        cpuAttackIndex >=
        cpuAttackQueue.length
    ){

        console.log(
            "CPU攻撃フェーズ終了"
        );


        cpuAttackQueue = [];

        cpuAttackIndex = 0;


        //----------------------------------
        // 次のステップ
        //----------------------------------

        if(cpuTurnStep === 0){

            cpuTurnStep = 1;

        }else{

            cpuTurnStep = 4;

        }


        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }


    //----------------------------------
    // ゲーム終了確認
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU攻撃中止：ゲーム終了"
        );

        cpuAttackQueue = [];
        cpuAttackIndex = 0;

        return;

    }

    //----------------------------------
    // 攻撃役
    //----------------------------------

    const attacker =
    cpuAttackQueue[
        cpuAttackIndex
    ];


    //----------------------------------
    // 攻撃不能になっていた場合
    //----------------------------------

    if(
        !attacker ||
        attacker.isRest ||
        !enemyField.includes(attacker)
    ){

        cpuAttackIndex++;

        cpuNextAttack();

        return;

    }


    //----------------------------------
    // 攻撃対象
    //----------------------------------

    const target =
    selectCpuAttackTarget();


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(!target){

        cpuAttackIndex++;

        cpuNextAttack();

        return;

    }


    console.log(
        "CPU攻撃",
        attacker.card.name,
        "→",
        target === PLAYER
        ? "PLAYER"
        : target.card.name
    );


    //----------------------------------
    // 攻撃実行
    //----------------------------------

    attackingSummon =
    attacker;

    attackMode = true;


    const result =
    executeAttack(
        attacker,
        target
    );


    //----------------------------------
    // 待機
    //----------------------------------

    if(
        result === "WAIT_RESIST" ||
        result === "WAIT_BLOCK"
    ){

        cpuWaiting = true;

        return;

    }


    //----------------------------------
    // 攻撃完了
    //----------------------------------

    cpuAttackIndex++;


    setTimeout(
        cpuNextAttack,
        2000
    );

}



//======================================
// CPU攻撃対象選択
//======================================

function selectCpuAttackTarget(){

    //----------------------------------
    // 攻撃サモン確認
    //----------------------------------

    if(!attackingSummon){

        return PLAYER;

    }


    //----------------------------------
    // CPUの攻撃力
    //----------------------------------

    const attackerPower =
        getPower(attackingSummon);


    console.log(
        "CPU攻撃対象判定",
        attackingSummon.card.name,
        "攻撃力=",
        attackerPower
    );


    //----------------------------------
    // ① 横向きサモン
    //----------------------------------
    // 自分のパワーより下なら攻撃
    // 同じパワー以上なら攻撃しない
    //----------------------------------

    const restingSummons =
        playerField.filter(
            summon => {

                if(summon.destroyed){

                    return false;

                }

                if(!summon.isRest){

                    return false;

                }

                return (
                    getPower(summon)
                    <
                    attackerPower
                );

            }
        );


    //----------------------------------
    // 横向きサモンがある場合
    //----------------------------------

    if(
        restingSummons.length > 0
    ){

        //----------------------------------
        // 最もパワーが高いものを優先
        //----------------------------------

        restingSummons.sort(
            (a,b)=>
                getPower(b)
                -
                getPower(a)
        );


        console.log(
            "CPU攻撃対象：横向きサモン",
            restingSummons[0].card.name,
            "power=",
            getPower(restingSummons[0])
        );


        return restingSummons[0];

    }


    //----------------------------------
    // ② 縦向きサモンを確認
    //----------------------------------
    // 自分のパワー以下なら
    // プレイヤーを攻撃する
    //
    // ※縦向きサモン自体には攻撃しない
    //----------------------------------

    const verticalSummons =
        playerField.filter(
            summon => {

                if(summon.destroyed){

                    return false;

                }

                if(summon.isRest){

                    return false;

                }

                return (
                    getPower(summon)
                    <=
                    attackerPower
                );

            }
        );


    //----------------------------------
    // 縦向きサモンが存在する場合
    // → プレイヤーを攻撃
    //----------------------------------

    if(
        verticalSummons.length > 0
    ){

        console.log(
            "CPU攻撃対象：縦向きサモンあり",
            "→ プレイヤーを攻撃"
        );


        return PLAYER;

    }


    //----------------------------------
    // ③ 攻撃可能な縦向きサモンなし
    // → プレイヤーを攻撃
    //----------------------------------

    console.log(
        "CPU攻撃対象：プレイヤー"
    );


    return PLAYER;

}

//======================================
// CPUサモン
//======================================

function cpuPlaySummon(){

    //----------------------------------
    // 既に召喚済み
    //----------------------------------

    if(cpuSummonUsedThisTurn){

        console.log(
            "CPUサモン使用済み"
        );

        cpuTurnStep = 2;

        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }


    //----------------------------------
    // 手札から候補取得
    //----------------------------------

    const candidates =
    enemyHandCards.filter(card=>{

        if(card.type !== "サモン"){

            return false;

        }


        //----------------------------------
        // CPU側の現在コスト
        //----------------------------------

        const currentCost =
            getCurrentCardCost(
                card,
                ENEMY
            );


        //----------------------------------
        // 召喚後に手札を2枚残せるか
        //----------------------------------

        return (
            enemyHandCards.length
            - 1
            - currentCost
            >=
            2
        );

    });


    //----------------------------------
    // 出せるサモンなし
    //----------------------------------

    if(
        candidates.length === 0
    ){

        console.log(
            "CPU召喚可能サモンなし"
        );

        cpuTurnStep = 2;

        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }


    //----------------------------------
    // コスト最大を選択
    //----------------------------------

    candidates.sort(
        (a,b)=>{

            const costA =
                getCurrentCardCost(
                    a,
                    ENEMY
                );

            const costB =
                getCurrentCardCost(
                    b,
                    ENEMY
                );

            return costB - costA;

        }
    );


    const card =
        candidates[0];


    //----------------------------------
    // 現在コスト取得
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    console.log(
        "CPU召喚選択",
        card.name,
        "元cost=",
        card.cost,
        "現在cost=",
        currentCost
    );


    //----------------------------------
    // 召喚
    //----------------------------------

    const result =
        cpuSummon(
            card
        );


    if(result){

        cpuSummonUsedThisTurn = true;

    }


    //----------------------------------
    // 次へ
    //----------------------------------

    cpuTurnStep = 2;


    setTimeout(
        runCpuTurnStep,
        2000
    );

}


//======================================
// CPUサモン召喚
//======================================

function cpuSummon(card){

    if(!card){

        return false;

    }


    //----------------------------------
    // 現在のコスト取得
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    console.log(
        "CPUサモンコスト",
        card.name,
        "元cost=",
        card.cost,
        "現在cost=",
        currentCost
    );


    //----------------------------------
    // 手札残数確認
    //----------------------------------

    if(
        enemyHandCards.length
        - 1
        - currentCost
        <
        2
    ){

        console.log(
            "CPUサモン：手札不足"
        );

        return false;

    }


    //----------------------------------
    // コストカード
    //----------------------------------

    const costCards =
selectCpuCostCards(
    card,
    currentCost
);


    //----------------------------------
    // コスト枚数確認
    //----------------------------------

    if(
        costCards.length <
        currentCost
    ){

        console.log(
            "CPUサモン：コスト不足"
        );

        return false;

    }


    //----------------------------------
    // コスト支払い
    //----------------------------------

    costCards.forEach(
        costCard=>{

            moveEnemyToCost(
                costCard
            );

        }
    );


    //----------------------------------
    // 召喚
    //----------------------------------

    const result =
    executeSummon(
        card,
        ENEMY
    );

    addBattleLog(
    `CPU：${card.name}を召喚`
);


    return result !== false;

}

//======================================
// CPUコスト移動
//======================================

function moveEnemyToCost(card){

    enemyHandCards =
    enemyHandCards.filter(
        c => c !== card
    );


    card.area =
    "enemyCost";


    card.setFaceDown(true);


    enemyCostCards.push(
        card
    );


    board.enemyCostCards =
    enemyCostCards;


    updateEnemyZoneDisplay();

}


//======================================
// CPUマギア使用
//======================================

function cpuPlayMagia(){

    //----------------------------------
    // フォローウィンド優先判定
    //----------------------------------

    const followWindInfo =
        getCpuFollowWindTarget();


    if(followWindInfo){

        //----------------------------------
        // 攻撃セットアップ用マギア
        //----------------------------------

        if(
            !cpuShouldUseAttackSetupMagia(
                followWindInfo.card
            )
        ){

            console.log(
                "CPU：フォローウィンド使用見送り",
                "使用後に意味のある攻撃なし"
            );

        }
        else{

            console.log(
                "CPU：フォローウィンドを使用",
                "対象=",
                followWindInfo.target.card.name
            );


            const result =
                cpuMagia(
                    followWindInfo.card,
                    followWindInfo.target
                );


            console.log(
                "CPU：フォローウィンド使用結果",
                result
            );


            //----------------------------------
            // 強制コスト型なら
            // プレイヤー選択待ち
            //----------------------------------

            if(
                followWindInfo.card.effect &&
                followWindInfo.card.effect.type ===
                "forceCost"
            ){

                console.log(
                    "CPU：フォローウィンドの選択待ち"
                );

                return;

            }


            //----------------------------------
            // 通常マギア
            //----------------------------------

            if(result){

                cpuTurnStep = 3;


                setTimeout(
                    runCpuTurnStep,
                    2000
                );


                return;

            }

        }

    }


    //----------------------------------
    // 使用可能マギア
    //----------------------------------

    const candidates =
        enemyHandCards.filter(
            card => {

                //----------------------------------
                // マギア以外
                //----------------------------------

                if(
                    card.type !== "マギア"
                ){

                    return false;

                }


                //----------------------------------
                // 攻撃セットアップ用マギア
                //----------------------------------

                if(
                    !cpuShouldUseAttackSetupMagia(
                        card
                    )
                ){

                    console.log(
                        "CPU：攻撃セットアップマギア候補外",
                        card.name
                    );


                    return false;

                }


                //----------------------------------
                // アクアストリーム
                // 専用使用条件
                //----------------------------------

                if(
                    card.name ===
                    "アクアストリーム"
                ){

                    const aquaInfo =
                        cpuShouldUseAquaStream();


                    if(!aquaInfo){

                        console.log(
                            "CPU：アクアストリーム候補外",
                            "使用条件不成立"
                        );


                        return false;

                    }

                }


                //----------------------------------
                // CPU側の現在コスト
                //----------------------------------

                const currentCost =
                    getCurrentCardCost(
                        card,
                        ENEMY
                    );


                //----------------------------------
                // 手札を2枚残せるか
                //----------------------------------

                if(
                    enemyHandCards.length
                    - 1
                    - currentCost
                    < 2
                ){

                    return false;

                }


                return true;

            }
        );


    //----------------------------------
    // 使用可能なし
    //----------------------------------

    if(
        candidates.length === 0
    ){

        console.log(
            "CPUマギア使用なし"
        );


        cpuTurnStep = 3;


        setTimeout(
            runCpuTurnStep,
            500
        );


        return;

    }


    //----------------------------------
    // 現在の候補から選択
    //----------------------------------

    const card =
        candidates[0];


    //----------------------------------
    // 現在コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    console.log(
        "CPUマギア選択",
        card.name,
        "元cost=",
        card.cost,
        "現在cost=",
        currentCost
    );


    //----------------------------------
    // 対象
    //----------------------------------

    const target =
        selectCpuMagiaTarget(
            card
        );


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(!target){

        console.log(
            "CPUマギア対象なし",
            card.name
        );


        cpuTurnStep = 3;


        setTimeout(
            runCpuTurnStep,
            500
        );


        return;

    }


    //----------------------------------
    // 攻撃セットアップ用マギア
    //----------------------------------
    // 対象決定後にも再確認
    //----------------------------------

    if(
        !cpuShouldUseAttackSetupMagia(
            card
        )
    ){

        console.log(
            "CPU：マギア使用見送り",
            card.name,
            "攻撃評価不成立"
        );


        cpuTurnStep = 3;


        setTimeout(
            runCpuTurnStep,
            500
        );


        return;

    }


    //----------------------------------
    // 使用
    //----------------------------------

    const result =
        cpuMagia(
            card,
            target
        );


    console.log(
        "CPUマギア使用結果",
        result
    );


    //----------------------------------
    // 強制コスト型
    //----------------------------------

    if(
        card.effect &&
        card.effect.type ===
        "forceCost"
    ){

        //----------------------------------
        // プレイヤー選択待ち
        //----------------------------------

        if(
            target === PLAYER &&
            board.handCards.length > 0
        ){

            console.log(
                "CPU：プレイヤーの手札選択待ち"
            );

            return;

        }


        //----------------------------------
        // 手札がない場合
        //----------------------------------

        console.log(
            "CPU：プレイヤー手札なし"
        );

    }


    //----------------------------------
    // 通常マギア
    //----------------------------------

    cpuTurnStep = 3;


    setTimeout(
        runCpuTurnStep,
        2000
    );

}

//======================================
// CPUマギア使用
//======================================

function cpuMagia(
    card,
    target
){

    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `CPU：${card.name}を使用`
    );

    addBattleLog(
        `CPU：対象 → ${
            getMagiaTargetLog(target)
        }`
    );


    //----------------------------------
    // CPUカード使用演出
    //----------------------------------

    showCpuCardAction(
        card,
        "MAGIA",
        target
    );


    console.log(
        "CPUマギア使用",
        card.name
    );


    //----------------------------------
    // CPU側の現在コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    console.log(
        "CPUマギアコスト",
        card.name,
        "元cost=",
        card.cost,
        "現在cost=",
        currentCost
    );


    //----------------------------------
    // マギア情報保存
    //----------------------------------

    magiaCard =
        card;

    magiaCard.owner =
        ENEMY;

    magiaTarget =
        target;


    //----------------------------------
    // CPUマギアを手札から除外
    //----------------------------------

    enemyHandCards =
        enemyHandCards.filter(
            c => c !== card
        );


    //----------------------------------
    // コスト支払い
    //----------------------------------

    payEnemyCost(
        currentCost
    );


    //----------------------------------
    // 強制コスト型
    //----------------------------------

    if(
        card.effect &&
        card.effect.type ===
        "forceCost"
    ){

        console.log(
            "CPU：強制コスト選択開始"
        );


        //----------------------------------
        // 対象発光
        //----------------------------------

        console.log(
    "★ CPUマギア対象デバッグ",
    "target=",
    target,
    "target===PLAYER=",
    target === PLAYER,
    "target==='player'=",
    target === "player"
);


        showCpuMagiaTargetHighlight(
            target
        );


        //----------------------------------
        // プレイヤーが手札を選択
        //----------------------------------

        startForceCostSelect(
            target
        );


        //----------------------------------
        // CPUターン停止
        //----------------------------------

        cpuWaiting = true;


        return true;

    }


    //----------------------------------
    // 通常マギア
    //----------------------------------

    resolveMagia();


    //----------------------------------
    // resetMagiaState()で消された後なので
    // もう一度対象を発光
    //----------------------------------

    setTimeout(()=>{

        console.log(
    "★ CPUマギア対象デバッグ",
    "target=",
    target,
    "target===PLAYER=",
    target === PLAYER,
    "target==='player'=",
    target === "player"
);




        showCpuMagiaTargetHighlight(
            target
        );

    },0);


    //----------------------------------
    // 対象発光解除
    //----------------------------------

    setTimeout(()=>{

        clearCpuMagiaTargetHighlight(
            target
        );

    },5000);


    return true;

}

//======================================
// CPUマギア対象選択
//======================================

function selectCpuMagiaTarget(card){

    if(
        !card ||
        !card.effect ||
        !card.effect.target
    ){

        return null;

    }


    const targets =
        card.effect.target;

//======================================
// フォローウィンド
// 召喚したばかりで攻撃できないCPUサモンのみ対象
//======================================

if(
    card.name === "フォローウィンド"
){

    const candidates =
        enemyField.filter(
            summon => {

                //----------------------------------
                // マギア対象不可
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return false;

                }


                //----------------------------------
                // 横向きなら対象外
                //----------------------------------

                if(
                    summon.isRest
                ){

                    return false;

                }


                //----------------------------------
                // すでに攻撃可能なら対象外
                //----------------------------------

                if(
                    summon.attackReady
                ){

                    return false;

                }


                //----------------------------------
                // summonTurnAttack持ちは対象外
                //----------------------------------

                if(
                    summon.card?.ability?.type ===
                    "summonTurnAttack"
                ){

                    return false;

                }


                //----------------------------------
                // ここまで来たら
                // 「召喚ターンで攻撃できないサモン」
                //----------------------------------

                return true;

            }
        );


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(
        candidates.length === 0
    ){

        console.log(
            "CPU：フォローウィンド対象なし"
        );

        return null;

    }


    //----------------------------------
    // 対象決定
    //----------------------------------

    const target =
        candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
        ];


    console.log(
        "CPU：フォローウィンド対象",
        target.card.name
    );


    return target;

}


    //======================================
    // バーニングエナジー
    //======================================

    if(
        card.name ===
        "バーニングエナジー"
    ){

        //----------------------------------
        // CPUの攻撃可能サモン
        //----------------------------------

        const candidates =
            enemyField.filter(
                summon => {


                    //----------------------------------
                    // マギア対象不可
                    //----------------------------------

                    if(
                        isMagiaTargetBlocked(
                            card,
                            summon
                        )
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 横向きなら対象外
                    //----------------------------------

                    if(
                        summon.isRest
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 召喚ターンは攻撃不可
                    // summonTurnAttackなら例外
                    //----------------------------------

                    if(
                        !summon.attackReady &&
                        summon.card.ability?.type !==
                        "summonTurnAttack"
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 対象サモンのパワー
                    //----------------------------------

                    const targetPower =
                        getPower(
                            summon
                        );


                    //----------------------------------
                    // プレイヤー側のタテ向きサモン
                    //----------------------------------

                    const strongPlayerSummon =
                        playerField.some(
                            playerSummon => {


                                //----------------------------------
                                // マギア対象不可
                                //----------------------------------

                                if(
                                    isMagiaTargetBlocked(
                                        card,
                                        playerSummon
                                    )
                                ){

                                    return false;

                                }


                                //----------------------------------
                                // タテ向きのみ
                                //----------------------------------

                                if(
                                    playerSummon.isRest
                                ){

                                    return false;

                                }


                                //----------------------------------
                                // パワー+3以上
                                //----------------------------------

                                return (
                                    getPower(
                                        playerSummon
                                    )
                                    >=
                                    targetPower + 3
                                );

                            }
                        );


                    //----------------------------------
                    // 強いタテ向きサモンがいる
                    //----------------------------------

                    if(
                        strongPlayerSummon
                    ){

                        console.log(
                            "CPU：バーニングエナジー対象外",
                            summon.card.name,
                            "targetPower=",
                            targetPower,
                            "プレイヤー側にパワー+3以上の",
                            "タテ向きサモンあり"
                        );

                        return false;

                    }


                    return true;

                }
            );


        //----------------------------------
        // 対象なし
        //----------------------------------

        if(
            candidates.length === 0
        ){

            console.log(
                "CPU：バーニングエナジー対象なし"
            );

            return null;

        }


        //----------------------------------
        // 対象決定
        //----------------------------------

        const target =
            candidates[
                Math.floor(
                    Math.random() *
                    candidates.length
                )
            ];


        console.log(
            "CPU：バーニングエナジー対象",
            target.card.name,
            "power=",
            getPower(target)
        );


        return target;

    }


    //======================================
    // 通常マギア
    //======================================

    const candidates = [];


    //----------------------------------
    // ダメージマギアか確認
    //----------------------------------

    const isDamageMagia =
        card.effect.type === "damage";


    const damageValue =
        Number(
            card.effect.value
        ) || 0;


    //======================================
    // 自分サモン
    // CPU自身のサモン
    //======================================

    if(
        targets.includes(
            "playerSummon"
        ) &&
        !isDamageMagia
    ){

        enemyField.forEach(
            summon => {

                //----------------------------------
                // 対象判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === ENEMY
                ){

                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 相手サモン
    // プレイヤーのサモン
    //======================================

    if(
        targets.includes(
            "enemySummon"
        )
    ){

        playerField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner !==
                    PLAYER
                ){

                    return;

                }


                //----------------------------------
                // ダメージマギアの場合
                // 倒せるサモンだけ候補
                //----------------------------------

                if(
                    isDamageMagia
                ){

                    const power =
                        getPower(
                            summon
                        );


                    if(
                        power > damageValue
                    ){

                        return;

                    }

                }


                candidates.push(
                    summon
                );

            }
        );

    }


    //======================================
    // 自分タテ向き
    //======================================

    if(
        targets.includes(
            "playerVerticalSummon"
        )
    ){

        enemyField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === ENEMY &&
                    !summon.isRest
                ){

                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 自分ヨコ向き
    //======================================

    if(
        targets.includes(
            "playerHorizontalSummon"
        )
    ){

        enemyField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === ENEMY &&
                    summon.isRest
                ){

                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 相手タテ向き
    // プレイヤーのサモン
    //======================================

    if(
        targets.includes(
            "enemyVerticalSummon"
        )
    ){

        playerField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === PLAYER &&
                    !summon.isRest
                ){

                    //----------------------------------
                    // ダメージマギア
                    //----------------------------------

                    if(
                        isDamageMagia
                    ){

                        const power =
                            getPower(
                                summon
                            );


                        if(
                            power > damageValue
                        ){

                            return;

                        }

                    }


                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 相手ヨコ向き
    // プレイヤーのサモン
    //======================================

    if(
        targets.includes(
            "enemyHorizontalSummon"
        )
    ){

        playerField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === PLAYER &&
                    summon.isRest
                ){

                    //----------------------------------
                    // ダメージマギア
                    //----------------------------------

                    if(
                        isDamageMagia
                    ){

                        const power =
                            getPower(
                                summon
                            );


                        if(
                            power > damageValue
                        ){

                            return;

                        }

                    }


                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 自分
    // CPU自身
    //======================================

    if(
        targets.includes(
            "player"
        )
    ){

        candidates.push(
            ENEMY
        );

    }


    //======================================
    // 相手
    // プレイヤー
    //======================================

    if(
        targets.includes(
            "enemy"
        )
    ){

        candidates.push(
            PLAYER
        );

    }


    //======================================
    // 対象なし
    //======================================

    if(
        candidates.length === 0
    ){

        return null;

    }


    //======================================
    // 対象決定
    //======================================

    return candidates[
        Math.floor(
            Math.random() *
            candidates.length
        )
    ];

}

//======================================
// CPUマギアコスト
//======================================

function payEnemyCost(cost, excludeCard = null){

    //----------------------------------
    // CPUコストカード選択
    //----------------------------------

    const costCards =
        selectCpuCostCards(
            excludeCard,
            cost
        );


    //----------------------------------
    // コスト支払い
    //----------------------------------

    costCards.forEach(
        card => {

            moveEnemyToCost(
                card
            );

        }
    );


    //----------------------------------
    // 表示更新
    //----------------------------------

    updateEnemyZoneDisplay();

}

//======================================
// CPUコスト回復
//======================================

function recoverEnemyCostCards(){

    if(
        enemyCostCards.length === 0
    ){

        return;

    }


    enemyCostCards.forEach(
        card=>{

            card.area =
            "enemyHand";

            card.setFaceDown(false);

            enemyHandCards.push(
                card
            );

        }
    );


    enemyCostCards = [];


    board.enemyCostCards =
    enemyCostCards;


    updateEnemyZoneDisplay();


    console.log(
        "CPUコスト回復完了"
    );

}


//======================================
// CPUターン終了
//======================================
function cpuFinishTurn(){

    console.log(
        "CPU行動終了"
    );


    cpuWaiting = false;


    //----------------------------------
    // モーダルを閉じる
    //----------------------------------

    closeHandModal();

    closeSummonActionModal();

    closeCoolModal();

    closeEnemyCoolModal();

    closeCostView();


    //----------------------------------
    // ターン終了
    //----------------------------------

    finishTurn();

}

function continueCpuTurn(){

console.log(
    "CPU再開",
    "cpuTurnStep=",
    cpuTurnStep,
    "cpuAttackIndex=",
    cpuAttackIndex,
    "cpuAttackQueue=",
    cpuAttackQueue.map(
        summon => summon.card.name
    )
);

    //----------------------------------
    // CPUターンでなければ終了
    //----------------------------------

    if(
        game.currentPlayer !== ENEMY
    ){

        return;

    }


    //----------------------------------
    // レジスト中なら待機
    //----------------------------------

    if(resistMode){

        console.log(
            "CPU再開待機：レジスト中"
        );

        return;

    }


    //----------------------------------
    // ブロック中なら待機
    //----------------------------------

    if(blockMode){

        console.log(
            "CPU再開待機：ブロック中"
        );

        return;

    }


    console.log(
        "CPU次の行動へ"
    );


    //----------------------------------
    // CPU行動を再開
    //----------------------------------

    setTimeout(()=>{

        runCpuTurnStep();

    },500);

}

//======================================
// CPUブロック判断
//======================================

function cpuShouldBlock(
    blockers,
    attacker
){

    //----------------------------------
    // ブロッカーなし
    //----------------------------------

    if(
        !blockers ||
        blockers.length === 0
    ){

        console.log(
            "CPUブロック判断：ブロッカーなし"
        );

        return false;

    }


    //----------------------------------
    // 攻撃者のパワー
    //----------------------------------

    const attackerPower =
        getPower(attacker);


    console.log(
        "CPUブロック判断",
        {
            attacker:
                attacker.card.name,

            attackerPower:
                attackerPower,

            blockers:
                blockers.map(
                    summon => ({
                        name:
                            summon.card.name,

                        power:
                            getPower(summon)
                    })
                )
        }
    );


    //----------------------------------
    // まず攻撃をレジストで
    // 1以下にできるか確認
    //----------------------------------

    const attackDamage =
        attackerPower;


    const resistCanReduce =
        cpuCanReduceAttackToOne(
            attackDamage
        );


    console.log(
        "CPUブロック判断：レジスト評価",
        {
            attackDamage:
                attackDamage,

            resistCanReduce:
                resistCanReduce
        }
    );


    //----------------------------------
    // ブロッカー評価
    //----------------------------------

    let bestBlocker = null;

    let bestScore = -Infinity;


    for(
        const blocker
        of blockers
    ){

        const blockerPower =
            getPower(blocker);


        //----------------------------------
        // 攻撃者を倒せる
        //----------------------------------

        if(
            blockerPower >
            attackerPower
        ){

            const score =
                1000;


            if(
                score >
                bestScore
            ){

                bestScore =
                    score;

                bestBlocker =
                    blocker;

            }

            continue;

        }


        //----------------------------------
        // 相打ち
        //----------------------------------

        if(
            blockerPower ===
            attackerPower
        ){

            const score =
                900;


            if(
                score >
                bestScore
            ){

                bestScore =
                    score;

                bestBlocker =
                    blocker;

            }

            continue;

        }


        //----------------------------------
        // ここからはブロッカーが
        // 攻撃者に倒されるケース
        //----------------------------------

        //----------------------------------
        // レジストでも1以下に
        // できないならブロック
        //----------------------------------

        if(
            !resistCanReduce
        ){

            //----------------------------------
            // パワー差が大きいほど
            // ブロック優先度を上げる
            //----------------------------------

            const powerDifference =
                attackerPower -
                blockerPower;


            const score =
                500 +
                powerDifference;


            if(
                score >
                bestScore
            ){

                bestScore =
                    score;

                bestBlocker =
                    blocker;

            }

            continue;

        }


        //----------------------------------
        // レジストで防げるなら
        // 無理にブロックしない
        //----------------------------------

        console.log(
            "CPUブロック判断：レジストで対応可能",
            blocker.card.name
        );

    }


    //----------------------------------
    // ブロックしない
    //----------------------------------

    if(
        !bestBlocker
    ){

        console.log(
            "CPUブロック判断：今回はブロックしない"
        );

        return false;

    }


    //----------------------------------
    // 選択したブロッカーを保存
    //----------------------------------

    cpuSelectedBlocker =
        bestBlocker;


    console.log(
        "CPUブロック判断：ブロックする",
        bestBlocker.card.name,
        "score=",
        bestScore
    );


    return true;

}

//======================================
// CPUが攻撃ダメージを1以下にできるか
//======================================

function cpuCanReduceAttackToOne(
    damage
){

    //----------------------------------
    // ダメージ1以下なら
    // そもそもレジスト不要
    //----------------------------------

    if(
        damage <= 1
    ){

        return true;

    }


    //----------------------------------
    // 現在使えるレジストを取得
    //----------------------------------

    const candidates =
        findCpuResistCards({

            type:
                GAME_EVENT.BEFORE_PLAYER_DAMAGE,

            player:
                ENEMY,

            damage:
                damage

        });


    //----------------------------------
    // 使用可能カードなし
    //----------------------------------

    if(
        !candidates ||
        candidates.length === 0
    ){

        console.log(
            "CPUブロック判断：レジストなし"
        );

        return false;

    }


    //----------------------------------
    // 1枚で1以下にできるか確認
    //----------------------------------

    for(
        const card
        of candidates
    ){

        let remaining =
            damage;


        switch(
            card.effect
        ){

            case "stoneGuard":

                remaining -= 3;

                break;


            case "groundwall":

                remaining -= 5;

                break;


            case "liquidVeil":

                remaining -= 2;

                break;


            case "waterBarrier":

                remaining = 0;

                break;


            case "rapidMove":

                remaining = 0;

                break;


            case "sandProtect":

                if(
                    damage === 1
                ){

                    remaining = 0;

                }

                break;

        }


        remaining =
            Math.max(
                0,
                remaining
            );


        console.log(
            "CPUブロック判断：レジスト評価",
            card.name,
            "damage=",
            damage,
            "remaining=",
            remaining
        );


        if(
            remaining <= 1
        ){

            return true;

        }

    }


    //----------------------------------
    // 1枚では防げない
    //----------------------------------

    return false;

}



function findCpuResistCards(event){

    console.log(
        "CPUレジスト候補検索",
        event
    );


    //----------------------------------
    // CPUレジスト使用判定
    //----------------------------------

    if(
        !shouldCpuUseResist(event)
    ){

        console.log(
            "CPUレジスト使用条件なし"
        );

        return [];

    }


    const result = [];


    //----------------------------------
    // CPUの手札から検索
    //----------------------------------

    for(
        const card of enemyHandCards
    ){

        //----------------------------------
        // レジストのみ
        //----------------------------------

        if(
            card.type !== "レジスト"
        ){

            continue;

        }


        //----------------------------------
        // このイベントで使用済み
        //----------------------------------

        if(card.usedThisEvent){

            continue;

        }


        //----------------------------------
        // 発動タイミング確認
        //----------------------------------

        if(
            Array.isArray(card.trigger)
        ){

            if(
                !card.trigger.includes(
                    event.type
                )
            ){

                continue;

            }

        }else{

            if(
                card.trigger !== event.type
            ){

                continue;

            }

        }


        //----------------------------------
        // コスト支払い可能か確認
        //----------------------------------

        if(
            !canPayCost(
                card,
                ENEMY
            )
        ){

            console.log(
                "CPUレジスト コスト不足",
                card.name
            );

            continue;

        }


        //----------------------------------
        // 個別条件確認
        //----------------------------------

        if(card.condition){

            const canUse =
                card.condition(event);


            if(!canUse){

                console.log(
                    "CPUレジスト 条件不一致",
                    card.name
                );

                continue;

            }

        }


        //----------------------------------
        // 使用可能
        //----------------------------------

        console.log(
            "CPUレジスト 使用可能",
            card.name
        );


        result.push(card);

    }


    console.log(
        "CPU使用可能レジスト",
        result.map(
            card=>card.name
        )
    );


    return result;

}


//======================================
// CPUレジスト使用判定
//======================================

function shouldCpuUseResist(event){

    console.log(
        "========== CPUレジスト判定 =========="
    );

    console.log(
        "event =",
        event
    );


    //----------------------------------
    // イベントなし
    //----------------------------------

    if(!event){

        console.log(
            "CPUレジスト不可：eventなし"
        );

        return false;

    }


    //======================================
    // CPUサモンへのダメージ
    // リキッドヴェール判定
    //======================================

    if(
        event.type ===
        GAME_EVENT.BEFORE_SUMMON_DAMAGE
    ){

        //----------------------------------
        // CPUサモンが対象か
        //----------------------------------

        if(
            !event.target ||
            event.target.owner !== ENEMY
        ){

            console.log(
                "CPUレジスト不可：CPUサモン対象ではありません"
            );

            return false;

        }


        //----------------------------------
        // マギアによるダメージか
        //----------------------------------

        if(
            event.sourceType !==
            "マギア"
        ){

            console.log(
                "CPUレジスト不可：マギアではありません"
            );

            return false;

        }


        //----------------------------------
        // damageタイプのマギアか
        //----------------------------------

        if(
            !event.source ||
            !event.source.effect ||
            event.source.effect.type !==
            "damage"
        ){

            console.log(
                "CPUレジスト不可：damageマギアではありません"
            );

            return false;

        }


        //----------------------------------
        // リキッドヴェール検索
        //----------------------------------

        const liquidVeil =
            enemyHandCards.find(
                card =>
                    card.name ===
                    "リキッドヴェール" &&
                    card.type ===
                    "レジスト"
            );


        if(!liquidVeil){

            console.log(
                "CPUレジスト不可：リキッドヴェールなし"
            );

            return false;

        }


        //----------------------------------
        // このイベントで使用済み
        //----------------------------------

        if(
            liquidVeil.usedThisEvent
        ){

            console.log(
                "CPUレジスト不可：リキッドヴェール使用済み"
            );

            return false;

        }


        //----------------------------------
        // コスト確認
        //----------------------------------

        if(
            !canPayCost(
                liquidVeil,
                ENEMY
            )
        ){

            console.log(
                "CPUレジスト不可：リキッドヴェール コスト不足"
            );

            return false;

        }


        //----------------------------------
        // 対象サモンの現在パワー
        //----------------------------------

        const power =
            getPower(
                event.target
            );


        //----------------------------------
        // 与えられるダメージ
        //----------------------------------

        const damage =
            Number(event.damage) || 0;


        //----------------------------------
        // パワー未満
        //----------------------------------

        if(
            damage < power
        ){

            console.log(
                "CPUレジスト不可：ダメージ不足",
                "power=",
                power,
                "damage=",
                damage
            );

            return false;

        }


        //----------------------------------
        // パワー+2以上
        //----------------------------------
        // リキッドヴェールは使わない
        //----------------------------------

        if(
            damage >= power + 2
        ){

            console.log(
                "CPUレジスト不可：ダメージ過剰",
                "power=",
                power,
                "damage=",
                damage
            );

            return false;

        }


        //----------------------------------
        // パワーと同じ
        // またはパワー+1
        //----------------------------------

        console.log(
            "CPUレジスト使用判定：YES",
            "リキッドヴェール",
            "target=",
            event.target.card.name,
            "power=",
            power,
            "damage=",
            damage
        );


        return true;

    }


    //======================================
    // ここからCPU本体へのダメージ
    //======================================

    if(
        event.type !==
        GAME_EVENT.BEFORE_PLAYER_DAMAGE
    ){

        console.log(
            "CPUレジスト不可：イベント違い",
            event.type
        );

        return false;

    }


    //----------------------------------
    // CPUが対象でなければ不可
    //----------------------------------

    if(
        event.player !== ENEMY
    ){

        console.log(
            "CPUレジスト不可：対象違い",
            "event.player =",
            event.player,
            "ENEMY =",
            ENEMY
        );

        return false;

    }


    //----------------------------------
    // 1ダメージ
    // サンドプロテクト候補
    //----------------------------------

    if(
        event.damage === 1
    ){

        console.log(
            "CPUレジスト使用判定：YES",
            "1ダメージなのでサンドプロテクト候補"
        );

        return true;

    }


    //----------------------------------
    // 2ダメージ以上
    //----------------------------------

    if(
        event.damage >= 2
    ){

        console.log(
            "CPUレジスト使用判定：YES",
            "damage =",
            event.damage
        );

        return true;

    }


    //----------------------------------
    // ライフ0になる場合
    //----------------------------------

    if(
        typeof enemyLife !== "undefined" &&
        enemyLife - event.damage <= 0
    ){

        console.log(
            "CPUレジスト使用判定：YES",
            "ライフ0"
        );

        return true;

    }


    //----------------------------------
    // 使用しない
    //----------------------------------

    console.log(
        "CPUレジスト使用判定：NO"
    );

    return false;

}


//======================================
// CPUレジスト最適カード選択
//======================================

function selectBestCpuResist(
    cards,
    damage,
    event = null
){

    if(
        !cards ||
        cards.length === 0 ||
        damage <= 0
    ){

        return null;

    }


    //----------------------------------
    // リキッドヴェール優先判定
    //----------------------------------

    if(
        event &&
        event.type ===
        GAME_EVENT.BEFORE_SUMMON_DAMAGE
    ){

        //----------------------------------
        // CPUサモンが対象
        //----------------------------------

        if(
            event.target &&
            event.target.owner === ENEMY
        ){

            //----------------------------------
            // プレイヤーのマギアによるダメージ
            //----------------------------------

            if(
                event.sourceType === "マギア" &&
                event.source &&
                event.source.effect &&
                event.source.effect.type === "damage"
            ){

                const liquidVeilCard =
                    cards.find(
                        card =>
                            card.effect ===
                            "liquidVeil"
                    );


                if(
                    liquidVeilCard
                ){

                    const power =
                        getPower(
                            event.target
                        );


                    //----------------------------------
                    // パワーと同じ
                    //----------------------------------

                    if(
                        damage === power
                    ){

                        console.log(
                            "CPUレジスト最優先：リキッドヴェール",
                            "target=",
                            event.target.card.name,
                            "power=",
                            power,
                            "damage=",
                            damage
                        );


                        return liquidVeilCard;

                    }


                    //----------------------------------
                    // パワー+1
                    //----------------------------------

                    if(
                        damage === power + 1
                    ){

                        console.log(
                            "CPUレジスト最優先：リキッドヴェール",
                            "target=",
                            event.target.card.name,
                            "power=",
                            power,
                            "damage=",
                            damage
                        );


                        return liquidVeilCard;

                    }


                    //----------------------------------
                    // パワー+2以上
                    // → リキッドヴェールを使わない
                    //----------------------------------

                    if(
                        damage >= power + 2
                    ){

                        console.log(
                            "リキッドヴェール不使用：ダメージ過剰",
                            "target=",
                            event.target.card.name,
                            "power=",
                            power,
                            "damage=",
                            damage
                        );

                    }

                }

            }

        }

    }


    //----------------------------------
    // 1ダメージなら
    // サンドプロテクトを最優先
    //----------------------------------

    if(
        damage === 1
    ){

        const sandProtectCard =
            cards.find(
                card =>
                    card.effect ===
                    "sandProtect"
            );


        if(
            sandProtectCard
        ){

            console.log(
                "CPUレジスト最優先：サンドプロテクト"
            );


            return sandProtectCard;

        }

    }


    //----------------------------------
    // 各レジストの軽減量
    //----------------------------------

    function getResistReduction(card){

        if(!card){

            return 0;

        }


        switch(card.effect){

            case "stoneGuard":

                return 3;


            case "groundwall":

                return 5;


            case "liquidVeil":

                return 2;


            case "waterBarrier":

                return damage;


            case "rapidMove":

                return damage;


            case "sandProtect":

                if(
                    damage === 1
                ){

                    return 1;

                }

                return 0;


            default:

                return 0;

        }

    }


    //----------------------------------
    // 使用可能カードを評価
    //----------------------------------

    const candidates =
        cards
        .map(card=>{

            const reduction =
                getResistReduction(
                    card
                );


            const remaining =
                Math.max(
                    0,
                    damage - reduction
                );


            return {

                card:
                    card,

                reduction:
                    reduction,

                remaining:
                    remaining

            };

        })
        .filter(
            item =>
                item.reduction > 0
        );


    if(
        candidates.length === 0
    ){

        return null;

    }


    //----------------------------------
    // 1枚で0にできるカードを優先
    //----------------------------------

    const finishers =
        candidates.filter(
            item =>
                item.remaining === 0
        );


    if(
        finishers.length > 0
    ){

        finishers.sort(
            (a,b) =>
                a.reduction -
                b.reduction
        );


        console.log(
            "CPUレジスト最適選択",
            finishers[0].card.name,
            "damage=",
            damage,
            "軽減=",
            finishers[0].reduction
        );


        return finishers[0].card;

    }


    //----------------------------------
    // 1枚で0にできない場合
    // 最も大きく軽減するカード
    //----------------------------------

    candidates.sort(
        (a,b) =>
            b.reduction -
            a.reduction
    );


    console.log(
        "CPUレジスト最適選択",
        candidates[0].card.name,
        "damage=",
        damage,
        "軽減=",
        candidates[0].reduction
    );


    return candidates[0].card;

}

//======================================
// CPUコストカード選択
//======================================

function selectCpuCostCards(
    excludeCard,
    cost
){

    //----------------------------------
    // コスト候補
    //----------------------------------

    const candidates =
        enemyHandCards.filter(
            card => card !== excludeCard
        );


    //----------------------------------
    // 種類ごとに分類
    //----------------------------------

    const summons =
        candidates.filter(
            card => card.type === "サモン"
        );

    const magias =
        candidates.filter(
            card => card.type === "マギア"
        );

    const resists =
        candidates.filter(
            card => card.type === "レジスト"
        );


    //----------------------------------
    // 各種類をランダムに並べる
    //----------------------------------

    summons.sort(
        () => Math.random() - 0.5
    );

    magias.sort(
        () => Math.random() - 0.5
    );

    resists.sort(
        () => Math.random() - 0.5
    );


    //----------------------------------
    // 優先順位順にまとめる
    //----------------------------------

    const orderedCards = [

        ...summons,
        ...magias,
        ...resists

    ];


    //----------------------------------
    // 必要枚数だけ取得
    //----------------------------------

    const costCards =
        orderedCards.slice(
            0,
            cost
        );


    console.log(
        "CPUコスト選択",
        costCards.map(
            card => card.name
        )
    );


    return costCards;

}

//======================================
// アクアストリーム使用判定
// CPU → PLAYERのサモンのみ
//======================================

function cpuShouldUseAquaStream(){

    //----------------------------------
    // アクアストリーム検索
    //----------------------------------

    const aquaStream =
        enemyHandCards.find(
            card =>
                card.name === "アクアストリーム" &&
                card.type === "マギア"
        );


    if(!aquaStream){

        return null;

    }


    //----------------------------------
    // CPU側に攻撃可能サモンがいるか
    //----------------------------------

    const attackableSummon =
        enemyField.find(
            summon => {

                if(!summon){

                    return false;

                }


                //----------------------------------
                // 横向きなら攻撃不可
                //----------------------------------

                if(
                    summon.isRest
                ){

                    return false;

                }


                //----------------------------------
                // 召喚ターンは攻撃不可
                // summonTurnAttackなら例外
                //----------------------------------

                if(
                    !summon.attackReady &&
                    summon.card.ability?.type !==
                    "summonTurnAttack"
                ){

                    return false;

                }


                return true;

            }
        );


    if(!attackableSummon){

        console.log(
            "CPU：アクアストリーム使用不可",
            "攻撃可能サモンなし"
        );

        return null;

    }


    //----------------------------------
    // プレイヤー側サモンのみ取得
    //----------------------------------

    const targets =
        playerField.filter(
            summon => {

                if(!summon){

                    return false;

                }


                //----------------------------------
                // PLAYERのサモンのみ
                //----------------------------------

                if(
                    summon.owner !== PLAYER
                ){

                    return false;

                }


                //----------------------------------
                // 横向きサモンは対象外
                //----------------------------------

                if(
                    summon.isRest
                ){

                    console.log(
                        "CPU：アクアストリーム対象外",
                        summon.card.name,
                        "横向き"
                    );

                    return false;

                }


                //----------------------------------
                // 相手のマギア対象不可
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        aquaStream,
                        summon
                    )
                ){

                    console.log(
                        "CPU：アクアストリーム対象外",
                        summon.card.name
                    );

                    return false;

                }


                return true;

            }
        );


    //----------------------------------
    // プレイヤーサモンなし
    //----------------------------------

    if(
        targets.length === 0
    ){

        console.log(
            "CPU：アクアストリーム使用不可",
            "対象となるプレイヤーサモンなし"
        );

        return null;

    }


    //----------------------------------
    // コスト確認
    //----------------------------------

    if(
        !canPayCost(
            aquaStream,
            ENEMY
        )
    ){

        console.log(
            "CPU：アクアストリーム コスト不足"
        );

        return null;

    }


    //----------------------------------
    // 使用情報
    //----------------------------------

    return {

        card:
            aquaStream,

        attacker:
            attackableSummon,

        targets:
            targets

    };

}

//======================================
// CPU：フォローウィンド対象確認
//======================================

function getCpuFollowWindTarget(){

    //----------------------------------
    // フォローウィンドが手札にあるか
    //----------------------------------

    const followWind =
        enemyHandCards.find(
            card =>
                card.name === "フォローウィンド" &&
                card.type === "マギア"
        );


    if(!followWind){

        return null;

    }


    //----------------------------------
    // 召喚したばかりのサモンを探す
    //----------------------------------

    const target =
        enemyField.find(
            summon => {

                if(!summon){

                    return false;

                }


                //----------------------------------
                // 召喚ターンなので攻撃不可
                //----------------------------------

                if(summon.attackReady){

                    return false;

                }


                //----------------------------------
                // タテ向き
                //----------------------------------

                if(summon.isRest){

                    return false;

                }


                return true;

            }
        );


    if(!target){

        return null;

    }


    //----------------------------------
    // 現在コスト確認
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            followWind,
            ENEMY
        );


    //----------------------------------
    // コスト支払い可能か
    //----------------------------------

    if(
        enemyHandCards.length
        - 1
        - currentCost
        < 2
    ){

        return null;

    }


    return {

        card:
            followWind,

        target:
            target

    };

}

//======================================
// ウィンドプレッシャー使用判定
// 最初の攻撃前のみ
//======================================

function cpuShouldUseWindPressure(){

    //----------------------------------
    // ウィンドプレッシャー検索
    //----------------------------------

    const windPressure =
        enemyHandCards.find(
            card =>
                card.name === "ウィンドプレッシャー" &&
                card.type === "マギア"
        );


    if(!windPressure){

        return null;

    }


    //----------------------------------
    // プレイヤー手札枚数
    //----------------------------------

    const playerHandCount =
        board.handCards.length;


    //----------------------------------
    // 手札が0枚なら使用しない
    //----------------------------------

    if(
        playerHandCount === 0
    ){

        console.log(
            "CPU：ウィンドプレッシャー使用しない",
            "PLAYER手札=0"
        );

        return null;

    }


    //----------------------------------
    // 4枚以下なら使用候補
    //----------------------------------

    if(
        playerHandCount > 4
    ){

        console.log(
            "CPU：ウィンドプレッシャー使用条件不成立",
            "PLAYER手札=",
            playerHandCount
        );

        return null;

    }


    //----------------------------------
    // 現在コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            windPressure,
            ENEMY
        );


    //----------------------------------
    // コスト確認
    //----------------------------------

    if(
        !canPayCost(
            windPressure,
            ENEMY
        )
    ){

        console.log(
            "CPU：ウィンドプレッシャー コスト不足"
        );

        return null;

    }


    //----------------------------------
    // 使用情報
    //----------------------------------

    return {

        card:
            windPressure,

        target:
            PLAYER

    };

}

//======================================
// ウィンドプレッシャー使用
//======================================

function cpuUseWindPressure(){

    const info =
        cpuShouldUseWindPressure();


    if(!info){

        return false;

    }


    console.log(
        "CPU：ウィンドプレッシャー使用",
        "PLAYER手札=",
        board.handCards.length
    );


    //----------------------------------
    // プレイヤーを対象に使用
    //----------------------------------

    const result =
        cpuMagia(
            info.card,
            info.target
        );


    console.log(
        "CPU：ウィンドプレッシャー使用結果",
        result
    );


    return result;

}


//======================================
// CPUマギア対象発光
//======================================

function showCpuMagiaTargetHighlight(target){

    if(!target){

        return;

    }


    //----------------------------------
    // サモン
    //----------------------------------

    if(
        target.view &&
        typeof target.view.getElement ===
        "function"
    ){

        target.view
            .getElement()
            .classList.add(
                "magia-target"
            );


        console.log(
            "★ CPUマギア対象発光：サモン",
            target.card?.name
        );


        return;

    }


//----------------------------------
// PLAYER
//----------------------------------

if(
    target === PLAYER ||
    target === "player"
){

    const playerIcon =
        document.getElementById(
            "player-icon"
        );


    if(playerIcon){

        playerIcon.classList.add(
            "magia-target"
        );


        console.log(
            "★ CPUマギア対象発光：PLAYER"
        );

    }

}
}

//======================================
// CPUマギア対象発光解除
//======================================

function clearCpuMagiaTargetHighlight(target){

    if(!target){

        return;

    }


    //----------------------------------
    // サモン
    //----------------------------------

    if(
        target.view &&
        typeof target.view.getElement ===
        "function"
    ){

        target.view
            .getElement()
            .classList.remove(
                "magia-target"
            );

        return;

    }

//----------------------------------
// PLAYER
//----------------------------------

if(
    target === PLAYER ||
    target === "player"
){

    const playerIcon =
        document.getElementById(
            "player-icon"
        );


    if(playerIcon){

        playerIcon.classList.remove(
            "magia-target"
        );

    }

}

}


//======================================
// CPU：攻撃に意味があるか判定
//======================================

function cpuHasMeaningfulAttack(){

    //----------------------------------
    // 現在の攻撃キューを作成
    //----------------------------------

    const oldQueue =
        Array.isArray(cpuAttackQueue)
        ? [...cpuAttackQueue]
        : [];

    const oldIndex =
        cpuAttackIndex;


    createCpuAttackQueue();


    //----------------------------------
    // 攻撃可能サモンなし
    //----------------------------------

    if(
        cpuAttackQueue.length === 0
    ){

        cpuAttackQueue =
            oldQueue;

        cpuAttackIndex =
            oldIndex;

        return false;

    }


    //----------------------------------
    // 攻撃可能サモンを確認
    //----------------------------------

    const meaningful =
        cpuAttackQueue.some(
            attacker => {

                if(!attacker){

                    return false;

                }


                //----------------------------------
                // 攻撃者のパワー
                //----------------------------------

                const attackPower =
                    getPower(
                        attacker
                    );


                //----------------------------------
                // プレイヤー側の
                // タテ向きサモン
                //----------------------------------

                const blockers =
                    playerField.filter(
                        summon => {

                            if(!summon){

                                return false;

                            }


                            if(
                                summon.owner !== PLAYER
                            ){

                                return false;

                            }


                            if(
                                summon.isRest
                            ){

                                return false;

                            }


                            return true;

                        }
                    );


                //----------------------------------
                // ブロッカーなし
                //----------------------------------

                if(
                    blockers.length === 0
                ){

                    return true;

                }


                //----------------------------------
                // 攻撃者より弱いブロッカーがいるか
                //----------------------------------

                const canBreakBlocker =
                    blockers.some(
                        blocker =>
                            attackPower >=
                            getPower(blocker)
                    );


                if(
                    canBreakBlocker
                ){

                    return true;

                }


                //----------------------------------
                // 全ブロッカーに負ける
                //----------------------------------
                // 現段階では無意味な攻撃と判断

                return false;

            }
        );


    //----------------------------------
    // 攻撃キューを元に戻す
    //----------------------------------

    cpuAttackQueue =
        oldQueue;

    cpuAttackIndex =
        oldIndex;


    return meaningful;

}

//======================================
// 攻撃セットアップ用マギア判定
//======================================

function isCpuAttackSetupMagia(card){

    if(!card){

        return false;

    }


    return (
        card.name === "アクアストリーム" ||
        card.name === "フォローウィンド" ||
        card.name === "ウィンドプレッシャー"
    );

}

//======================================
// CPU：攻撃セットアップマギア使用判定
//======================================

function cpuShouldUseAttackSetupMagia(
    card
){

    if(
        !isCpuAttackSetupMagia(card)
    ){

        return true;

    }


    //----------------------------------
    // 攻撃可能なサモンがない
    //----------------------------------

    if(
        !cpuHasMeaningfulAttack()
    ){

        console.log(
            "CPU：攻撃セットアップマギア使用しない",
            card.name,
            "使用後に意味のある攻撃なし"
        );

        return false;

    }


    //----------------------------------
    // 使用可能
    //----------------------------------

    console.log(
        "CPU：攻撃セットアップマギア使用候補",
        card.name
    );


    return true;

}
