//======================================
// cool.js
// クールゾーン処理
//======================================


//======================================
// クールゾーンへ送る
//======================================

function moveToCool(card){

    board.removeHandCard(card);

    addCardToCool(card);

}


//======================================
// クールゾーンを開く
//======================================

function openCoolView(){

    const modal =
        document.getElementById(
            "cool-modal"
        );


    const list =
        document.getElementById(
            "cool-list"
        );


    list.innerHTML = "";



    board.coolCards.forEach(card=>{


        const image =
            document.createElement("img");


        image.src =
            card.image;


        image.className =
            "cool-card";



        image.onclick = ()=>{


            //----------------------------------
            // 閲覧モード
            //----------------------------------

            if(!coolRecoveryMode){

                return;

            }



            document
            .querySelectorAll(".cool-card.selected")
            .forEach(element=>{

                element.classList.remove(
                    "selected"
                );

            });



            image.classList.add(
                "selected"
            );



            selectedCoolCard = card;



            console.log(
                "回収選択:",
                selectedCoolCard
            );


        };



        list.appendChild(image);


    });



    modal.style.display =
        "block";

}

//======================================
// クール追加共通処理
//======================================

function addCardToCool(card){

    if(!card){

        return;

    }


    //----------------------------------
    // サモン状態をリセット
    //----------------------------------

    const summon =
        playerField.find(
            summon =>
                summon.card === card
        )
        ||
        enemyField.find(
            summon =>
                summon.card === card
        );


    if(summon){

        resetSummonState(
            summon
        );

    }


    //----------------------------------
    // カード状態
    //----------------------------------

    card.setFaceDown(true);

    card.setSelected(false);

    card.area = "cool";


    //----------------------------------
    // クールゾーンへ追加
    //----------------------------------

    board.addCoolCard(
        card
    );


    //----------------------------------
    // クールモーダル更新
    //----------------------------------

    refreshCoolModal();

}

function recoverEnemyCoolCard(){


    console.log(
        "回収前",
        board.enemyCoolCards
    );


    if(
        board.enemyCoolCards.length === 0
    ){

        console.log(
            "CPUクールなし"
        );

        return;

    }


    const card =
    board.enemyCoolCards.shift();



    console.log(
        "回収カード",
        card.name
    );


    card.area =
    "enemyHand";


    card.setFaceDown(false);


    enemyHandCards.push(
        card
    );


    console.log(
        "回収後",
        board.enemyCoolCards
    );


    updateEnemyZoneDisplay();
    board.updateCoolCount();
    refreshCoolModal();

}

//======================================
// サモン状態リセット
//======================================

function resetSummonState(summon){

    if(!summon){

        return;

    }


    //----------------------------------
    // 戦闘データ
    //----------------------------------

    summon.damage = 0;

    summon.powerBonus = 0;

    summon.damageBonus = 0;

    summon.destroyed = false;

    summon.isRest = false;

    summon.attackReady = false;

    summon.status = [];


    //----------------------------------
    // 表示状態
    //----------------------------------

    summon.view.setHorizontal(
        false
    );

    summon.view.setSelected(
        false
    );

    summon.view.setHighlight(
        false
    );


    //----------------------------------
    // 現在パワー表示を更新
    //----------------------------------

    summon.view.updateCurrentPower(
        summon
    );


    //----------------------------------
    // 攻撃対象状態
    //----------------------------------

    summon.view.fieldSelected = false;

    summon.view.target = false;

}