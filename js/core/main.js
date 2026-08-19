//==================================================
// Elementis Summoner
// main.js
// Step2-5 完成版
// Part1-1
//==================================================


//==================================================
// グローバル
//==================================================

let board = null;

// 情報パネルで選択中のカード
let selectedHandCard = null;

// 召喚中のカード
let summonCard = null;

// コストに選んだカード
let selectedCostCards = [];

// コスト確認待ち
let costConfirm = false;

// このターン召喚済みか
let summonUsedThisTurn = false;

// CPU手札
let enemyHandCards = [];

// CPUコストゾーン
let enemyCostCards = [];

// CPUクールゾーン
let enemyCoolCards = [];

let playerWins = 0;
let enemyWins = 0;

//======================================
// 対戦中の開始手札使用履歴
//======================================

let playerStartingCardIds = [];

let enemyStartingCardIds = [];

//======================================
// 現在詳細表示中カード
//======================================

let selectedInfoCard = null;

// 選択中の場サモン
let selectedSummon = null;

let selectedFieldCard = null;

// モーダルで表示中の相手サモン
let selectedEnemySummon = null;


// クールゾーンで選択中
let selectedCoolCard = null;

// クールゾーン回収モード
let coolRecoveryMode = false;

// 表示中のクールゾーン所有者
let currentCoolOwner = PLAYER;

let coolViewMode = false;

//======================================
// レジスト状態
//======================================

let resistMode = false;

let resistEvent = null;

let selectableResistCards = [];

// コスト支払い中のレジスト
let resistUsingCard = null;

// レジスト用コスト
let selectedResistCostCards = [];

// コスト決定済み
let resistCostConfirm = false;

//======================================
// ターン演出中
//======================================

let turnAnimation = false;

//==================================================
// DOM読み込み
//==================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeGame
);


//==================================================
// 初期化
//==================================================

function initializeGame(){


    //------------------------------------------
    // Board生成
    //------------------------------------------

    board = new Board();



    //------------------------------------------
    // ボタン登録
    //------------------------------------------


    //=========================
    // 使用ボタン
    //=========================

    const summonButton =
    document.getElementById(
        "summon-button"
    );

    if(summonButton){

        summonButton.onclick = ()=>{

            if(!selectedHandCard){

                return;

            }


            useCard(
                selectedHandCard
            );

        };

    }



    //=========================
    // コスト決定ボタン
    //=========================

    const confirmButton =
    document.getElementById(
        "confirm-button"
    );


    if(confirmButton){

        confirmButton.onclick = ()=>{

            payCost();

        };

    }



    //=========================
    // コストキャンセル
    //=========================

    const cancelButton =
    document.getElementById(
        "cancel-button"
    );


    if(cancelButton){

        cancelButton.onclick =
        cancelSummon;

    }



    //=========================
    // 手札モーダル閉じる
    //=========================

    const closeHandModalButton =
    document.getElementById(
        "close-hand-modal"
    );


    if(closeHandModalButton){

        closeHandModalButton.onclick =
        closeHandModal;

    }



    //=========================
    // クールモーダル閉じる
    //=========================

    const closeCoolButton =
    document.getElementById(
        "close-cool-button"
    );


    if(closeCoolButton){

        closeCoolButton.onclick = ()=>{


            //----------------------------------
            // 閲覧モード
            //----------------------------------

            if(coolViewMode){

                coolViewMode = false;

                closeCoolModal();


                // 回収中なら復帰
                if(coolRecoveryMode){

                    openCoolModal(
                        currentCoolOwner,
                        true
                    );

                }


                return;

            }



            //----------------------------------
            // 通常閲覧
            //----------------------------------

            if(!coolRecoveryMode){

                closeCoolModal();

                return;

            }



            //----------------------------------
            // 回収モード
            //----------------------------------

            const success =
            recoverCoolCards(
                game.currentPlayer
            );


            if(!success){

                return;

            }

        };

    }



    //=========================
    // ターン終了ボタン
    //=========================

    const endTurnButton =
    document.getElementById(
        "endturn-button"
    );


    if(endTurnButton){

        endTurnButton.onclick =
        endTurn;

    }



    //------------------------------------------
    // サモン操作
    //------------------------------------------

    const attackButton =
    document.getElementById(
        "attack-button"
    );


    if(attackButton){

        attackButton.onclick = ()=>{


            if(!selectedSummon){

                return;

            }


            startAttack(
                selectedSummon
            );


            closeSummonActionModal();


        };

    }



    const closeSummonButton =
    document.getElementById(
        "close-summon-modal"
    );


    if(closeSummonButton){

        closeSummonButton.onclick =
        closeSummonActionModal;

    }



    //------------------------------------------
    // コスト表示
    //------------------------------------------

    board.updateCostCount();



    //------------------------------------------
    // 初期カード生成
    //------------------------------------------

    setupGame();


    //------------------------------------------
    // マッチ勝利数初期化
    //------------------------------------------

    playerWins = 0;

    enemyWins = 0;



    //------------------------------------------
    // 開始手札履歴初期化
    //------------------------------------------

    playerStartingCardIds = [];

    enemyStartingCardIds = [];



    //------------------------------------------
    // 勝利スター表示
    //------------------------------------------

    updateWinStars();



    //------------------------------------------
    // LIFE表示
    //------------------------------------------

    updateLifeDisplay();



    //------------------------------------------
    // ★ マッチ開始
    // 1戦目の先攻をランダム決定
    //------------------------------------------

    startMatch();



    //------------------------------------------
    // クールゾーン表示
    //------------------------------------------

    const playerCoolArea =
    document.querySelector(
        "#player-header .cool-area"
    );


    if(playerCoolArea){

        playerCoolArea.onclick = ()=>{

            openCoolModal(
                PLAYER,
                false
            );

        };

    }



    const enemyCoolArea =
    document.querySelector(
        "#enemy-header .cool-area"
    );


    if(enemyCoolArea){

        enemyCoolArea.onclick = ()=>{

            openEnemyCoolModal();

        };

    }



    //------------------------------------------
    // ボタン初期状態
    //------------------------------------------

    updateGameState();

}

//==================================================
// 初期配置
//==================================================

function setupGame(){

    //----------------------------------
    // フィールドデータ初期化
    //----------------------------------

    playerField.length = 0;

    enemyField.length = 0;

    board.setPlayerCards([]);

    board.setEnemyCards([]);


    //----------------------------------
    // 手札データ初期化
    //----------------------------------

    board.setHandCards([]);

    enemyHandCards = [];


    //----------------------------------
    // コストゾーン初期化
    //----------------------------------

    board.costCards = [];

    enemyCostCards = [];

    board.enemyCostCards = [];


    //----------------------------------
    // クールゾーン初期化
    //----------------------------------

    board.playerCoolCards = [];

    enemyCoolCards = [];

    board.enemyCoolCards = [];


    //----------------------------------
    // 新しい開始手札を生成
    //----------------------------------

    const playerHand =
        createTestHand();


    const enemyHand =
        createEnemyTestHand();


    //----------------------------------
    // プレイヤー手札
    //----------------------------------

    board.setHandCards(
        playerHand
    );


    //----------------------------------
    // CPU手札
    //----------------------------------

    enemyHandCards =
        enemyHand;


    //----------------------------------
    // 表示更新
    //----------------------------------

    board.updateCostCount();

    board.updateCoolCount();

    updateEnemyZoneDisplay();

}

//==================================================
// Card生成
//==================================================

function createCard(
    cardData,
    area = "field",
    owner = null
){

    if(!cardData){

        return null;

    }


    const card = new Card({

        id: cardData.id,

        name: cardData.name,

        image: cardData.image,

        cost: cardData.cost ?? 0,

        power: cardData.power ?? 0,

        type: cardData.type ?? "",

        element: cardData.element,

        text: cardData.text ?? "",

        trigger:
        cardData.trigger ?? null,

        condition:
        cardData.condition ?? null,

        effect:
        cardData.effect ?? null,

        // ★ サモン能力
        ability:
        cardData.ability ?? null

    });


    card.area = area;

    card.owner = owner;


    card.onClick(
        onCardClick
    );


    return card;
}


//=========================
// カードクリック
//=========================

function onCardClick(card){

    console.log(
        "クリックカード",
        card
    );

    //----------------------------------
    // マギア対象選択中
    //----------------------------------

    if(magiaTargetMode){

        hideActionGuide();

    }


    if(forceCostMode){

        if(
            card.area === "hand" &&
            forceCostPlayer === PLAYER
        ){

            selectForceCostCard(card);

        }

        return;

    }

if(forceCostMode){

    if(
        card.area === "hand" &&
        forceCostPlayer === PLAYER
    ){

        selectForceCostCard(card);

    }

    return;

}


//----------------------------------
// レジスト処理中
//----------------------------------

if(
    resistMode &&
    card.area === "field"
){

    console.log(
        "レジスト中：場カード選択"
    );


    //----------------------------------
    // 前回の選択解除
    //----------------------------------

    if(selectedInfoCard){

        selectedInfoCard.setSelected(false);

    }


    if(selectedHandCard){

        selectedHandCard.setSelected(false);

    }


    //----------------------------------
    // 今回のカードを選択
    //----------------------------------

    selectedInfoCard = card;

    card.setSelected(true);


    //----------------------------------
    // カード情報表示
    //----------------------------------

    showCardInfo(card);


    return;

}

    //----------------------------------
    // ターン演出中
    //----------------------------------
    if(turnAnimation){
        return;
    }

    //----------------------------------
    // 攻撃中は手札操作禁止
    //----------------------------------

    if(
        summonCard &&
        !resistMode &&
        (
            card.area === "field" ||
            card.area === "enemyField"
        )

    ){
        return;
    }


    //----------------------------------
    // コスト選択中は場操作禁止
    //----------------------------------

    if(
        summonCard &&
        (
            card.area === "field" ||
            card.area === "enemyField"
        )
    ){

        return;
    }

    console.log(
        "クリックカード",
        card,
        "area=",
        card.area
    );


//----------------------------------
// マギア対象選択中
//----------------------------------
if(magiaTargetMode){

    //----------------------------------
// クールゾーン
//----------------------------------

if(
    card.area === "cool"
){

    //----------------------------------
    // マギア対象として有効か確認
    //----------------------------------

    if(
        isValidMagiaTarget(
            magiaCard,
            card
        )
    ){

        //----------------------------------
        // 対象決定
        //----------------------------------

        magiaTarget =
            card;


        magiaTargetMode =
            false;


        clearMagiaHighlight();


        console.log(
            "マギア対象決定：クールゾーン",
            card.name
        );


        startMagiaCost();


        return;

    }


    //----------------------------------
    // 対象外なら何もしない
    //----------------------------------

    console.log(
        "マギア対象外：クールゾーン",
        card.name
    );

    return;

}


    //----------------------------------
    // サモン
    //----------------------------------

    if(
        card.area === "field" ||
        card.area === "enemyField"
    ){

        const summon =
            findSummonByView(card);


        if(!summon){

            return;

        }


        //----------------------------------
        // 対象として有効か確認
        //----------------------------------

        if(
            !isValidMagiaTarget(
                magiaCard,
                summon
            )
        ){

            console.log(
                "マギア対象外",
                summon.card.name
            );

            return;

        }


        //----------------------------------
        // 対象決定
        //----------------------------------

        magiaTarget =
            summon;


        magiaTargetMode =
            false;


        clearMagiaHighlight();


        console.log(
            "マギア対象決定",
            summon.card.name
        );


        startMagiaCost();


        return;

    }


    //----------------------------------
    // プレイヤー対象
    //----------------------------------

    if(
        card.area === "player" ||
        card === PLAYER ||
        card === "player"
    ){

        if(
            isValidMagiaTarget(
                magiaCard,
                PLAYER
            )
        ){

            magiaTarget =
                PLAYER;


            magiaTargetMode =
                false;


            clearMagiaHighlight();


            console.log(
                "マギア対象決定：自分"
            );


            startMagiaCost();

        }


        return;

    }


    //----------------------------------
    // 自分クールゾーン
    //----------------------------------

    if(
        card.area === "cool"
    ){

        if(
            isValidMagiaTarget(
                magiaCard,
                card
            )
        ){

            magiaTarget =
                card;


            magiaTargetMode =
                false;


            clearMagiaHighlight();


            console.log(
                "マギア対象決定：クールゾーン",
                card.name
            );


            startMagiaCost();

        }


        return;

    }


    //----------------------------------
    // 相手プレイヤー
    //----------------------------------

    if(
        card.area === "enemy" ||
        card === ENEMY ||
        card === "enemy"
    ){

        if(
            isValidMagiaTarget(
                magiaCard,
                ENEMY
            )
        ){

            magiaTarget =
                ENEMY;


            magiaTargetMode =
                false;


            clearMagiaHighlight();


            console.log(
                "マギア対象決定：相手"
            );


            startMagiaCost();

        }


        return;

    }


    //----------------------------------
    // 対象外クリック
    //----------------------------------

    resetMagiaState();

    return;

}

//======================================
// ブロック中
//======================================

if(blockMode){

    //----------------------------------
    // 前回の選択解除
    //----------------------------------

    if(selectedInfoCard){

        selectedInfoCard.setSelected(false);

    }


    if(selectedHandCard){

        selectedHandCard.setSelected(false);

    }


    //----------------------------------
    // 今回クリックしたカードを選択
    //----------------------------------

    selectedInfoCard = card;

    card.setSelected(true);


    //----------------------------------
    // 手札
    //----------------------------------

    if(card.area === "hand"){

        showCardInfo(card);

        return;

    }


    //----------------------------------
    // 場カード
    //----------------------------------

    if(
        card.area === "field" ||
        card.area === "enemyField"
    ){

        const summon =
        findSummonByView(card);


        if(!summon){

            return;

        }


        //----------------------------------
        // カード情報表示
        //----------------------------------

        showCardInfo(
            summon.card
        );


        //----------------------------------
        // ブロック可能ならボタン表示
        //----------------------------------

        if(
            selectableBlockSummons.includes(
                summon
            )
        ){

            updateCardAction(
                card
            );

        }


        return;

    }


    //----------------------------------
    // その他のカード
    //----------------------------------

    showCardInfo(card);

    return;

}


//======================================
// レジスト コスト選択中
//======================================

if(resistUsingCard){

    console.log(
        "レジストコスト選択中",
        card.name
    );


    if(card === resistUsingCard){

        return;

    }


    if(card.area === "hand"){

        selectResistCostCard(card);

    }


    return;

}

//----------------------------------
// レジスト選択中
//----------------------------------

if(resistMode){


    //----------------------------------
    // 前回選択解除
    //----------------------------------

    if(selectedInfoCard){

        selectedInfoCard.setSelected(false);

    }


    if(selectedHandCard){

        selectedHandCard.setSelected(false);

    }



    //----------------------------------
    // 今回クリックしたカードを保存
    //----------------------------------

    selectedInfoCard = card;


    card.setSelected(true);



    //----------------------------------
    // 使用可能レジスト
    //----------------------------------

if(
    selectableResistCards.includes(card)
){

    selectedHandCard = card;


    showCardInfo(card);


    updateButtons();


    return;

}
//----------------------------------
// 使用不可カード
//----------------------------------

selectedHandCard = null;

updateButtons();

showCardInfo(card);

return;



    //----------------------------------
    // その他カード
    //----------------------------------

    showCardInfo(card);


    return;

}


    //----------------------------------
    // 場サモン
    //----------------------------------

    if(
    card.area === "field" ||
    card.area === "enemyField"
){

    const summon =
    findSummonByView(card);


    if(!summon){

        return;

    }


    //----------------------------------
    // 攻撃中
    //----------------------------------

    if(isAttacking()){


        executeAttack(
            attackingSummon,
            summon
        );


        return;

    }



//----------------------------------
// 通常表示
//----------------------------------

clearHandSelection();

clearFieldSelection();

selectedSummon = summon;

card.setSelected(true);

showCardInfo(
    card
);

return;

}


    //----------------------------------
    // サモン・マギア コスト選択中
    //----------------------------------

    if(summonCard){

        if(card === summonCard){

            return;

        }

        if(card.area === "hand"){

            selectCostCard(card);

        }

        return;

    }

    //----------------------------------
// 攻撃中に別カードをクリック
// → 攻撃キャンセル
//----------------------------------

if(isAttacking()){

    console.log(
        "攻撃キャンセル：別カードをクリック"
    );

    hideActionGuide();

    resetAttackState();

    updateUsableCardHighlight();

    return;

}


//----------------------------------
// 手札以外
//----------------------------------

if(card.area !== "hand"){

    return;

}

    //----------------------------------
    // 場モーダル閉じる
    //----------------------------------

    closeSummonActionModal();

    //----------------------------------
    // 前の選択解除
    //----------------------------------

    if(
        selectedHandCard &&
        selectedHandCard !== card
    ){

        selectedHandCard.setSelected(
            false
        );

    }

    //----------------------------------
    // 場選択解除
    //----------------------------------

    clearFieldSelection();

    //----------------------------------
    // 手札選択
    //----------------------------------

    selectedHandCard = card;

card.setSelected(true);

    //----------------------------------
    // カード情報表示
    //----------------------------------

    showCardInfo(card);

    //----------------------------------
    // ボタン更新
    //----------------------------------

    updateButtons();

}


//======================================
// カード情報表示
//======================================

function showCardInfo(card){

    const image =
    document.getElementById(
        "info-image"
    );

    const text =
    document.getElementById(
        "info-text"
    );

    image.innerHTML = "";

    const img =
    document.createElement("img");

    img.src = card.image;

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    image.appendChild(img);

    text.innerHTML = `
        <h2>${card.name}</h2>

        <p>コスト：${card.cost}</p>

        <p>種類：${card.type}</p>

        <p>パワー：${card.power ?? "-"}</p>

        <p>${card.text ?? ""}</p>
    `;


    //----------------------------------
    // モーダル表示
    //----------------------------------

    document.getElementById(
        "hand-card-modal"
    ).style.display =
    "flex";

    updateButtons();
    updateCardAction(card);

}



//=========================
// 召喚開始
//=========================

function startSummon(card){

    //----------------------------------
    // 1ターン1枚制限
    //----------------------------------

    if(summonUsedThisTurn){

        alert(
            "このターンはサモンを使用済みです"
        );

        return;

    }


    //----------------------------------
    // コスト確認
    //----------------------------------

    if(!canPayCost(card)){

        alert(
            "コストが足りません"
        );

        return;

    }


    //----------------------------------
    // すでに選択中なら不可
    //----------------------------------

    if(summonCard){

        return;

    }


    //----------------------------------
    // 使用カード
    //----------------------------------

    summonCard = card;


    //----------------------------------
    // コストモード
    //----------------------------------

    costMode = "summon";


    //----------------------------------
    // コスト選択中は
    // 手札の通常発光を解除
    //----------------------------------

    board.handCards.forEach(card => {

        card.setHighlight(false);

    });


    //----------------------------------
    // コスト対象
    //----------------------------------

    costTargetCard = card;


    //----------------------------------
    // コスト選択リセット
    //----------------------------------

    selectedCostCards = [];

    costConfirm = false;


    //----------------------------------
    // 現在のコスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            PLAYER
        );


    //----------------------------------
    // 0コストなら選択不要
    //----------------------------------

    if(currentCost === 0){

        costConfirm = true;

    }

    //----------------------------------
    // コスト表示
    //----------------------------------

    showActionGuide(
        "コストゾーンに置くカードを" +
        currentCost +
        "枚選んでください"
    );




    //----------------------------------
    // 表示更新
    //----------------------------------

    updateButtons();


    console.log(
        "startSummon",
        summonCard
    );

}

//=========================
// コストカード選択
//=========================

function selectCostCard(card){

    if(card === summonCard){
        return;
    }


    //----------------------------------
    // 現在の必要コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            summonCard
        );


    //----------------------------------
    // 0コストなら選択不要
    //----------------------------------

    if(currentCost === 0){

        costConfirm = true;

        updateButtons();

        return;

    }


    //----------------------------------
    // 選択解除
    //----------------------------------

    if(
        selectedCostCards.includes(card)
    ){

        selectedCostCards =
        selectedCostCards.filter(
            c => c !== card
        );

        card.setSelected(false);

        card.setCostSelected(false);

        costConfirm = false;

        updateButtons();

        return;

    }


    //----------------------------------
    // 必要枚数以上は選択不可
    //----------------------------------

    if(
        selectedCostCards.length >=
        currentCost
    ){

        return;

    }


    //----------------------------------
    // コスト追加
    //----------------------------------

    selectedCostCards.push(card);

    card.setCostSelected(true);


    //----------------------------------
    // 必要枚数選択完了
    //----------------------------------

    if(
        selectedCostCards.length ===
        currentCost
    ){

        costConfirm = true;

    }


    updateButtons();

}

//=========================
// コスト支払い
//=========================

function payCost(){

    //----------------------------------
    // 選択したカードをコストへ送る
    //----------------------------------

    selectedCostCards.forEach(card=>{

        card.setSelected(false);
        card.setCostSelected(true);

        moveToCost(card);

    });


    //----------------------------------
    // 使用カード処理
    //----------------------------------

    summonCard.setSelected(false);


    board.removeHandCard(
        summonCard
    );


    //----------------------------------
    // サモン
    //----------------------------------

    if(
        summonCard.type === "サモン"
    ){

        summonCard.area =
        "field";


        const summon =
        new Summon(
            summonCard,
            PLAYER
        );




        //----------------------------------
        // 召喚したターンは攻撃不可
        //----------------------------------

        summon.attackReady = false;


        summon.view.setHighlight(
            false
        );


        //----------------------------------
        // 場へ追加
        //----------------------------------

        playerField.push(
            summon
        );

        //----------------------------------
// バトルログ
//----------------------------------

addBattleLog(
    `PLAYER：${summonCard.name}を召喚`
);


        //----------------------------------
        // サモン能力
        //----------------------------------

        applySummonAbility(
            summon
        );


        //----------------------------------
        // 表示
        //----------------------------------

        board.addPlayerCard(
            summon.view
        );


        //----------------------------------
        // 手札コスト表示更新
        //----------------------------------

        updateHandCostDisplay();
    }


    //----------------------------------
    // マギア
    //----------------------------------

    if(
        summonCard.type === "マギア"
    ){

    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `PLAYER：${summonCard.name}を使用`
    );

    addBattleLog(
        `PLAYER：対象 → ${
            getMagiaTargetLog(magiaTarget)
        }`
    );



        resolveMagia();

    }


    //----------------------------------
    // 状態リセット
    //----------------------------------

    if(selectedHandCard){

        selectedHandCard.setSelected(false);

    }

    selectedCostCards = [];


    if(
        summonCard?.type === "サモン"
    ){

        summonUsedThisTurn = true;

    }


    summonCard = null;
    selectedHandCard = null;


    costConfirm = false;

    hideActionGuide();


    updateGameState();

}

//=========================
// コストゾーンへ移動
//=========================

function moveToCost(card){

    board.removeHandCard(
        card
    );

    card.setFaceDown(true);

    card.setSelected(false);

    card.area = "cost";

    board.addCostCard(
        card
    );


    //----------------------------------
    // コストゾーン表示更新
    //----------------------------------

    updateCostZoneView();

}

function updateCostZoneView(){

    const list =
        document.getElementById(
            "cost-list"
        );

    if(!list){

        return;

    }


    //----------------------------------
    // 表示をクリア
    //----------------------------------

    list.innerHTML = "";


    //----------------------------------
    // コストカードなし
    //----------------------------------

    if(
        board.costCards.length === 0
    ){

        list.innerHTML =
        "<p>コストカードはありません</p>";

        return;

    }


    //----------------------------------
    // コストカード表示
    //----------------------------------

    board.costCards.forEach(card=>{

        const div =
            document.createElement("div");

        div.className =
            "cost-card";


        //----------------------------------
        // クリック
        //----------------------------------

        div.onclick = (event)=>{

            event.stopPropagation();


            console.log(
                "コストカードクリック",
                card.name
            );


            //----------------------------------
            // カード詳細表示
            //----------------------------------

            showCardInfo(card);

        };


        //----------------------------------
        // カード画像
        //----------------------------------

        const img =
            document.createElement("img");

        img.src =
            card.image;

        img.draggable =
            false;


        div.appendChild(
            img
        );


        //----------------------------------
        // 追加
        //----------------------------------

        list.appendChild(
            div
        );

    });

}

//=========================
// 召喚キャンセル
//=========================

function cancelSummon(){

//----------------------------------
// 行動案内を消す
//----------------------------------

hideActionGuide();


//----------------------------------
// 選択カード解除
//----------------------------------

if(summonCard){

    summonCard.setSelected(
        false
    );

}


//----------------------------------
// コスト選択解除
//----------------------------------

selectedCostCards.forEach(card=>{

    card.setSelected(false);

    card.setCostSelected(false);

});


//----------------------------------
// 状態リセット
//----------------------------------

selectedHandCard = null;

summonCard = null;

selectedCostCards = [];

costConfirm = false;

resetMagiaState();

updateGameState();

}

//=========================
// コストゾーン表示
//=========================
function openCostView(){

    const modal =
        document.getElementById(
            "cost-modal"
        );


    //----------------------------------
    // コストゾーン表示更新
    //----------------------------------

    updateCostZoneView();


    //----------------------------------
    // モーダル表示
    //----------------------------------

    modal.style.display =
        "block";

}
//=========================
// コストモーダルを閉じる
//=========================

function closeCostView(){

    document.getElementById(
        "cost-modal"
    ).style.display =
    "none";

}

//=========================
// 操作ボタン初期化
//=========================

function resetActionButtons(){

    const actionArea =
    document.getElementById(
        "cost-action-area"
    );

    const useButton =
    document.getElementById(
        "use-button"
    );

    const attackButton =
    document.getElementById(
        "attack-button"
    );

    const abilityButton =
    document.getElementById(
        "ability-button"
    );

    const blockButton =
    document.getElementById(
        "block-button"
    );

    const cancelButton =
    document.getElementById(
        "cancel-button"
    );

    const confirmButton =
    document.getElementById(
        "confirm-button"
    );

    const resistPassButton =
    document.getElementById(
        "resist-pass-button"
    );

    const blockSkipButton =
    document.getElementById(
        "block-skip-button"
    );

    if(!actionArea){

        return;

    }

    actionArea.style.display = "none";

    if(useButton){

        useButton.style.display = "none";
        useButton.onclick = null;

    }

    if(attackButton){

        attackButton.style.display = "none";
        attackButton.onclick = null;

    }

    if(abilityButton){

        abilityButton.style.display = "none";
        abilityButton.onclick = null;

    }

    if(blockButton){

        blockButton.style.display = "none";
        blockButton.onclick = null;

    }

    if(cancelButton){

        cancelButton.style.display = "none";
        cancelButton.onclick = null;

    }

    if(confirmButton){

        confirmButton.style.display = "none";
        confirmButton.onclick = null;

    }

    if(resistPassButton){

        resistPassButton.style.display = "none";
        resistPassButton.onclick = null;

    }

    if(blockSkipButton){

        blockSkipButton.style.display = "none";
        blockSkipButton.onclick = null;

    }

}




//=========================
// ボタン状態更新
//=========================
function updateButtons(){

    console.log(
    "updateButtons",
    "summonCard=",
    summonCard
);

    const actionArea =
    document.getElementById(
        "cost-action-area"
    );

    const useButton =
    document.getElementById(
        "use-button"
    );

    const attackButton =
document.getElementById(
    "attack-button"
);


const abilityButton =
document.getElementById(
    "ability-button"
);


const blockButton =
document.getElementById(
    "block-button"
);

    const cancelButton =
    document.getElementById(
        "cancel-button"
    );

    const confirmButton =
    document.getElementById(
        "confirm-button"
    );

    const resistPassButton =
    document.getElementById(
        "resist-pass-button"
    );

    const blockSkipButton =
    document.getElementById(
        "block-skip-button"
    );


    if(
        !actionArea ||
        !cancelButton ||
        !confirmButton ||
        !resistPassButton
    ){

        return;

    }

const endTurnButton =
document.getElementById(
    "endturn-button"
);

if(endTurnButton){

    const actionRunning =

        summonCard ||
        resistUsingCard ||
        resistMode ||
        blockMode ||
        attackMode ||
        coolRecoveryMode ||
        magiaTargetMode;

    endTurnButton.disabled =

        game.currentPlayer !== PLAYER ||
        actionRunning;

}

resetActionButtons();

    //----------------------------------
    // レジスト待機中
    //----------------------------------

    if(
        resistMode &&
        !resistUsingCard
    ){

        actionArea.style.display =
        "flex";


        resistPassButton.style.display =
        "inline-block";


        resistPassButton.textContent =
        "レジストしない";


        resistPassButton.onclick =
        passResist;


     if(
    resistMode &&
    !resistUsingCard
){

    actionArea.style.display =
    "flex";


    resistPassButton.style.display =
    "inline-block";


    resistPassButton.textContent =
    "レジストしない";


    resistPassButton.onclick =
    passResist;


    if(
        !selectedHandCard
    ){

        return;

    }


    if(
        selectedHandCard.type === "レジスト" &&
        selectableResistCards.includes(
            selectedHandCard
        )
    ){

        useButton.style.display =
        "inline-block";

        useButton.textContent =
        "使用";

        useButton.onclick = ()=>{

            startResist(
                selectedHandCard
            );

        };

    }


    return;

}

    }



    //----------------------------------
    // レジストコスト選択中
    //----------------------------------

    if(resistUsingCard){


        actionArea.style.display =
        "flex";


        cancelButton.style.display =
        "inline-block";


        cancelButton.onclick =
        cancelResistCost;


        confirmButton.textContent =
        "レジスト発動";


        confirmButton.onclick =
        payResistCost;


        confirmButton.style.display =
        resistCostConfirm
        ? "inline-block"
        : "none";


        return;

    }



    //----------------------------------
    // ブロック中
    //----------------------------------

    if(blockMode){


        actionArea.style.display =
        "flex";


        blockSkipButton.style.display =
        "inline-block";


        blockSkipButton.onclick =
        ()=>{

            skipBlock();

        };


        return;

    }

    //----------------------------------
    // クール回収中
    //----------------------------------

    if(coolRecoveryMode){

        return;

    }

    //----------------------------------
// マギア対象選択中
//----------------------------------

if(magiaTargetMode){

    actionArea.style.display =
        "flex";


    if(useButton){

        useButton.style.display =
            "inline-block";


        useButton.textContent =
            "キャンセル";


        useButton.onclick = ()=>{

            console.log(
                "マギア対象選択キャンセル"
            );


            resetMagiaState();

            hideActionGuide();

            updateButtons();

        };

    }


    return;

}


    //----------------------------------
    // 通常カード選択中
    //----------------------------------

    if(
    selectedHandCard &&
    !summonCard &&
    !resistMode &&
    !attackMode &&
    game.currentPlayer === PLAYER
){


        actionArea.style.display =
        "flex";


   if(useButton){


//----------------------------------
// サモン
//----------------------------------

if(
    selectedHandCard.type === "サモン"
){

    if(
        !summonUsedThisTurn &&
        canPayCost(selectedHandCard)
    ){

        useButton.style.display =
        "inline-block";

        useButton.textContent =
        "使用";

        useButton.onclick = ()=>{

            startSummon(
                selectedHandCard
            );

        };

    }

}



//----------------------------------
// マギア
//----------------------------------

else if(
    selectedHandCard.type === "マギア"
){

    const canUse =
        canUseMagia(
            selectedHandCard
        );


    //----------------------------------
    // 使用可能
    //----------------------------------

    if(
        canUse &&
        canPayCost(selectedHandCard)
    ){

        useButton.style.display =
            "inline-block";


        useButton.textContent =
            "使用";


        useButton.onclick = ()=>{

            startMagia(
                selectedHandCard
            );

        };

    }

}


    //----------------------------------
    // レジスト
    //----------------------------------

    else if(

        resistMode &&

        selectedHandCard.type === "レジスト" &&

        selectableResistCards.includes(
            selectedHandCard
        )

    ){

        useButton.style.display =
        "inline-block";

        useButton.textContent =
        "使用";

        useButton.onclick = ()=>{

            startResist(
                selectedHandCard
            );

        };

    }


    //----------------------------------
    // その他
    //----------------------------------

    else{

        useButton.style.display =
        "none";

    }
   }}
//----------------------------------
// サモン・マギア コスト選択中
//----------------------------------

if(summonCard){

    actionArea.style.display =
    "flex";

    cancelButton.style.display =
    "inline-block";

    cancelButton.onclick =
    cancelSummon;

    confirmButton.textContent =
    "決定";

    confirmButton.onclick =
    payCost;

    if(costConfirm){

        confirmButton.style.display =
        "inline-block";

    }

    return;
}
}


function closeCardModal(){

    document.getElementById(
        "hand-card-modal"
    ).style.display =
    "none";

}

const closeButton =
document.getElementById(
    "card-close"
);

if(closeButton){

    closeButton.onclick =
    closeCardModal;

}

function closeHandModal(){

    document.getElementById(
        "hand-card-modal"
    ).style.display =
    "none";

}

//=========================
// 場選択解除
//=========================

function clearFieldSelection(){

    if(selectedSummon){

        selectedSummon.view.setSelected(false);

    }

    selectedSummon = null;

}

//=========================
// 手札選択解除
//=========================

function clearHandSelection(){

    if(selectedHandCard){

        selectedHandCard.setSelected(false);

    }

    selectedHandCard = null;

}
//======================================
// 旧サモン操作モーダル停止
//======================================

function openSummonActionModal(summon){

    console.log(
        "旧サモンモーダル停止",
        summon.card.name
    );


    showCardInfo(
        summon.card
    );

}

function closeSummonActionModal(){

    document.getElementById(
        "summon-action-modal"
    ).style.display = "none";

    clearFieldSelection();

}



const closeSummonButton =
document.getElementById(
    "close-summon-modal"
);


if(closeSummonButton){


    closeSummonButton.onclick =
    closeSummonActionModal;


}

//=========================
// 表示カードからSummon検索
//=========================

function findSummonByView(card){


    const fields = [

        playerField,

        enemyField

    ];



    for(const field of fields){


        const summon =
        field.find(

            s => s.view === card

        );


        if(summon){

            return summon;

        }


    }


    return null;


}

//=========================
// クールモーダル表示
//=========================

function openCoolModal(
    owner = PLAYER,
    recoveryMode = false
){

    coolViewMode = false;

    currentCoolOwner = owner;

    coolRecoveryMode = recoveryMode;

    selectedCoolCard = null;


    //----------------------------------
    // 行動案内
    //----------------------------------

    if(coolRecoveryMode){

        showActionGuide(
            "手札に戻すカードを選んでください"
        );

    }else{

        hideActionGuide();

    }


    const modal =
        document.getElementById(
            "cool-modal"
        );


    const title =
        modal.querySelector("h2");


    const list =
        document.getElementById(
            "cool-list"
        );


    //----------------------------------
    // ボタン取得
    //----------------------------------

    const button =
        document.getElementById(
            "close-cool-button"
        );


    const xButton =
        document.getElementById(
            "close-cool-x-button"
        );


    //----------------------------------
    // ボタン表示
    //----------------------------------

    if(coolRecoveryMode){

        //----------------------------------
        // 回収モード
        //----------------------------------

        button.style.display =
            "block";

        button.textContent =
            "戻すカードを決定";


        // × は非表示

        xButton.style.display =
            "none";


    }else{

        //----------------------------------
        // 通常閲覧モード
        //----------------------------------

        // 「戻すカードを決定」は非表示

        button.style.display =
            "none";


        // × を表示

        xButton.style.display =
            "flex";

    }



    //----------------------------------
    // カード一覧クリア
    //----------------------------------

    list.innerHTML = "";



    //----------------------------------
    // タイトル
    //----------------------------------

    if(owner === PLAYER){

        title.textContent =
            "自分のクールゾーン";

    }else{

        title.textContent =
            "相手のクールゾーン";

    }



    //----------------------------------
    // 表示するクールゾーン取得
    //----------------------------------

    const coolCards =
        getCoolCards(owner);

    const handCards =
        getHandCards(owner);



    //----------------------------------
    // カードなし
    //----------------------------------

    if(coolCards.length === 0){

        list.innerHTML =
            "<p>カードはありません</p>";

    }else{


        coolCards.forEach(card=>{


            const img =
                document.createElement("img");


            img.src =
                card.image;


            img.className =
                "cool-card";



            //----------------------------------
            // クールカードクリック
            //----------------------------------

            img.onclick = ()=>{


                //----------------------------------
                // カード詳細表示
                //----------------------------------

                showCardInfo(card);



                //----------------------------------
                // 閲覧モードの場合
                //----------------------------------

                if(!coolRecoveryMode){

                    return;

                }



                //----------------------------------
                // 以前の選択解除
                //----------------------------------

                document
                    .querySelectorAll(".cool-card")
                    .forEach(c=>{

                        c.classList.remove(
                            "selected"
                        );

                    });



                //----------------------------------
                // 選択表示
                //----------------------------------

                img.classList.add(
                    "selected"
                );



                //----------------------------------
                // 回収対象保存
                //----------------------------------

                selectedCoolCard =
                    card;



                console.log(

                    "回収選択:",

                    selectedCoolCard

                );


            };



            list.appendChild(img);


        });

    }



    //----------------------------------
    // 表示
    //----------------------------------

    modal.style.display =
        "block";


    modal.classList.add(
        "active"
    );

}


//=========================
// 相手クールゾーン 閲覧専用
//=========================

function openEnemyCoolModal(){

    console.log(
        "★ openEnemyCoolModal 実行開始"
    );


    const modal =
        document.getElementById(
            "enemy-cool-modal"
        );


    console.log(
        "★ enemy-cool-modal =",
        modal
    );


    const list =
        document.getElementById(
            "enemy-cool-list"
        );


    console.log(
        "★ enemy-cool-list =",
        list
    );


    list.innerHTML = "";


    //----------------------------------
    // 相手クールゾーン取得
    //----------------------------------

    const cards =
        board.enemyCoolCards;


    //----------------------------------
    // カードなし
    //----------------------------------

    if(cards.length === 0){

        list.innerHTML =
            "<p>カードはありません</p>";

    }else{

        cards.forEach(card=>{

            const img =
                document.createElement("img");


            img.src =
                card.image;


            img.className =
                "cool-card";


            img.onclick = ()=>{

                showCardInfo(card);

            };


            list.appendChild(img);

        });

    }


    //----------------------------------
    // 表示
    //----------------------------------

    modal.style.display =
        "block";


    modal.classList.add(
        "active"
    );


    console.log(
        "★ openEnemyCoolModal 表示完了"
    );

}



//=========================
// クールモーダル更新
//=========================

function refreshCoolModal(){

    //----------------------------------
    // 自分クールモーダル
    //----------------------------------

    const playerModal =
        document.getElementById(
            "cool-modal"
        );


    if(
        playerModal &&
        playerModal.style.display === "block"
    ){

        //----------------------------------
        // クール回収中は再オープンしない
        //----------------------------------

        if(coolRecoveryMode){

            console.log(
                "クール回収中のため自分クールモーダル再生成をスキップ"
            );

        }else{

            openCoolModal(
                PLAYER,
                false
            );

        }

    }


    //----------------------------------
    // 相手クールモーダル
    //----------------------------------

    const enemyModal =
        document.getElementById(
            "enemy-cool-modal"
        );


    if(
        enemyModal &&
        enemyModal.style.display === "block"
    ){

        openEnemyCoolModal();

    }

}


//=========================
// クールモーダルを閉じる
//=========================

function closeCoolModal(){

    const modal =
    document.getElementById(
        "cool-modal"
    );


    modal.style.display =
    "none";


    modal.classList.remove(
        "active"
    );

}

//=========================
// 相手クールモーダルを閉じる
//=========================

function closeEnemyCoolModal(){

    const modal =
        document.getElementById(
            "enemy-cool-modal"
        );


    modal.style.display =
        "none";


    modal.classList.remove(
        "active"
    );

}

function recoverCoolCards(owner){

    //----------------------------------
    // カード未選択の場合
    //----------------------------------

    if(!selectedCoolCard){

        console.log(
            "クール回収カード未選択"
        );

        return false;

    }


    //----------------------------------
    // 回収対象を保存
    //----------------------------------

    const card =
        selectedCoolCard;


    //----------------------------------
    // クールゾーンから削除
    //----------------------------------

    board.removeCoolCard(
        card,
        owner
    );


    //----------------------------------
    // 手札へ戻す
    //----------------------------------

    card.area =
        owner === PLAYER
        ? "hand"
        : "enemyHand";


    card.setFaceDown(false);

    card.setHorizontal(false);


    //----------------------------------
    // レジスト再使用可能化
    //----------------------------------

    if(card.type === "レジスト"){

        card.usedThisEvent = false;

    }


    //----------------------------------
    // 選択状態解除
    //----------------------------------

    card.setSelected(false);

    card.setHighlight(false);

    card.setCostSelected(false);


    //----------------------------------
    // 所有者の手札へ追加
    //----------------------------------

    const handCards =
        getHandCards(owner);


    handCards.push(card);


    console.log(
        "クール回収完了",
        card.name,
        "usedThisEvent=",
        card.usedThisEvent
    );


    //----------------------------------
    // 選択解除
    //----------------------------------

    selectedCoolCard = null;


    document
    .querySelectorAll(".cool-card")
    .forEach(cardElement=>{

        cardElement.classList.remove(
            "selected"
        );

    });


    //----------------------------------
    // 手札表示更新
    //----------------------------------

    if(owner === PLAYER){

        board.setHandCards(
            board.handCards
        );

    }else{

        updateEnemyZoneDisplay();

    }


    //----------------------------------
    // 回収終了
    //----------------------------------

    coolRecoveryMode = false;


    closeCoolModal();


    finishCoolRecovery();


    updateGameState();


    board.updateCoolCount();


    return true;

}

//======================================
// CPUゾーン表示更新
//======================================

function updateEnemyZoneDisplay(){

    //----------------------------------
    // CPU手札
    //----------------------------------

    const handArea =
        document.getElementById(
            "enemy-hand-cards"
        );


    const handCount =
        document.getElementById(
            "enemy-hand-count"
        );


    if(
        handArea &&
        handCount
    ){

        //----------------------------------
        // 既存カードを削除
        //----------------------------------

        handArea.innerHTML = "";


        //----------------------------------
        // CPU手札枚数
        //----------------------------------

        const handLength =
            enemyHandCards.length;


        console.log(
            "★ CPU手札表示更新",
            handLength,
            enemyHandCards.map(
                card =>
                    card.name
            )
        );


        //----------------------------------
        // 裏面カードを枚数分表示
        //----------------------------------

        enemyHandCards.forEach(
            () => {

                const image =
                    document.createElement(
                        "img"
                    );


                image.className =
                    "enemy-hand-card";


                image.src =
                    "images/ui/card-back.png";


                image.alt =
                    "CPU手札";


                handArea.appendChild(
                    image
                );

            }
        );


        //----------------------------------
        // 枚数表示
        //----------------------------------

        handCount.textContent =
            `手札×${handLength}`;

    }


//----------------------------------
// CPUコスト
//----------------------------------

const costArea =
    document.getElementById(
        "enemy-cost-cards"
    );


const costCount =
    document.getElementById(
        "enemy-cost-count"
    );


if(
    costArea &&
    costCount
){

    //----------------------------------
    // 既存表示を削除
    //----------------------------------

    costArea.innerHTML = "";


    //----------------------------------
    // CPUコスト枚数
    //----------------------------------

    const costLength =
        enemyCostCards.length;


    //----------------------------------
    // 裏面カードを枚数分表示
    //----------------------------------

    enemyCostCards.forEach(
        () => {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "enemy-cost-card";


            image.src =
                "images/ui/card-back.png";


            image.alt =
                "CPUコスト";


            costArea.appendChild(
                image
            );

        }
    );


    //----------------------------------
    // 枚数表示
    //----------------------------------

    costCount.textContent =
        `コスト×${costLength}`;

}

//----------------------------------
// CPUクール
//----------------------------------

const coolDisplay =
    document.getElementById(
        "enemy-cool-display"
    );


const coolArea =
    document.getElementById(
        "enemy-cool-cards"
    );


const coolCount =
    document.getElementById(
        "enemy-cool-count"
    );


if(
    coolArea &&
    coolCount
){

    //----------------------------------
    // 既存表示を削除
    //----------------------------------

    coolArea.innerHTML = "";


    //----------------------------------
    // CPUクール枚数
    //----------------------------------

    const coolLength =
        enemyCoolCards.length;


    //----------------------------------
    // クールカードをすべて表示
    //----------------------------------

    enemyCoolCards.forEach(
        card => {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "enemy-cool-card";


            image.src =
                card.image;


            image.alt =
                card.name;


            coolArea.appendChild(
                image
            );

        }
    );


    //----------------------------------
    // 枚数表示
    //----------------------------------

    coolCount.textContent =
        `クール×${coolLength}`;


    //----------------------------------
    // クリックでクールモーダル
    //----------------------------------
if(coolDisplay){

    coolDisplay.style.cursor =
        "pointer";

    coolDisplay.style.pointerEvents =
        "auto";


    coolDisplay.onclick =
        ()=>{

            console.log(
                "CPUクールゾーンクリック"
            );


            openEnemyCoolModal();

        };

}

}
}


//======================================
// クールゾーン枚数表示更新
//======================================

function updateCoolZoneDisplay(){

    const playerCool =
    document.querySelector(
        "#player-header .cool-area"
    );


    const enemyCool =
    document.querySelector(
        "#enemy-header .cool-area"
    );


    if(playerCool){

        playerCool.textContent =
        "クール " +
        board.playerCoolCards.length;

    }


    if(enemyCool){

        enemyCool.textContent =
        "クール " +
        board.enemyCoolCards.length;

    }

}

//======================================
// 使用可能カード発光更新
//======================================

function updateUsableCardHighlight(){

    console.log(
        "発光更新開始"
    );


    //----------------------------------
    // 全解除
    //----------------------------------

    if(board){

        board.handCards.forEach(card=>{

            card.setHighlight(false);

        });

    }


    //----------------------------------
    // レジスト選択中
    //----------------------------------

    if(resistMode){

        console.log(
            "レジスト発光処理"
        );


        selectableResistCards.forEach(card=>{

            console.log(
                "レジスト発光",
                card.name
            );


            card.setHighlight(true);

        });


        return;

    }


    //----------------------------------
    // 自分ターン以外は禁止
    //----------------------------------

    if(
        game.currentPlayer !== PLAYER
    ){

        return;

    }


    //----------------------------------
    // 行動中は禁止
    //----------------------------------

    if(

        summonCard ||
        attackMode ||
        magiaCard ||
        resistUsingCard ||
        blockMode

    ){

        return;

    }


    //----------------------------------
    // 通常発光
    //----------------------------------

    board.handCards.forEach(card=>{


        //----------------------------------
        // サモン
        //----------------------------------

        if(
            card.type === "サモン"
        ){

            if(
                !summonUsedThisTurn &&
                canPayCost(card)
            ){

                card.setHighlight(true);

            }

        }


        //----------------------------------
        // マギア
        //----------------------------------

        if(
            card.type === "マギア"
        ){

            if(
                canPayCost(card) &&
                canUseMagia(card)
            ){

                card.setHighlight(true);

            }

        }


        //----------------------------------
        // レジスト
        //----------------------------------

        if(
            card.type === "レジスト"
        ){

            if(
                canPayCost(card) &&
                canUseResist(card)
            ){

                card.setHighlight(true);

            }

        }

    });


    //----------------------------------
    // デバッグ
    //----------------------------------

    board.handCards.forEach(card=>{

        console.log(
            card.name,
            card.type,
            card.area
        );

    });

}

//======================================
// カード操作ボタン更新
//======================================

function updateCardAction(card){

    const actionArea =
    document.getElementById(
        "cost-action-area"
    );


    const attackButton =
    document.getElementById(
        "attack-button"
    );


    const abilityButton =
    document.getElementById(
        "ability-button"
    );


    const blockButton =
    document.getElementById(
        "block-button"
    );


    //----------------------------------
    // レジスト中は禁止
    //----------------------------------

    if(resistMode){

        console.log(
            "レジスト中 アクション禁止"
        );

        return;

    }

    //----------------------------------
    // カード使用中・コスト選択中は禁止
    //----------------------------------

    if(
        card.area !== "field" &&
        card.area !== "enemyField"
    ){
        return;
    }




    if(attackButton){
        attackButton.style.display="none";
    }

    if(abilityButton){
        abilityButton.style.display="none";
    }

    if(blockButton){
        blockButton.style.display="none";
    }


    const summon =
    findSummonByView(card);


    if(!summon){
        return;
    }


    if(
        blockMode &&
        selectableBlockSummons.includes(summon)
    ){

        actionArea.style.display="flex";

        blockButton.style.display =
        "inline-block";

        blockButton.onclick = ()=>{

            executeBlock(summon);

        };

        return;

    }


    //----------------------------------
    // カード使用中は禁止
    //----------------------------------
    if(
        summonCard ||
        resistUsingCard ||
        magiaCard ||
        coolRecoveryMode ||
        resistMode ||
        blockMode
    ){
        return;
    }

    if(
        summon.owner === PLAYER
    ){

        if(
            summon.attackReady &&
            !summon.isRest
        ){

            actionArea.style.display="flex";

            attackButton.style.display =
            "inline-block";

            attackButton.onclick = ()=>{

                startAttack(summon);

            };

        }


        if(
            summon.card.effect &&
            !summon.isRest
        ){

            actionArea.style.display="flex";

            abilityButton.style.display =
            "inline-block";

        }

    }

}

//======================================
// ゲーム表示更新
//======================================

function updateGameState(){

    //----------------------------------
    // 手札発光
    //----------------------------------

    updateUsableCardHighlight();

    //----------------------------------
    // 場の発光
    //----------------------------------

    updateAttackHighlight();

    //----------------------------------
    // ボタン更新
    //----------------------------------

    updateButtons();

}

function getEffectiveCost(card){

    if(!card){
        return 0;
    }


    let cost =
        card.cost;


    //----------------------------------
    // 自分の場のサモンを確認
    //----------------------------------

    playerField.forEach(summon=>{

        if(!summon){
            return;
        }

        const ability =
            summon.card.ability;

        if(!ability){
            return;
        }


        //----------------------------------
        // 属性コスト軽減
        //----------------------------------

        if(
            ability.type === "elementCostDown" &&
            card.elementType === ability.element
        ){

            cost -= ability.value;

        }

    });


    //----------------------------------
    // 相手の場のサモンを確認
    //----------------------------------

    enemyField.forEach(summon=>{

        if(!summon){
            return;
        }

        const ability =
            summon.card.ability;

        if(!ability){
            return;
        }


        //----------------------------------
        // セイレーン
        // 相手のマギアコスト +1
        //----------------------------------

        if(
            ability.type === "enemyMagiaCostUp" &&
            card.type === "マギア"
        ){

            cost += ability.value;

        }

    });


    //----------------------------------
    // 0未満にはしない
    //----------------------------------

    return Math.max(
        0,
        cost
    );

}


function updateHandCostDisplay(){

    if(!board){
        return;
    }


    board.handCards.forEach(card=>{

        card.refresh();

    });

}

//======================================
// 現在のカードコスト取得
//======================================

function getCurrentCardCost(card, owner = PLAYER){

    if(!card){
        return 0;
    }


    //----------------------------------
    // 元のコスト
    //----------------------------------

    let cost =
        card.cost;


    //----------------------------------
    // 対象フィールド
    //----------------------------------

    const field =
        owner === ENEMY
            ? enemyField
            : playerField;


    //----------------------------------
    // コスト能力確認
    //----------------------------------

    field.forEach(summon => {

        if(
            !summon ||
            !summon.card
        ){
            return;
        }


        const ability =
            summon.card.ability;


        if(!ability){
            return;
        }


        //----------------------------------
        // 属性コスト軽減
        //----------------------------------

        if(
            ability.type ===
            "elementCostDown"
        ){

            if(
                ability.element ===
                card.elementType
            ){

                cost -=
                    ability.value;

            }

        }

    });


    //----------------------------------
    // 相手の場の能力を確認
    //----------------------------------

    const enemyFieldToCheck =
        owner === PLAYER
            ? enemyField
            : playerField;


    enemyFieldToCheck.forEach(summon => {

        if(
            !summon ||
            !summon.card
        ){
            return;
        }


        const ability =
            summon.card.ability;


        if(!ability){
            return;
        }


        //----------------------------------
        // セイレーン
        // 相手のマギアコスト +1
        //----------------------------------

        if(
            ability.type ===
            "enemyMagiaCostUp" &&
            card.type ===
            "マギア"
        ){

            cost +=
                ability.value;

        }

    });


    //----------------------------------
    // 0未満にはしない
    //----------------------------------

    return Math.max(
        0,
        cost
    );

}


//======================================
// バトルログ
//======================================

function addBattleLog(message){

    const log =
        document.getElementById(
            "battle-log"
        );

    if(!log){

        return;

    }


    //----------------------------------
    // 前の最新ログを解除
    //----------------------------------

    const oldLatest =
        log.querySelector(
            ".latest-log"
        );

    if(oldLatest){

        oldLatest.classList.remove(
            "latest-log"
        );

    }


    //----------------------------------
    // 新しいログ作成
    //----------------------------------

    const entry =
        document.createElement(
            "div"
        );


    entry.className =
        "battle-log-entry latest-log";


    entry.textContent =
        message;


    log.appendChild(
        entry
    );


    //----------------------------------
    // 一番下までスクロール
    //----------------------------------

    log.scrollTop =
        log.scrollHeight;

}

//======================================
// バトルログ開閉
// 通常時：表示
// ボタン押下：非表示
//======================================

const logButton =
    document.getElementById(
        "log-button"
    );


if(logButton){

    logButton.addEventListener(
        "click",
        () => {

            const logArea =
                document.getElementById(
                    "log-area"
                );


            if(!logArea){

                return;

            }


            //----------------------------------
            // 閉じている場合
            //----------------------------------

            if(
                logArea.classList.contains(
                    "log-closed"
                )
            ){

                logArea.classList.remove(
                    "log-closed"
                );


                console.log(
                    "★ バトルログ表示"
                );

            }
            else{

                //----------------------------------
                // 表示中の場合
                //----------------------------------

                logArea.classList.add(
                    "log-closed"
                );


                console.log(
                    "★ バトルログ非表示"
                );

            }

        }
    );

}

//======================================
// マギア対象ログ
//======================================

function getMagiaTargetLog(target){

    //----------------------------------
    // 対象なし
    //----------------------------------

    if(!target){

        return "なし";

    }


    //----------------------------------
    // プレイヤー
    //----------------------------------

    if(target === PLAYER){

        return "プレイヤー";

    }


    //----------------------------------
    // CPU
    //----------------------------------

    if(target === ENEMY){

        return "CPU";

    }


    //----------------------------------
    // サモン
    //----------------------------------

    if(target.card){

        return target.card.name;

    }


    //----------------------------------
    // Cardそのもの
    //----------------------------------

    if(target.name){

        return target.name;

    }


    //----------------------------------
    // 不明
    //----------------------------------

    return "不明";

}

//======================================
// プレイヤー行動案内
//======================================

function showActionGuide(message){

        console.log(
        "★ showActionGuide",
        message
    );



    const guide =
        document.getElementById(
            "action-guide"
        );

    const text =
        document.getElementById(
            "action-guide-text"
        );


    if(!guide || !text){

        return;

    }


    text.textContent =
        message;


    guide.style.display =
        "block";

}

function hideActionGuide(){

        console.log(
        "★ hideActionGuide 呼び出し"
    );

    const guide =
        document.getElementById(
            "action-guide"
        );


    if(!guide){

        return;

    }


    guide.style.display =
        "none";

}

//======================================
// カード詳細モーダル
// カード以外をクリックしたら閉じる
//======================================

document.addEventListener(
    "click",
    function(event){

        const modal =
            document.getElementById(
                "hand-card-modal"
            );

        if(
            !modal ||
            modal.style.display === "none"
        ){

            return;

        }


        //----------------------------------
        // カード詳細モーダル内部なら何もしない
        //----------------------------------

        const content =
            document.getElementById(
                "hand-card-modal-content"
            );

        if(
            content &&
            content.contains(event.target)
        ){

            return;

        }


        //----------------------------------
        // カードをクリックした場合も何もしない
        //----------------------------------

        if(
            event.target.closest(".card") ||
            event.target.closest(".cool-card") ||
            event.target.closest(".cost-card")
        ){

            return;

        }


        //----------------------------------
        // それ以外なら閉じる
        //----------------------------------

        closeCardModal();

    }
);


function logCpuCardTotal(){

    const handCount =
        enemyHandCards.length;

    const fieldCount =
        enemyField.length;

    const costCount =
        enemyCostCards.length;

    const coolCount =
        enemyCoolCards.length;


    const total =
        handCount +
        fieldCount +
        costCount +
        coolCount;


    console.log(
        "========== CPUカード総数 =========="
    );

    console.log(
        "手札：",
        handCount,
        enemyHandCards.map(
            card => card.name
        )
    );

    console.log(
        "場：",
        fieldCount,
        enemyField.map(
            summon => summon.card.name
        )
    );

    console.log(
        "コスト：",
        costCount,
        enemyCostCards.map(
            card => card.name
        )
    );

    console.log(
        "クール：",
        coolCount,
        enemyCoolCards.map(
            card => card.name
        )
    );

    console.log(
        "CPUカード総数：",
        total
    );

    console.log(
        "===================================="
    );

}


const resetGameButton =
    document.getElementById(
        "reset-game-button"
    );

if(resetGameButton){

    resetGameButton.addEventListener(
        "click",
        ()=>{
            
            console.log(
                "★ ゲームリロード"
            );

            location.reload();

        }
    );

}


//======================================
// CPUカード使用演出
//======================================

let cpuCardActionTimer = null;


function showCpuCardAction(
    card,
    actionType = "MAGIA",
    target = null
){

    if(!card){

        return;

    }


    //----------------------------------
    // DOM取得
    //----------------------------------

    const overlay =
        document.getElementById(
            "cpu-card-action-overlay"
        );


    const panel =
        document.getElementById(
            "cpu-card-action-panel"
        );


    const typeElement =
        document.getElementById(
            "cpu-card-action-type"
        );


    const imageElement =
        document.getElementById(
            "cpu-card-action-image"
        );


    const nameElement =
        document.getElementById(
            "cpu-card-action-name"
        );


    const targetElement =
        document.getElementById(
            "cpu-card-action-target"
        );


    if(
        !overlay ||
        !panel ||
        !typeElement ||
        !imageElement ||
        !nameElement ||
        !targetElement
    ){

        console.warn(
            "CPUカード使用演出：DOMが見つかりません"
        );

        return;

    }


    //----------------------------------
    // 前回タイマー解除
    //----------------------------------

    if(cpuCardActionTimer){

        clearTimeout(
            cpuCardActionTimer
        );

        cpuCardActionTimer = null;

    }


    //----------------------------------
    // フェード解除
    //----------------------------------

    overlay.classList.remove(
        "fade-out"
    );


    //----------------------------------
    // 種類
    //----------------------------------

    if(
        actionType === "RESIST"
    ){

        typeElement.textContent =
            "CPU RESIST";

    }else{

        typeElement.textContent =
            "CPU MAGIA";

    }


    //----------------------------------
    // カード画像
    //----------------------------------

    imageElement.src =
        card.image;


    //----------------------------------
    // カード名
    //----------------------------------

    nameElement.textContent =
        card.name;


    //----------------------------------
    // 対象
    //----------------------------------

    if(
        actionType === "RESIST"
    ){

        targetElement.style.display =
            "none";

    }
    else if(target){

        targetElement.style.display =
            "block";


        let targetName =
            "不明";


        if(
            target === PLAYER ||
            target === "player"
        ){

            targetName =
                "PLAYER";

        }
        else if(
            target === ENEMY ||
            target === "enemy"
        ){

            targetName =
                "CPU";

        }
        else if(
            target.card
        ){

            targetName =
                target.card.name;

        }
        else if(
            target.name
        ){

            targetName =
                target.name;

        }


        targetElement.textContent =
            `対象：${targetName}`;

    }
    else{

        targetElement.style.display =
            "none";

    }


    //----------------------------------
    // 表示
    //----------------------------------

    overlay.classList.add(
        "active"
    );


    //----------------------------------
    // フェードアウト
    //----------------------------------

    cpuCardActionTimer =
        setTimeout(()=>{

            overlay.classList.add(
                "fade-out"
            );


            //----------------------------------
            // 完全に消えたら非表示
            //----------------------------------

            setTimeout(()=>{

                overlay.classList.remove(
                    "active",
                    "fade-out"
                );

            },300);


        },2000);

}


function updateWinStars(){

    //----------------------------------
    // プレイヤー
    //----------------------------------

    const playerStars =
        document.querySelectorAll(
            "#player-win-stars .win-star"
        );


    playerStars.forEach(
        (star,index)=>{

            const active =
                index < playerWins;


            star.classList.toggle(
                "active",
                active
            );


            star.textContent =
                active
                ? "★"
                : "☆";

        }
    );


    //----------------------------------
    // CPU
    //----------------------------------

    const enemyStars =
        document.querySelectorAll(
            "#enemy-win-stars .win-star"
        );


    enemyStars.forEach(
        (star,index)=>{

            const active =
                index < enemyWins;


            star.classList.toggle(
                "active",
                active
            );


            star.textContent =
                active
                ? "★"
                : "☆";

        }
    );

}


//======================================
// 1戦終了
//======================================

//======================================
// 1戦終了処理
//======================================

function finishBattleGame(winner){

    console.log(
        "1戦終了",
        winner === PLAYER
            ? "PLAYER"
            : "ENEMY"
    );


    //----------------------------------
    // 勝利数加算
    //----------------------------------

    if(winner === PLAYER){

        playerWins++;

    }else{

        enemyWins++;

    }


    //----------------------------------
    // ☆更新
    //----------------------------------

    updateWinStars();


    //----------------------------------
    // 戦闘終了状態
    //----------------------------------

    game.state =
        TURN_STATE.END;


    //----------------------------------
    // 各種操作を停止
    //----------------------------------

    closeEnemyCoolModal();
    closeCoolModal();

    closeHandModal();
    closeSummonActionModal();
    closeCostView();

    resetAttackState();


    //----------------------------------
    // ターン終了ボタン停止
    //----------------------------------

    const endTurnButton =
        document.getElementById(
            "endturn-button"
        );


    if(endTurnButton){

        endTurnButton.disabled = true;

    }


    //----------------------------------
    // 2勝達成
    //----------------------------------

    if(
        playerWins >= 2 ||
        enemyWins >= 2
    ){

        finishMatch(
            winner
        );

        return;

    }


    //----------------------------------
    // 戦績表示
    //----------------------------------

    showMatchResult(
        winner
    );


    //----------------------------------
    // 次の戦闘開始
    //----------------------------------

    setTimeout(()=>{

        hideMatchResult();

        startNextGame();

    }, 2000);

}

//======================================
// 対戦終了
//======================================



function finishMatch(winner){

    console.log(
        "対戦終了",
        winner === PLAYER
            ? "PLAYER WIN"
            : "CPU WIN"
    );

    //----------------------------------
    // 次のゲームの先攻を決定
    // 今回の敗者が次のゲームの先攻
    //----------------------------------

    setNextFirstPlayer(winner);


    //----------------------------------
    // ゲーム終了
    //----------------------------------

    game.state =
        TURN_STATE.END;


    //----------------------------------
    // モーダルを閉じる
    //----------------------------------

    closeEnemyCoolModal();
    closeCoolModal();

    closeHandModal();
    closeSummonActionModal();
    closeCostView();

    resetAttackState();


    //----------------------------------
    // ターン終了ボタン停止
    //----------------------------------

    const endTurnButton =
        document.getElementById(
            "endturn-button"
        );


    if(endTurnButton){

        endTurnButton.disabled = true;

    }


    //----------------------------------
    // 最終結果表示
    //----------------------------------

    const overlay =
        document.getElementById(
            "match-result-overlay"
        );

    const title =
        document.getElementById(
            "match-result-title"
        );

    const score =
        document.getElementById(
            "match-result-score"
        );


    if(overlay && title && score){

        title.textContent =
            winner === PLAYER
            ? "MATCH WIN"
            : "MATCH LOSS";


        score.textContent =
            `${playerWins} - ${enemyWins}`;


        overlay.classList.add(
            "show"
        );

    }

}


//======================================
// 次のゲーム開始
//======================================

function startNextGame(){

    console.log(
        "===== 次の戦闘開始 ====="
    );


    //----------------------------------
    // 次のゲーム番号へ
    //----------------------------------

    matchGameNumber++;


    //----------------------------------
    // 次のゲームの先攻を決定
    //----------------------------------

    decideFirstPlayerForMatch();


    console.log(
        "第" +
        matchGameNumber +
        "戦",
        "先攻:",
        firstPlayer,
        "後攻:",
        secondPlayer
    );


    //----------------------------------
    // モーダル
    //----------------------------------

    closeEnemyCoolModal();
    closeCoolModal();
    closeHandModal();
    closeSummonActionModal();
    closeCostView();


    //----------------------------------
    // 選択状態
    //----------------------------------

    clearHandSelection();
    clearFieldSelection();
    resetAttackState();

    selectedHandCard = null;
    summonCard = null;
    selectedCostCards = [];
    costConfirm = false;
    selectedSummon = null;
    selectedFieldCard = null;
    selectedEnemySummon = null;
    selectedCoolCard = null;


    //----------------------------------
    // ターン状態
    //----------------------------------

    summonUsedThisTurn = false;

    coolRecoveryMode = false;
    coolViewMode = false;

    currentCoolOwner = PLAYER;


    //----------------------------------
    // レジスト状態
    //----------------------------------

    resistMode = false;
    resistEvent = null;
    selectableResistCards = [];

    resistUsingCard = null;
    selectedResistCostCards = [];
    resistCostConfirm = false;


    //----------------------------------
    // ターン演出
    //----------------------------------

    turnAnimation = false;


    //----------------------------------
    // ゲーム状態
    //----------------------------------

    game.turn = 0;


    //----------------------------------
    // ★ 先攻プレイヤーを設定
    //----------------------------------

    game.currentPlayer =
        firstPlayer;


    game.state =
        TURN_STATE.START;


    //----------------------------------
    // LIFEリセット
    //----------------------------------

    game.playerLife = 5;
    game.enemyLife = 5;


    //----------------------------------
    // 1戦分の盤面を完全初期化
    //----------------------------------

    setupGame();


    //----------------------------------
    // 対戦全体の勝利数は維持
    //----------------------------------

    updateWinStars();


    //----------------------------------
    // LIFE表示
    //----------------------------------

    updateLifeDisplay();


    //----------------------------------
    // 次のゲーム開始
    //----------------------------------

    if(
        game.currentPlayer === PLAYER
    ){

        //----------------------------------
        // PLAYER先攻
        //----------------------------------

        startTurn();

    }else{

        //----------------------------------
        // CPU先攻
        //----------------------------------

        startCpuTurn();

    }

}


//======================================
// 次の開始手札を生成
// usedIds に含まれるカードを除外
//======================================

function createNextStartingHand(
    deck,
    usedIds
){

    //----------------------------------
    // 使用済みカードを除外
    //----------------------------------

    const availableCards =
        deck.filter(
            card =>
                !usedIds.includes(card.id)
        );


    //----------------------------------
    // 残りカードをシャッフル
    //----------------------------------

    const shuffled =
        [...availableCards].sort(
            () => Math.random() - 0.5
        );


    //----------------------------------
    // 10枚取得
    //----------------------------------

    const hand =
        shuffled.slice(0, 10);


    //----------------------------------
    // 今回の開始手札を使用済みに追加
    //----------------------------------

    hand.forEach(
        card =>
            usedIds.push(card.id)
    );


    return hand;

}

//======================================
// マッチ結果表示
//======================================

function showMatchResult(winner){

    const overlay =
        document.getElementById(
            "match-result-overlay"
        );

    const title =
        document.getElementById(
            "match-result-title"
        );

    const score =
        document.getElementById(
            "match-result-score"
        );


    if(!overlay || !title || !score){

        return;

    }


    //----------------------------------
    // 勝者表示
    //----------------------------------

    if(winner === PLAYER){

        title.textContent =
            "PLAYER WIN";

    }else{

        title.textContent =
            "CPU WIN";

    }


    //----------------------------------
    // マッチスコア
    //----------------------------------

    score.textContent =
        `${playerWins} - ${enemyWins}`;


    //----------------------------------
    // 表示
    //----------------------------------

    overlay.classList.add(
        "show"
    );

}


function hideMatchResult(){

    const overlay =
        document.getElementById(
            "match-result-overlay"
        );


    if(!overlay){

        return;

    }


    overlay.classList.remove(
        "show"
    );

}