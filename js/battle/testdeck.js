//==================================================
// テスト用プレイヤー手札
//==================================================

/*function createTestHand(){

    const ids = [
        1,9,27,32,
        26,4,5,
        6,7,8,
    ];

    const hand = [];

    for(const id of ids){

        const cardData =
        CARD_LIST.find(
            card => card.id === id
        );

        if(cardData){

            hand.push(
                createCard(
                    cardData,
                    "hand",
                    PLAYER
                )
            );

        }

    }

    return hand;
}

//==================================================
// テスト用CPU手札
//==================================================

function createEnemyTestHand(){

    const ids = [
        27,3,6,7,
        1,32,31,30,
        31,32
    ];

    const hand = [];

    for(const id of ids){

        const cardData =
        CARD_LIST.find(
            card => card.id === id
        );

        if(cardData){

            hand.push(
                createCard(
                    cardData,
                    "enemyHand",
                    ENEMY
                )
            );

        }

    }

    return hand;
}*/

//======================================
// ランダムカードID取得
//======================================

function getRandomCardIds(
    count = 10,
    excludeIds = []
){

    //----------------------------------
    // 1～32
    //----------------------------------

    const ids = [];

    for(let i = 1; i <= 32; i++){

        //----------------------------------
        // 使用済みカードは除外
        //----------------------------------

        if(
            excludeIds.includes(i)
        ){

            continue;

        }

        ids.push(i);

    }


    //----------------------------------
    // シャッフル
    //----------------------------------

    for(
        let i = ids.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            ids[i],
            ids[j]
        ] =
        [
            ids[j],
            ids[i]
        ];

    }


    //----------------------------------
    // 指定枚数取得
    //----------------------------------

    return ids.slice(
        0,
        count
    );

}


//======================================
// プレイヤー初期手札
//======================================

function createTestHand(){

    const ids =
        getRandomCardIds(
            10,
            playerStartingCardIds
        );

    console.log(
        "★ プレイヤー初期手札ID",
        ids
    );


    const hand = [];


    //----------------------------------
    // カード作成
    //----------------------------------

    ids.forEach(id=>{

        const cardData =
            CARD_LIST.find(
                card => card.id === id
            );


        if(!cardData){

            console.warn(
                "プレイヤーカードが見つかりません",
                id
            );

            return;

        }


        const card =
            createCard(
                cardData,
                "hand",
                PLAYER
            );


        hand.push(card);

    });


    //----------------------------------
    // 今回の開始手札を記録
    //----------------------------------

    playerStartingCardIds.push(
        ...ids
    );


    return hand;

}


//======================================
// CPU初期手札
//======================================

function createEnemyTestHand(){

    const ids =
        getRandomCardIds(
            10,
            enemyStartingCardIds
        );

    console.log(
        "★ CPU初期手札ID",
        ids
    );


    const hand = [];


    //----------------------------------
    // カード作成
    //----------------------------------

    ids.forEach(id=>{

        const cardData =
            CARD_LIST.find(
                card => card.id === id
            );


        if(!cardData){

            console.warn(
                "CPUカードが見つかりません",
                id
            );

            return;

        }


        const card =
            createCard(
                cardData,
                "enemyHand",
                ENEMY
            );


        hand.push(card);

    });


    //----------------------------------
    // 今回の開始手札を記録
    //----------------------------------

    enemyStartingCardIds.push(
        ...ids
    );


    return hand;

}