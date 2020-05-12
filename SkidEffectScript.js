#pragma strict
var skidAt : float = 0.75;
var smoke : GameObject;
var sound : GameObject;
var material : Material;
var skidMarkWidth : float = 0.2;
var destroyAfter : float = 5;

private var curFriction : float;
private var isSkidding : int;
private var lastPos : Vector3[] = new Vector3[2];

function Update () {
	var hit : WheelHit;
	var skidPos : Vector3 = new Vector3 (transform.position.x, transform.position.y - (gameObject.GetComponent (WheelCollider).radius + (gameObject.GetComponent (WheelCollider).suspensionDistance / 2)), transform.position.z);
	var rpm : float = gameObject.GetComponent (WheelCollider).rpm;
	gameObject.GetComponent (WheelCollider).GetGroundHit (hit);
	curFriction = Mathf.Abs (hit.sidewaysSlip);
	
	if (curFriction >= skidAt || rpm < 300 && Input.GetAxis ("Vertical") > 0) {
		smoke.GetComponent.<ParticleEmitter>().emit = true;
		Instantiate (sound, skidPos, new Quaternion (0, 0, 0, 0));
		SkidMarkEffect ();
	} else {
		smoke.GetComponent.<ParticleEmitter>().emit = false;
		isSkidding = 0;
	}
	
	smoke.transform.position = skidPos;
}

function SkidMarkEffect () {
	var hit : WheelHit;
	var skidMark : GameObject = new GameObject ("Skid Mark");
	var skidMarkMesh : Mesh = new Mesh ();
	var skidMarkMeshVertices : Vector3[] = new Vector3[4];
	var skidMarkMeshTriangles : int[] = new int[6];
	gameObject.GetComponent (WheelCollider).GetGroundHit (hit);
	skidMark.AddComponent (MeshFilter);
	skidMark.AddComponent (MeshRenderer);
	skidMarkMesh.name = "Skid Mark Mesh";
	
	if (isSkidding == 0) {
		skidMarkMeshVertices[0] = hit.point + Quaternion.Euler (transform.eulerAngles.x, transform.eulerAngles.y, transform.eulerAngles.z) * Vector3 ( skidMarkWidth, 0.01, 0);
		skidMarkMeshVertices[1] = hit.point + Quaternion.Euler (transform.eulerAngles.x, transform.eulerAngles.y, transform.eulerAngles.z) * Vector3 (-skidMarkWidth, 0.01, 0);
		skidMarkMeshVertices[2] = hit.point + Quaternion.Euler (transform.eulerAngles.x, transform.eulerAngles.y, transform.eulerAngles.z) * Vector3 (-skidMarkWidth, 0.01, 0);
		skidMarkMeshVertices[3] = hit.point + Quaternion.Euler (transform.eulerAngles.x, transform.eulerAngles.y, transform.eulerAngles.z) * Vector3 ( skidMarkWidth, 0.01, 0);
		lastPos[0] = skidMarkMeshVertices[2];
		lastPos[1] = skidMarkMeshVertices[3];
		isSkidding = 1;
	} else {
		skidMarkMeshVertices[0] = lastPos[1];
		skidMarkMeshVertices[1] = lastPos[0];
		skidMarkMeshVertices[2] = hit.point + Quaternion.Euler (transform.eulerAngles.x, transform.eulerAngles.y, transform.eulerAngles.z) * Vector3 (-skidMarkWidth, 0.01, 0);
		skidMarkMeshVertices[3] = hit.point + Quaternion.Euler (transform.eulerAngles.x, transform.eulerAngles.y, transform.eulerAngles.z) * Vector3 ( skidMarkWidth, 0.01, 0);
		lastPos[0] = skidMarkMeshVertices[2];
		lastPos[1] = skidMarkMeshVertices[3];
	}
	
	skidMarkMeshTriangles = [0, 1, 2, 2, 3, 0];
	skidMarkMesh.vertices  = skidMarkMeshVertices;
	skidMarkMesh.triangles = skidMarkMeshTriangles;
	skidMark.GetComponent (MeshFilter).mesh = skidMarkMesh;
	skidMark.GetComponent (Renderer).material = material;
	skidMark.AddComponent (DestroyAfterScript);
	skidMark.GetComponent (DestroyAfterScript).destroyAfter = destroyAfter;
}