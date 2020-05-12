#pragma strict
var IsQuit : boolean = false;

function OnMouseEnter (){
    //Change Text Color
    renderer.material.color = Color.red;
}

function OnMouseExit (){
    //Change Text Color When Mouse Exit
    renderer.material.color = Color.white;
}

function OnMouseUp (){
    if(IsQuit){
        Application.Quit();
    }
    else{
        Application.LoadLevel(1);
    }
}