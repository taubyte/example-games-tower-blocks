import { BoxGeometry, Matrix4, Mesh, MeshToonMaterial, Vector3 } from 'three';

export class Block {
  private mesh: Mesh;
  private material: MeshToonMaterial;
  private position: Vector3 = new Vector3();

  constructor(width: number, height: number, depth: number) {
    const geometry = new BoxGeometry(width, height, depth);

    geometry.applyMatrix4(
      new Matrix4().makeTranslation(width / 2, height / 2, depth / 2),
    );

    this.material = new MeshToonMaterial({
      color: 0x333344,
    });

    this.mesh = new Mesh(geometry, this.material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }

  public getMesh() {
    return this.mesh;
  }
}
