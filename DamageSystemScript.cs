using UnityEngine;
using System.Collections;

public class DamageSystemScript : MonoBehaviour {
	public float maxMoveDelta = 1;
	public float maxCollisionStrength = 30;
	public float yForceDamp = 0.3f;
	public float demolutionRange = 0.6f;
	public float impactDirManipulator = 0.75f;
	public MeshFilter[] optionalMeshList;

	private MeshFilter[] meshFilters;
	private float sqrDemRange;

	void Start () {
		if (optionalMeshList.Length > 0)
			meshFilters = optionalMeshList;
		else
			meshFilters = GetComponentsInChildren<MeshFilter>();

			sqrDemRange = demolutionRange * demolutionRange;
	}
	
	void OnCollisionEnter (Collision hit) {
		Vector3 colRelVel = hit.relativeVelocity;
		colRelVel *= yForceDamp;
		Vector3 colPointToMe = transform.position - hit.contacts[0].point;
		float colStrength = colRelVel.magnitude * Vector3.Dot (hit.contacts[0].normal, colPointToMe.normalized);
		OnMeshForce (hit.contacts[0].point, Mathf.Clamp01 (colStrength / maxCollisionStrength));
	}

	void OnMeshForce (Vector4 originPosAndForce) {
		OnMeshForce ((Vector3) originPosAndForce, originPosAndForce.w);
	}

	void OnMeshForce (Vector3 originPos, float force) {
		force = Mathf.Clamp01 (force);

		for (int j = 0; j < meshFilters.Length; ++j) {
			Vector3[] verts = meshFilters[j].mesh.vertices;

			for (int i = 0; i < verts.Length; ++i) {
				Vector3 scaledVert = Vector3.Scale (verts[i], transform.localScale);
				Vector3 vertWorldPos = meshFilters[j].transform.position + (meshFilters[j].transform.rotation * scaledVert);
				Vector3 originToMeDir = vertWorldPos - originPos;
				Vector3 flatVertToCenterDir = transform.position - vertWorldPos;
				flatVertToCenterDir.y = 0;

				if (originToMeDir.sqrMagnitude < sqrDemRange) {
					float dist = Mathf.Clamp01 (originToMeDir.sqrMagnitude / sqrDemRange);
					float moveDelta = force * (1 - dist) * maxMoveDelta;
					Vector3 moveDir = Vector3.Slerp (originToMeDir, flatVertToCenterDir, impactDirManipulator).normalized * moveDelta;
					verts[i] += Quaternion.Inverse (transform.rotation) * moveDir;
				}
			}

			meshFilters[j].mesh.vertices = verts;
			meshFilters[j].mesh.RecalculateBounds ();
		}
	}
}