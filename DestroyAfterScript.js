#pragma strict
var destroyAfter : float = 0.2;

function Update () {
	Destroy (gameObject, destroyAfter);
}