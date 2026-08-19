function resizeGame(){

    const game =
        document.getElementById(
            "battle-screen"
        );

    const container =
        document.getElementById(
            "game-container"
        );

    if(!game || !container){
        return;
    }


    //----------------------------------
    // 基準サイズ
    //----------------------------------

    const baseWidth = 1280;
    const baseHeight = 720;


    //----------------------------------
    // 表示倍率
    //----------------------------------

    const scale =
        Math.min(
            window.innerWidth / baseWidth,
            window.innerHeight / baseHeight
        ) * 1;



    //----------------------------------
    // ゲーム画面
    //----------------------------------

    game.style.transform =
        `
        translate(-50%, -50%)
        scale(${scale})
        `;


    //----------------------------------
    // 基準サイズを維持
    //----------------------------------

    game.style.width =
        `${baseWidth}px`;

    game.style.height =
        `${baseHeight}px`;
}

window.addEventListener(
    "resize",
    resizeGame
);

window.addEventListener(
    "orientationchange",
    resizeGame
);


resizeGame();